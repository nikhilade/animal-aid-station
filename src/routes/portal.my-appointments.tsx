import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { EmptyState, Loading, Panel, StatusPill, formatDate } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Appointment } from "@/lib/api/types";

export const Route = createFileRoute("/portal/my-appointments")({
  head: () => ({
    meta: [
      { title: "My Appointments | Pet Good Owner Portal" },
      { name: "description", content: "Track upcoming and past visits for every pet in your family." },
      { property: "og:title", content: "My Appointments | Pet Good Owner Portal" },
      { property: "og:description", content: "Upcoming and past visits at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyAppointments,
});

function MyAppointments() {
  const [items, setItems] = useState<Appointment[] | null>(null);

  useEffect(() => {
    apiClient.get<Appointment[]>(endpoints.appointments.mine).then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <PortalLayout title="My Appointments">
      {!items ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState message="No appointments booked yet." />
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Panel key={a.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg">{a.service}</p>
                  <p className="mt-1 text-sm text-foreground/70">
                    {a.pet_name} · {a.doctor_name}
                  </p>
                  <p className="mt-1 text-sm text-clay">{formatDate(a.scheduled_at)}</p>
                  {a.notes ? <p className="mt-2 text-sm text-foreground/60">{a.notes}</p> : null}
                </div>
                <StatusPill status={a.status} />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
