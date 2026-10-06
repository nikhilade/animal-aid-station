import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X, AlertTriangle, Clock3, Move } from "lucide-react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { AdminHospitalSelector } from "@/components/app/AdminHospitalSelector";

import { EmptyState, Loading, Panel } from "@/components/app/ui";
import { StatusBadge, statusAccent } from "@/components/app/kit/StatusBadge";
import { NewAppointmentForm } from "@/components/app/kit/NewAppointmentForm";
import { todayISODate } from "@/components/app/kit/SlotPicker";
import { ApiError, apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Appointment, Branch } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({
    meta: [
      { title: "Appointment Calendar | Pet Good Console" },
      { name: "description", content: "Day and week appointment calendar with drag-to-reschedule for clinic staff." },
      { property: "og:title", content: "Appointment Calendar | Pet Good Console" },
      { property: "og:description", content: "Day and week scheduling for the clinic team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CalendarPage,
});

const HOUR_START = 8;
const HOUR_END = 19;

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}
function startOfWeek(d: Date) {
  const s = new Date(d);
  s.setDate(s.getDate() - s.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
}
function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function CalendarPage() {
  const [view, setView] = useState<"day" | "week">("day");
  const [anchor, setAnchor] = useState(() => new Date());
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [creating, setCreating] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [banner, setBanner] = useState("");

  const load = useCallback(() => {
    apiClient
      .get<Appointment[]>(endpoints.appointments.list)
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    apiClient
      .get<Branch[]>(endpoints.branches.list)
      .then((b) => {
        setBranches(b);
        if (b.length > 0) setBranchId(b[0].id);
      })
      .catch(() => undefined);
  }, [load]);

  const branch = branches.find((b) => b.id === branchId) ?? null;
  const days = useMemo(() => {
    if (view === "day") return [new Date(anchor)];
    const s = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [view, anchor]);

  const visible = (items ?? []).filter((a) => {
    if (a.branchId && a.branchId !== "br_1") return a.branchId === branchId;
    const currentBranch = branches.find((b) => b.id === branchId);
    return a.branchName === currentBranch?.branchName;
  });
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  function forCell(day: Date, hour: number) {
    return visible.filter((a) => {
      const d = new Date(a.scheduledAt);
      return isoDate(d) === isoDate(day) && d.getHours() === hour;
    });
  }

  const closedOn = (day: Date) => {
    const wh = (branch as any)?.workingHours;
    return !!wh?.closedDays && wh.closedDays.includes(day.getDay());
  };
  const outsideHours = (day: Date, hour: number) => {
    const wh = (branch as any)?.workingHours;
    return !!wh && (hour < wh.openHour || hour >= wh.closeHour || closedOn(day));
  };

  async function drop(day: Date, hour: number) {
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const target = new Date(day);
    target.setHours(hour, 0, 0, 0);
    if (target.getTime() < Date.now()) {
      setBanner("You can't move an appointment into the past.");
      return;
    }
    if (outsideHours(day, hour)) {
      setBanner("That time is outside the branch's working hours.");
      return;
    }
    setBanner("");
    try {
      await apiClient.put(endpoints.appointments.reschedule(id), { scheduledAt: target.toISOString() });
      load();
    } catch (err) {
      setBanner(
        err instanceof ApiError && err.code === "ERR_DOUBLE_BOOKING"
          ? "That slot was just taken — pick another one."
          : "Could not reschedule that appointment.",
      );
      load();
    }
  }

  return (
    <StaffLayout title="Appointment Calendar" subtitle="Day & week schedule" permission="appointments:read">
      <AdminHospitalSelector />
      <div className="space-y-5">
        <Panel className="p-0 lg:p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-6">
            <div className="flex items-center gap-2">
              <Button
                aria-label="Previous"
                variant="outline"
                size="icon"
                onClick={() => setAnchor((d) => addDays(d, view === "day" ? -1 : -7))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" onClick={() => setAnchor(new Date())} className="h-9 px-4">
                Today
              </Button>
              <Button
                aria-label="Next"
                variant="outline"
                size="icon"
                onClick={() => setAnchor((d) => addDays(d, view === "day" ? 1 : 7))}
              >
                <ChevronRight className="size-4" />
              </Button>
              <p className="ml-2 hidden text-sm font-semibold sm:block">
                {view === "day"
                  ? anchor.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
                  : `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-forest"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
              <div className="flex rounded-lg border border-border bg-muted/40 p-1">
                {(["day", "week"] as const).map((v) => (
                  <Button
                    key={v}
                    size="sm"
                    variant={view === v ? "default" : "ghost"}
                    onClick={() => setView(v)}
                    className="h-7 px-3 text-xs capitalize"
                  >
                    {v}
                  </Button>
                ))}
              </div>
              <Button onClick={() => setCreating((v) => !v)} className="h-9 gap-2">
                {creating ? <X className="size-4" /> : <Plus className="size-4" />}
                {creating ? "Close" : "New appointment"}
              </Button>
            </div>
          </div>
          {banner ? (
            <p className="mx-5 mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive lg:mx-6">
              <AlertTriangle className="size-4 shrink-0" /> {banner}
            </p>
          ) : null}
          <div className="flex items-center gap-2 border-t border-border bg-muted/35 px-5 py-3 text-xs text-muted-foreground lg:px-6">
            <Move className="size-3.5" /> Drag appointments to reschedule. Unavailable hours are shaded.
          </div>
        </Panel>

        {creating ? (
          <Panel title="New appointment">
            <NewAppointmentForm
              defaultDate={view === "day" ? isoDate(anchor) : todayISODate()}
              onCreated={() => {
                load();
                setCreating(false);
              }}
            />
          </Panel>
        ) : null}

        {!items ? (
          <Loading />
        ) : visible.length === 0 ? (
          <Panel>
            <EmptyState
              icon={<CalendarDays className="size-8" />}
              title="Nothing booked yet"
              message="Create the first appointment for this branch and it will show up on the calendar."
            />
          </Panel>
        ) : (
          <Panel className="overflow-hidden p-0 lg:p-0">
            <div className="overflow-x-auto">
              <div
                className="min-w-[840px]"
                style={{ display: "grid", gridTemplateColumns: `72px repeat(${days.length}, minmax(0, 1fr))` }}
              >
                <div className="sticky left-0 z-10 border-b border-border bg-card" />
                {days.map((d) => (
                  <div key={d.toISOString()} className={`border-b border-l border-border px-2 py-4 text-center ${isoDate(d) === isoDate(new Date()) ? "bg-sage/45" : "bg-card"}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </p>
                    <p className={`mx-auto mt-1 flex size-8 items-center justify-center rounded-full text-sm font-bold ${isoDate(d) === isoDate(new Date()) ? "bg-forest text-primary-foreground" : "text-foreground"}`}>
                      {d.getDate()}
                    </p>
                  </div>
                ))}

                {hours.map((h) => (
                  <div key={h} className="contents">
                    <div className="sticky left-0 z-10 border-t border-border bg-card py-4 pr-3 text-right text-[11px] font-medium text-muted-foreground">
                      {String(h).padStart(2, "0")}:00
                    </div>
                    {days.map((d) => {
                      const blocked = outsideHours(d, h);
                      const cellDate = new Date(d);
                      cellDate.setHours(h, 0, 0, 0);
                      const past = cellDate.getTime() < Date.now();
                      return (
                        <div
                          key={`${d.toISOString()}-${h}`}
                          onDragOver={(e) => {
                            if (!blocked && !past) e.preventDefault();
                          }}
                          onDrop={() => drop(d, h)}
                          className={`min-h-20 space-y-1.5 border-t border-l border-border p-1.5 transition-colors ${
                            blocked || past ? "bg-muted/70" : "bg-card hover:bg-sage/20"
                          }`}
                        >
                          {forCell(d, h).map((a) => (
                            <div
                              key={a.id}
                              draggable={a.status !== "COMPLETED" && a.status !== "CANCELLED"}
                              onDragStart={() => setDragId(a.id)}
                              onDragEnd={() => setDragId(null)}
                              className={`cursor-grab rounded-md border-l-[3px] border-forest bg-sage/55 p-2.5 text-left text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${
                                dragId === a.id ? "opacity-50" : ""
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className={`size-1.5 shrink-0 rounded-full ${statusAccent(a.status)}`} />
                                <span className="truncate font-medium">{a.petName}</span>
                              </span>
                               <p className="mt-1 flex items-center gap-1 truncate text-foreground/65"><Clock3 className="size-3" />{timeLabel(a.scheduledAt)} · {a.service}</p>
                               <p className="mt-0.5 truncate text-muted-foreground">{a.doctorName}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border bg-muted/30 px-5 py-4 lg:px-6">
              {(["SCHEDULED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"] as const).map(
                (s) => (
                  <StatusBadge key={s} status={s} />
                ),
              )}
            </div>
          </Panel>
        )}
      </div>
    </StaffLayout>
  );
}
