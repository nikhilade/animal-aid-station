import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { EmptyState, Loading, Panel } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Pet } from "@/lib/api/types";

export const Route = createFileRoute("/portal/my-pets")({
  head: () => ({
    meta: [
      { title: "My Pets | Pet Good Owner Portal" },
      { name: "description", content: "View your registered pets, breeds, ages and microchip details." },
      { property: "og:title", content: "My Pets | Pet Good Owner Portal" },
      { property: "og:description", content: "All of your pets in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyPets,
});

function MyPets() {
  const [pets, setPets] = useState<Pet[] | null>(null);

  useEffect(() => {
    apiClient.get<Pet[]>(endpoints.pets.byOwner("own_1")).then(setPets).catch(() => setPets([]));
  }, []);

  return (
    <PortalLayout title="My Pets">
      {!pets ? (
        <Loading />
      ) : pets.length === 0 ? (
        <EmptyState message="No pets registered yet." />
      ) : (
        <div className="space-y-4">
          {pets.map((p) => (
            <Panel key={p.id} title={p.name}>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-foreground/60">Species</dt>
                  <dd>{p.species}</dd>
                </div>
                <div>
                  <dt className="text-foreground/60">Breed</dt>
                  <dd>{p.breed}</dd>
                </div>
                <div>
                  <dt className="text-foreground/60">Age</dt>
                  <dd>{p.age_years} yrs</dd>
                </div>
                <div>
                  <dt className="text-foreground/60">Weight</dt>
                  <dd>{p.weight_kg} kg</dd>
                </div>
                <div>
                  <dt className="text-foreground/60">Sex</dt>
                  <dd>{p.sex}</dd>
                </div>
                <div>
                  <dt className="text-foreground/60">Microchip</dt>
                  <dd>{p.microchip_id ?? "—"}</dd>
                </div>
              </dl>
            </Panel>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
