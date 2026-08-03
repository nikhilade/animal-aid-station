import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { Loading, Panel } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { PetOwner } from "@/lib/api/types";

export const Route = createFileRoute("/app/owners")({
  head: () => ({
    meta: [
      { title: "Pet Owners | Pet Good Console" },
      { name: "description", content: "Search and manage registered pet owner records for the clinic." },
      { property: "og:title", content: "Pet Owners | Pet Good Console" },
      { property: "og:description", content: "Owner directory and contact details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnersPage,
});

function OwnersPage() {
  const [owners, setOwners] = useState<PetOwner[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    apiClient.get<PetOwner[]>(endpoints.petOwners.list).then(setOwners).catch(() => setOwners([]));
  }, []);

  const filtered = (owners ?? []).filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <StaffLayout title="Pet Owners" subtitle="Client directory" permission="owners:read">
      {!owners ? (
        <Loading />
      ) : (
        <Panel
          title={`${filtered.length} owners`}
          action={
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search owners"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-forest"
            />
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-foreground/50">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Pets</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-3 font-medium">{o.name}</td>
                    <td className="py-3 text-foreground/70">{o.email}</td>
                    <td className="py-3 text-foreground/70">{o.phone}</td>
                    <td className="py-3 text-foreground/70">{o.pets_count}</td>
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
