/**
 * Central endpoint map — the ONLY place URLs live.
 *
 * Switching from mocks to the real backend:
 *   1. set VITE_API_BASE_URL="https://api.example.com"
 *   2. delete src/lib/mock/*  (and the mock import in src/lib/api-client.ts)
 * No component changes required.
 */
export const endpoints = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  petOwners: {
    list: "/pet-owners",
    search: "/pet-owners/search",
    detail: (id: string) => `/pet-owners/${id}`,
    create: "/pet-owners",
  },
  pets: {
    list: "/pets",
    detail: (id: string) => `/pets/${id}`,
    create: "/pets",
    byOwner: (ownerId: string) => `/pet-owners/${ownerId}/pets`,
  },
  doctors: {
    list: "/doctors",
    detail: (id: string) => `/doctors/${id}`,
  },
  appointments: {
    list: "/appointments",
    detail: (id: string) => `/appointments/${id}`,
    create: "/appointments",
    mine: "/appointments/mine",
  },
  prescriptions: {
    list: "/prescriptions",
    mine: "/prescriptions/mine",
  },
  invoices: {
    list: "/invoices",
    detail: (id: string) => `/invoices/${id}`,
    mine: "/invoices/mine",
  },
  inventory: {
    list: "/inventory",
  },
  reports: {
    overview: "/reports/overview",
  },
  dashboard: {
    staff: "/dashboard/staff",
    portal: "/dashboard/portal",
  },
} as const;
