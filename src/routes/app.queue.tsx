import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, MonitorPlay, RefreshCw, TicketCheck, UserRoundCheck, Users } from "lucide-react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { AdminHospitalSelector } from "@/components/app/AdminHospitalSelector";

import { EmptyState, Loading, Panel, StatCard } from "@/components/app/ui";
import { StatusBadge } from "@/components/app/kit/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Appointment, AppointmentStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/app/ui";

export const Route = createFileRoute("/app/queue")({
  head: () => ({
    meta: [
      { title: "Reception Check-in & Queue | Pet Good Console" },
      { name: "description", content: "Front-desk check-in with live token numbers for today's appointments." },
      { property: "og:title", content: "Reception Check-in & Queue | Pet Good Console" },
      { property: "og:description", content: "Check pets in and run the waiting-room token queue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QueuePage,
});

function timeLabel(val?: string | null) {
  if (!val) return "Today";
  const date = new Date(val);
  if (isNaN(date.getTime())) return "Today";
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function QueuePage() {
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      apiClient.get<Appointment[]>(endpoints.appointments.queue, { branchId: "br_1" }).catch(() => []),
      apiClient.get<Appointment[]>(endpoints.appointments.list).catch(() => []),
    ])
      .then(([queueItems, allAppointments]) => {
        const queueList = queueItems ?? [];
        const apptList = allAppointments ?? [];
        const todayISO = new Date().toISOString().split("T")[0];

        const todayAppointments = apptList.filter((a) => {
          const d = a.scheduledAt ? a.scheduledAt.split("T")[0] : a.appointmentDate;
          return !d || d === todayISO;
        });

        const checkedInIds = new Set(queueList.map((q) => (q as { appointmentId?: string; id: string }).appointmentId || q.id));
        const combined = [...queueList];

        for (const appt of todayAppointments) {
          if (!checkedInIds.has(appt.id)) {
            combined.push(appt);
          }
        }

        setItems(combined);
      })
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function checkIn(id: string) {
    setBusy(id);
    try {
      await apiClient.post(endpoints.appointments.checkIn, { appointmentId: id });
      load();
    } finally {
      setBusy(null);
    }
  }

  async function skipPatient(id: string) {
    setBusy(id);
    try {
      await apiClient.put(endpoints.appointments.skip(id));
      load();
    } finally {
      setBusy(null);
    }
  }

  async function recallPatient(id: string) {
    setBusy(id);
    try {
      await apiClient.put(endpoints.appointments.recall(id));
      load();
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(id: string, status: AppointmentStatus) {
    setBusy(id);
    try {
      if (status === "IN_PROGRESS") {
        await apiClient.put(endpoints.appointments.callNext);
      } else if (status === "COMPLETED") {
        await apiClient.put(endpoints.appointments.complete(id));
      } else if (status === "NO_SHOW") {
        await apiClient.put(endpoints.appointments.noShow(id));
      } else {
        await apiClient.post(endpoints.appointments.status(id), { status });
      }
      load();
    } finally {
      setBusy(null);
    }
  }

  const list = items ?? [];
  const waiting = list.filter((a) => a.status === "CHECKED_IN" || (a.status as string) === "WAITING");
  const serving = list.find((a) => a.status === "IN_PROGRESS" || (a.status as string) === "CALLED") ?? null;
  const done = list.filter((a) => a.status === "COMPLETED").length;

  return (
    <StaffLayout title="Reception & Queue" subtitle="Today's check-ins" permission="appointments:read">
      <AdminHospitalSelector />
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Now serving" value={serving?.tokenNumber ? `#${serving.tokenNumber}` : "—"} hint={serving?.petName || "Queue ready"} icon={TicketCheck} accent />
          <StatCard label="Waiting" value={waiting.length} hint="Checked in, not called" icon={Users} />
          <StatCard label="Completed" value={done} hint="Finished so far today" icon={CheckCircle2} />
          <div className="admin-stat flex min-h-36 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Waiting room display</p><p className="mt-2 text-sm text-foreground/65">Open the live token board on a clinic screen.</p></div>
            <div className="mt-4 flex gap-2">
            <Link
              to="/app/now-serving"
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-forest px-4 text-xs font-semibold text-primary-foreground"
            >
              <MonitorPlay className="size-4" /> TV display
            </Link>
            <Button aria-label="Refresh queue" title="Refresh queue" variant="outline" size="icon" onClick={load}>
              <RefreshCw className="size-4" />
            </Button>
            </div>
          </div>
        </div>

        {!items ? (
          <Loading />
        ) : list.length === 0 ? (
          <Panel>
            <EmptyState
              icon={<Users className="size-8" />}
              title="No appointments today"
              message="Once today's appointments are booked they'll appear here ready for check-in."
            />
          </Panel>
        ) : (
          <Panel className="overflow-hidden p-0 lg:p-0">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Live reception desk</p><h2 className="mt-1 text-xl font-bold">{list.length} appointments today</h2></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 animate-pulse rounded-full bg-forest" /> Updates every 15 seconds</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-muted/35 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">Token</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Visit time</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className={`border-t border-border transition-colors hover:bg-sage/20 ${a.id === serving?.id ? "bg-sage/35" : ""}`}>
                      <td className="px-6 py-4">
                        <span className={`inline-flex min-w-12 items-center justify-center rounded-md px-2.5 py-2 font-mono text-sm font-bold ${a.tokenNumber ? "bg-forest text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{a.tokenNumber ? `#${a.tokenNumber}` : "—"}</span>
                      </td>
                      <td className="px-4 py-4"><div className="flex items-center gap-3"><InitialsAvatar name={a.petName} className="size-9 text-[11px]" /><div><p className="font-semibold">{a.petName}</p><p className="mt-0.5 text-xs text-muted-foreground">{a.ownerName}</p></div></div></td>
                      <td className="px-4 py-4"><p className="flex items-center gap-1.5 font-medium"><Clock3 className="size-3.5 text-clay" />{timeLabel(a.scheduledAt)}</p><p className="mt-0.5 text-xs text-muted-foreground">Scheduled arrival</p></td>
                      <td className="px-4 py-4 text-foreground/75">{a.doctorName}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.status === "SCHEDULED" || a.status === "CONFIRMED" ? (
                          <Button
                            disabled={busy === a.id}
                            onClick={() => checkIn(a.id)}
                            size="sm"
                            className="gap-1.5"
                          >
                            <UserRoundCheck className="size-3.5" /> Check in
                          </Button>
                        ) : a.status === "CHECKED_IN" || (a.status as string) === "WAITING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              disabled={busy === a.id}
                              onClick={() => setStatus(a.id, "IN_PROGRESS")}
                              size="sm"
                            >
                              Call in
                            </Button>
                            <Button
                              disabled={busy === a.id}
                              onClick={() => skipPatient(a.id)}
                              variant="outline"
                              size="sm"
                            >
                              Skip
                            </Button>
                            <Button
                              disabled={busy === a.id}
                              onClick={() => setStatus(a.id, "NO_SHOW")}
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              No-show
                            </Button>
                          </div>
                        ) : (a.status as string) === "SKIPPED" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              disabled={busy === a.id}
                              onClick={() => recallPatient(a.id)}
                              size="sm"
                            >
                              Recall
                            </Button>
                            <Button
                              disabled={busy === a.id}
                              onClick={() => setStatus(a.id, "NO_SHOW")}
                              variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              No-show
                            </Button>
                          </div>
                        ) : a.status === "IN_PROGRESS" || (a.status as string) === "CALLED" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              disabled={busy === a.id}
                              onClick={() => setStatus(a.id, "COMPLETED")}
                              variant="outline" size="sm" className="gap-1.5"
                            >
                              <CheckCircle2 className="size-3.5" /> Complete
                            </Button>
                            <Button
                              disabled={busy === a.id}
                              onClick={() => setStatus(a.id, "NO_SHOW")}
                              variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              No-show
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </StaffLayout>
  );
}
