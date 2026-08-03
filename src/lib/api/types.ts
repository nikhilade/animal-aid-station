/** Shared API envelope + domain types. */

export type ApiErrorPayload = {
  code: string;
  message: string;
  data: Record<string, unknown>;
} | null;

export interface ApiMeta {
  total_count: number;
  has_next_page: boolean;
  next_cursor: string | null;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export const ROLES = [
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "RECEPTIONIST",
  "DOCTOR",
  "LAB_TECH",
  "PHARMACIST",
  "GROOMER",
  "BILLING_STAFF",
  "PET_OWNER",
] as const;

export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface PetOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pets_count: number;
  created_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  species: "Dog" | "Cat" | "Bird" | "Rabbit";
  breed: string;
  sex: "Male" | "Female";
  age_years: number;
  weight_kg: number;
  photo_url: string | null;
  microchip_id: string | null;
  allergies?: string;
  color?: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available_slots: string[];
}

export interface AppointmentSlot {
  start_at: string;
  available: boolean;
}

export type AppointmentStatus = "SCHEDULED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: string;
  pet_id: string;
  pet_name: string;
  owner_id: string;
  owner_name: string;
  doctor_id: string;
  doctor_name: string;
  service: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string;
}

export interface Prescription {
  id: string;
  pet_id: string;
  pet_name: string;
  doctor_name: string;
  medication: string;
  dosage: string;
  instructions: string;
  issued_at: string;
  refills_left: number;
}

export type InvoiceStatus = "PAID" | "DUE" | "OVERDUE";

export interface Invoice {
  id: string;
  number: string;
  owner_id: string;
  owner_name: string;
  amount: number;
  status: InvoiceStatus;
  issued_at: string;
  due_at: string;
  items: { label: string; amount: number }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorder_level: number;
  unit_price: number;
}

export interface DashboardStats {
  appointments_today: number;
  active_patients: number;
  revenue_month: number;
  pending_invoices: number;
  low_stock_items: number;
  upcoming: Appointment[];
}

export interface OwnerDocument {
  id: string;
  owner_id: string;
  name: string;
  type: "ID Proof" | "Consent Form" | "Insurance" | "Lab Report" | "Other";
  size_kb: number;
  uploaded_at: string;
}

export interface CommunicationLog {
  id: string;
  owner_id: string;
  channel: "SMS" | "Email" | "Call" | "WhatsApp";
  subject: string;
  body: string;
  direction: "OUTBOUND" | "INBOUND";
  sent_at: string;
}

export interface MedicalEvent {
  id: string;
  pet_id: string;
  type: "VISIT" | "VACCINE" | "LAB" | "SURGERY" | "PRESCRIPTION" | "GROOMING";
  title: string;
  detail: string;
  doctor_name: string;
  occurred_at: string;
}

export interface Vaccine {
  id: string;
  pet_id: string;
  pet_name: string;
  owner_id: string;
  owner_name: string;
  vaccine_name: string;
  batch_no: string;
  vaccination_date: string;
  next_due_date: string;
  administered_by: string;
}
