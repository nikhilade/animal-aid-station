import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { EmptyState, Loading, Panel, formatDate } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Prescription } from "@/lib/api/types";

export const Route = createFileRoute("/portal/prescriptions")({
  head: () => ({
    meta: [
      { title: "Prescriptions | Pet Good Owner Portal" },
      { name: "description", content: "Review your pet's medications, dosage instructions and refills left." },
      { property: "og:title", content: "Prescriptions | Pet Good Owner Portal" },
      { property: "og:description", content: "Medications and refills for your pets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Prescriptions,
});

function Prescriptions() {
  const [items, setItems] = useState<Prescription[] | null>(null);

  useEffect(() => {
    apiClient.get<Prescription[]>(endpoints.prescriptions.mine).then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <PortalLayout title="Prescriptions">
      {!items ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState message="No active prescriptions." />
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <Panel key={p.id} title={p.medication}>
              <p className="text-sm text-foreground/70">
                {p.pet_name} · prescribed by {p.doctor_name}
              </p>
              <p className="mt-2 text-sm">
                <span className="text-foreground/60">Dosage: </span>
                {p.dosage}
              </p>
              <p className="mt-1 text-sm text-foreground/70">{p.instructions}</p>
              <p className="mt-3 text-xs text-foreground/50">
                Issued {formatDate(p.issued_at)} · {p.refills_left} refills left
              </p>
            </Panel>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
