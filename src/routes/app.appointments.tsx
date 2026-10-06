import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CalendarCheck2, CalendarClock, CheckCircle2, Clock3, Plus, Search, X } from "lucide-react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { AdminHospitalSelector } from "@/components/app/AdminHospitalSelector";

import { EmptyState, InitialsAvatar, Loading, Panel, StatCard } from "@/components/app/ui";
import { NewAppointmentForm } from "@/components/app/kit/NewAppointmentForm";
import { StatusBadge } from "@/components/app/kit/StatusBadge";
import { todayISODate } from "@/components/app/kit/SlotPicker";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Appointment } from "@/lib/api/types";

export const Route = createFileRoute("/app/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments | Pet Good Console" },
      { name: "description", content: "Clinic-wide appointment schedule across doctors, services and statuses." },
      { property: "og:title", content: "Appointments | Pet Good Console" },
      { property: "og:description", content: "The full clinic schedule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    apiClient
      .get<Appointment[]>(endpoints.appointments.list)
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = items ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = list.filter((a) => {
    const matchesStatus = status === "ALL" || a.status === status;
    const matchesQuery = !normalizedQuery || [a.petName, a.ownerName, a.doctorName, a.service]
      .some((value) => value?.toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesQuery;
  });
  const today = todayISODate();
  const todayCount = list.filter((a) => a.scheduledAt?.startsWith(today)).length;
  const upcomingCount = list.filter((a) => ["SCHEDULED", "CONFIRMED"].includes(a.status)).length;
  const checkedInCount = list.filter((a) => a.status === "CHECKED_IN" || a.status === "IN_PROGRESS").length;
  const completedCount = list.filter((a) => a.status === "COMPLETED").length;

  return (
    <StaffLayout title="Appointments" subtitle="Clinic schedule" permission="appointments:read">
      <AdminHospitalSelector />
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Today" value={todayCount} hint="Appointments scheduled" icon={CalendarCheck2} accent />
          <StatCard label="Upcoming" value={upcomingCount} hint="Scheduled and confirmed" icon={CalendarClock} />
          <StatCard label="In clinic" value={checkedInCount} hint="Checked in or with doctor" icon={Clock3} />
          <StatCard label="Completed" value={completedCount} hint="Finished visits" icon={CheckCircle2} />
        </div>

        {creating && (
          <Panel title="New appointment">
            <NewAppointmentForm
              defaultDate={todayISODate()}
              onCreated={() => {
                load();
                setCreating(false);
              }}
            />
          </Panel>
        )}

        {!items ? (
          <Loading />
        ) : (
          <Panel className="overflow-hidden p-0 lg:p-0">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Schedule directory</p>
                <h2 className="mt-1 text-xl font-bold">{filtered.length} appointments</h2>
              </div>
              <Button onClick={() => setCreating((v) => !v)} className="h-10 shrink-0 gap-2">
                {creating ? <X className="size-4" /> : <Plus className="size-4" />}
                {creating ? "Close" : "New appointment"}
              </Button>
            </div>

            <div className="flex flex-col gap-3 border-b border-border bg-muted/35 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search pet, owner, doctor or service"
                  className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-shadow focus:border-forest focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
                {["ALL", "SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map((itemStatus) => (
                  <Button
                    key={itemStatus}
                    size="sm"
                    variant={status === itemStatus ? "default" : "ghost"}
                    onClick={() => setStatus(itemStatus)}
                    className="h-8 shrink-0 px-3 text-[11px]"
                  >
                    {itemStatus === "ALL" ? "All" : itemStatus.replace(/_/g, " ").toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-5 lg:p-6">
                <EmptyState icon={<CalendarCheck2 className="size-8" />} title="No appointments found" message="Try changing the search or status filter." />
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-card text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-4 py-3">Visit</th>
                    <th className="px-4 py-3">Care team</th>
                    <th className="px-4 py-3">Date & time</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="group border-t border-border transition-colors hover:bg-sage/25">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={a.petName} className="size-9 text-[11px]" />
                          <div><p className="font-semibold text-foreground">{a.petName}</p><p className="mt-0.5 text-xs text-muted-foreground">{a.ownerName}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><p className="font-medium">{a.service}</p><p className="mt-0.5 text-xs text-muted-foreground">General appointment</p></td>
                      <td className="px-4 py-4 text-foreground/75">{a.doctorName}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{new Date(a.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{new Date(a.scheduledAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </Panel>
        )}
      </div>
    </StaffLayout>
  );
}

