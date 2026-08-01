import { Link, useNavigate } from "@tanstack/react-router";
import {
  PawPrint,
  LayoutDashboard,
  Users,
  Dog,
  CalendarDays,
  Receipt,
  Boxes,
  BarChart3,
  Stethoscope,
  FlaskConical,
  Pill,
  Scissors,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { authStore, useAuth } from "@/lib/auth/store";
import { can, roleLabels, type Permission } from "@/lib/auth/permissions";
import { RequireAuth } from "./RequireAuth";

const navItems: { to: string; label: string; icon: typeof Users; permission: Permission }[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "staff:access" },
  { to: "/app/owners", label: "Pet Owners", icon: Users, permission: "owners:read" },
  { to: "/app/pets", label: "Pets", icon: Dog, permission: "pets:read" },
  { to: "/app/appointments", label: "Appointments", icon: CalendarDays, permission: "appointments:read" },
  { to: "/app/doctors", label: "Doctors", icon: Stethoscope, permission: "doctors:read" },
  { to: "/app/lab", label: "Laboratory", icon: FlaskConical, permission: "lab:read" },
  { to: "/app/pharmacy", label: "Pharmacy", icon: Pill, permission: "pharmacy:read" },
  { to: "/app/grooming", label: "Grooming", icon: Scissors, permission: "grooming:read" },
  { to: "/app/billing", label: "Billing", icon: Receipt, permission: "billing:read" },
  { to: "/app/inventory", label: "Inventory", icon: Boxes, permission: "inventory:read" },
  { to: "/app/reports", label: "Reports", icon: BarChart3, permission: "reports:read" },
  { to: "/app/settings", label: "Settings", icon: Settings, permission: "settings:write" },
];

export function StaffLayout({
  title,
  subtitle,
  children,
  permission = "staff:access",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  permission?: Permission;
}) {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = navItems.filter((i) => can(role, i.permission));

  return (
    <RequireAuth permission={permission}>
      <div className="min-h-screen bg-sand lg:flex">
        <aside
          className={`${open ? "block" : "hidden"} fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-forest px-4 py-6 text-primary-foreground lg:sticky lg:top-0 lg:block lg:h-screen lg:shrink-0`}
        >
          <span className="flex items-center px-2 text-xl font-bold">
            Pet G<PawPrint className="inline size-4 -rotate-12 text-clay" />
            od
          </span>
          <p className="mt-1 px-2 text-xs text-primary-foreground/60">Staff Console</p>
          <nav className="mt-8 space-y-1">
            {items.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10"
                activeProps={{ className: "bg-primary-foreground/15 text-primary-foreground font-medium" }}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle navigation"
                onClick={() => setOpen((v) => !v)}
                className="rounded-full border border-border p-2 lg:hidden"
              >
                <Menu className="size-4" />
              </button>
              <div>
                <h1 className="text-xl">{title}</h1>
                {subtitle ? <p className="text-sm text-foreground/60">{subtitle}</p> : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-foreground/60">{role ? roleLabels[role] : ""}</p>
              </div>
              <button
                aria-label="Sign out"
                onClick={() => {
                  authStore.logout();
                  navigate({ to: "/login", replace: true });
                }}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border text-forest"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </header>
          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
