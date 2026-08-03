import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { Loading, Panel } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Pet } from "@/lib/api/types";

export const Route = createFileRoute("/app/pets")({
  head: () => ({
    meta: [
      { title: "Patients | Pet Good Console" },
      { name: "description", content: "Full patient register with species, breed, weight and microchip data." },
      { property: "og:title", content: "Patients | Pet Good Console" },
      { property: "og:description", content: "Every pet registered with the clinic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PetsPage,
});

function PetsPage() {
  const [pets, setPets] = useState<Pet[] | null>(null);

  useEffect(() => {
    apiClient.get<Pet[]>(endpoints.pets.list).then(setPets).catch(() => setPets([]));
  }, []);

  return (
    <StaffLayout title="Patients" subtitle="Registered pets" permission="pets:read">
      {!pets ? (
        <Loading />
      ) : (
        <Panel title={`${pets.length} patients`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-foreground/50">
                <tr>
                  <th className="pb-3">Pet</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Species</th>
                  <th className="pb-3">Breed</th>
                  <th className="pb-3">Age</th>
                  <th className="pb-3">Weight</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-foreground/70">{p.owner_name}</td>
                    <td className="py-3 text-foreground/70">{p.species}</td>
                    <td className="py-3 text-foreground/70">{p.breed}</td>
                    <td className="py-3 text-foreground/70">{p.age_years} yrs</td>
                    <td className="py-3 text-foreground/70">{p.weight_kg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </StaffLayout>
  );
}
