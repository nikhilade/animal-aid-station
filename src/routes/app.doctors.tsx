import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { Loading, Panel } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Doctor } from "@/lib/api/types";

export const Route = createFileRoute("/app/doctors")({
  head: () => ({
    meta: [
      { title: "Doctors | Pet Good Console" },
      { name: "description", content: "Veterinary team directory with specialties and available slots." },
      { property: "og:title", content: "Doctors | Pet Good Console" },
      { property: "og:description", content: "Specialties and availability for the clinical team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);

  useEffect(() => {
    apiClient.get<Doctor[]>(endpoints.doctors.list).then(setDoctors).catch(() => setDoctors([]));
  }, []);

  return (
    <StaffLayout title="Doctors" subtitle="Clinical team" permission="doctors:read">
      {!doctors ? (
        <Loading />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((d) => (
            <Panel key={d.id} title={d.name}>
              <p className="text-sm text-foreground/70">{d.specialty}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {d.available_slots.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground/70">
                    {s}
                  </span>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
