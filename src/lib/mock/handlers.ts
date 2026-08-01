import type { ApiResponse, LoginResponse, Role } from "../api/types";
import { ROLES } from "../api/types";
import { endpoints } from "../api/endpoints";
import {
  appointments,
  doctors,
  inventory,
  invoices,
  owners,
  pets,
  prescriptions,
  roleByEmailPrefix,
  staffDashboard,
} from "./data";

/** Mock layer. Never import this from components — always go through api-client. */

function envelope<T>(data: T, overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
  const count = Array.isArray(data) ? data.length : 1;
  return {
    success: true,
    data,
    error: null,
    meta: { total_count: count, has_next_page: false, next_cursor: null, limit: 50 },
    ...overrides,
  };
}

/** Cursor-based pagination for list endpoints (?cursor=&limit=). */
function paginate<T>(all: T[], query: URLSearchParams): ApiResponse<T[]> {
  const limit = Math.max(1, Number(query.get("limit") ?? 10));
  const start = Number(query.get("cursor") ?? 0) || 0;
  const slice = all.slice(start, start + limit);
  const next = start + limit;
  const hasNext = next < all.length;
  return {
    success: true,
    data: slice,
    error: null,
    meta: {
      total_count: all.length,
      has_next_page: hasNext,
      next_cursor: hasNext ? String(next) : null,
      limit,
    },
  };
}

function failure(code: string, message: string): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: { code, message, data: {} },
    meta: { total_count: 0, has_next_page: false, next_cursor: null, limit: 50 },
  };
}

function base64url(value: string) {
  const b64 = typeof btoa === "function" ? btoa(value) : Buffer.from(value).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createMockJwt(payload: Record<string, unknown>) {
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = base64url(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }),
  );
  return `${header}.${body}.mock-signature`;
}

function roleFromEmail(email: string, requested?: string): Role {
  if (requested && (ROLES as readonly string[]).includes(requested)) return requested as Role;
  const prefix = email.split("@")[0]?.toLowerCase() ?? "";
  for (const [key, role] of Object.entries(roleByEmailPrefix)) {
    if (prefix.startsWith(key)) return role;
  }
  return "PET_OWNER";
}

function login(body: Record<string, unknown>): ApiResponse<LoginResponse> | ApiResponse<null> {
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  if (!email || password.length < 4) {
    return failure("INVALID_CREDENTIALS", "Email and password (min 4 characters) are required.");
  }
  const role = roleFromEmail(email, body.role as string | undefined);
  const name =
    (body.name as string | undefined) ||
    email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const user = { id: `usr_${email.length}${role.length}`, name, email, role, avatar_url: null };
  return envelope({ token: createMockJwt({ sub: user.id, email, role }), user });
}

const currentOwnerId = "own_1";

type Handler = (ctx: {
  method: string;
  body: Record<string, unknown>;
  query: URLSearchParams;
}) => ApiResponse<unknown>;

const routes: { pattern: RegExp; handler: Handler }[] = [
  { pattern: new RegExp(`^${endpoints.auth.login}$`), handler: ({ body }) => login(body) },
  { pattern: new RegExp(`^${endpoints.auth.signup}$`), handler: ({ body }) => login(body) },
  {
    pattern: new RegExp(`^${endpoints.auth.logout}$`),
    handler: () => envelope({ ok: true }),
  },
  {
    pattern: /^\/pet-owners\/([^/]+)\/pets$/,
    handler: ({ query }) => {
      const ownerId = query.get("__p1")!;
      return envelope(pets.filter((p) => p.owner_id === ownerId));
    },
  },
  {
    pattern: /^\/pet-owners\/search$/,
    handler: ({ query }) => {
      const q = (query.get("q") ?? "").trim().toLowerCase();
      const digits = q.replace(/\D/g, "");
      const matches = !q
        ? owners.slice(0, 5)
        : owners.filter(
            (o) =>
              (digits.length >= 2 && o.phone.replace(/\D/g, "").includes(digits)) ||
              o.name.toLowerCase().includes(q) ||
              o.email.toLowerCase().includes(q),
          );
      return envelope(matches);
    },
  },
  {
    pattern: /^\/pet-owners\/([^/]+)$/,
    handler: ({ query }) => {
      const found = owners.find((o) => o.id === query.get("__p1"));
      return found ? envelope(found) : failure("NOT_FOUND", "Pet owner not found.");
    },
  },
  {
    pattern: /^\/pet-owners$/,
    handler: ({ method, body, query }) => {
      if (method === "POST") {
        const phone = String(body.phone ?? "");
        const existing = owners.find((o) => o.phone.replace(/\D/g, "") === phone.replace(/\D/g, "") && phone !== "");
        if (existing) return envelope(existing);
        const created = {
          id: `own_${owners.length + 1}`,
          name: String(body.name ?? "New Owner"),
          email: String(body.email ?? ""),
          phone,
          address: String(body.address ?? ""),
          pets_count: 0,
          created_at: new Date().toISOString(),
        };
        owners.push(created);
        return envelope(created);
      }
      return paginate(owners, query);
    },
  },
  {
    pattern: /^\/pets\/([^/]+)$/,
    handler: ({ query }) => {
      const found = pets.find((p) => p.id === query.get("__p1"));
      return found ? envelope(found) : failure("NOT_FOUND", "Pet not found.");
    },
  },
  {
    pattern: /^\/pets$/,
    handler: ({ method, body, query }) => {
      if (method === "POST") {
        const owner = owners.find((o) => o.id === body.owner_id) ?? owners[0];
        const created = {
          id: `pet_${pets.length + 1}`,
          owner_id: owner.id,
          owner_name: owner.name,
          name: String(body.name ?? "New Pet"),
          species: (body.species as "Dog") ?? "Dog",
          breed: String(body.breed ?? "Mixed"),
          sex: (body.sex as "Male") ?? "Male",
          age_years: Number(body.age_years ?? 1),
          weight_kg: Number(body.weight_kg ?? 5),
          photo_url: null,
          microchip_id: null,
        };
        pets.push(created);
        owner.pets_count += 1;
        return envelope(created);
      }
      const ownerId = query.get("owner_id");
      return envelope(ownerId ? pets.filter((p) => p.owner_id === ownerId) : pets);
    },
  },
  {
    pattern: /^\/doctors\/([^/]+)$/,
    handler: ({ query }) => {
      const found = doctors.find((d) => d.id === query.get("__p1"));
      return found ? envelope(found) : failure("NOT_FOUND", "Doctor not found.");
    },
  },
  { pattern: /^\/doctors$/, handler: () => envelope(doctors) },
  { pattern: /^\/appointments\/mine$/, handler: () => envelope(appointments.filter((a) => a.owner_id === currentOwnerId)) },
  {
    pattern: /^\/appointments\/slots\/available$/,
    handler: ({ query }) => {
      const date = query.get("date") ?? new Date().toISOString().slice(0, 10);
      const doctorId = query.get("doctor_id") ?? "doc_1";
      const branchId = query.get("branch_id") ?? "br_1";
      const seedBase = [...`${doctorId}${branchId}${date}`].reduce((a, c) => a + c.charCodeAt(0), 0);
      const slots: { start_at: string; available: boolean }[] = [];
      for (let h = 9; h < 18; h++) {
        for (const m of [0, 30]) {
          const start = new Date(`${date}T00:00:00`);
          start.setHours(h, m, 0, 0);
          const idx = (h - 9) * 2 + (m === 30 ? 1 : 0);
          const booked = (seedBase + idx * 7) % 4 === 0 || start.getTime() < Date.now();
          slots.push({ start_at: start.toISOString(), available: !booked });
        }
      }
      return envelope(slots);
    },
  },
  {
    pattern: /^\/appointments\/([^/]+)$/,
    handler: ({ query }) => {
      const found = appointments.find((a) => a.id === query.get("__p1"));
      return found ? envelope(found) : failure("NOT_FOUND", "Appointment not found.");
    },
  },
  {
    pattern: /^\/appointments$/,
    handler: ({ method, body }) => {
      if (method === "POST") {
        const pet = pets.find((p) => p.id === body.pet_id) ?? pets[0];
        const doctor = doctors.find((d) => d.id === body.doctor_id) ?? doctors[0];
        const created = {
          id: `apt_${appointments.length + 1}`,
          pet_id: pet.id,
          pet_name: pet.name,
          owner_id: pet.owner_id,
          owner_name: pet.owner_name,
          doctor_id: doctor.id,
          doctor_name: doctor.name,
          service: String(body.service ?? "Consultation"),
          scheduled_at: String(body.scheduled_at ?? new Date().toISOString()),
          status: "SCHEDULED" as const,
          notes: String(body.notes ?? ""),
        };
        appointments.push(created);
        return envelope(created);
      }
      return envelope(appointments);
    },
  },
  { pattern: /^\/prescriptions\/mine$/, handler: () => envelope(prescriptions.filter((p) => ["pet_1", "pet_2"].includes(p.pet_id))) },
  { pattern: /^\/prescriptions$/, handler: () => envelope(prescriptions) },
  { pattern: /^\/invoices\/mine$/, handler: () => envelope(invoices.filter((i) => i.owner_id === currentOwnerId)) },
  {
    pattern: /^\/invoices\/([^/]+)$/,
    handler: ({ query }) => {
      const found = invoices.find((i) => i.id === query.get("__p1"));
      return found ? envelope(found) : failure("NOT_FOUND", "Invoice not found.");
    },
  },
  { pattern: /^\/invoices$/, handler: () => envelope(invoices) },
  { pattern: /^\/inventory$/, handler: () => envelope(inventory) },
  {
    pattern: /^\/reports\/overview$/,
    handler: () =>
      envelope({
        revenue_by_month: [
          { month: "Aug", revenue: 38200 },
          { month: "Sep", revenue: 41100 },
          { month: "Oct", revenue: 39750 },
          { month: "Nov", revenue: 45300 },
          { month: "Dec", revenue: 48210 },
        ],
        appointments_by_service: [
          { service: "Veterinary", count: 128 },
          { service: "Grooming", count: 74 },
          { service: "Boarding", count: 41 },
          { service: "Training", count: 22 },
        ],
      }),
  },
  { pattern: /^\/dashboard\/staff$/, handler: () => envelope(staffDashboard) },
  {
    pattern: /^\/dashboard\/portal$/,
    handler: () =>
      envelope({
        pets: pets.filter((p) => p.owner_id === currentOwnerId),
        next_appointment:
          appointments.find((a) => a.owner_id === currentOwnerId && a.status !== "COMPLETED") ?? null,
        open_invoices: invoices.filter((i) => i.owner_id === currentOwnerId && i.status !== "PAID").length,
        active_prescriptions: prescriptions.filter((p) => ["pet_1", "pet_2"].includes(p.pet_id)).length,
      }),
  },
];

export async function handleMockRequest(
  path: string,
  method: string,
  body: Record<string, unknown>,
  search: URLSearchParams,
): Promise<ApiResponse<unknown>> {
  await new Promise((r) => setTimeout(r, 180));
  for (const route of routes) {
    const match = route.pattern.exec(path);
    if (!match) continue;
    const query = new URLSearchParams(search);
    match.slice(1).forEach((value, i) => query.set(`__p${i + 1}`, value));
    return route.handler({ method, body, query });
  }
  return failure("NOT_FOUND", `No mock handler for ${method} ${path}`);
}
