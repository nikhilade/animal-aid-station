import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { Loading, Panel, formatMoney } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { InventoryItem } from "@/lib/api/types";

export const Route = createFileRoute("/app/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory | Pet Good Console" },
      { name: "description", content: "Track medication and supply stock levels with reorder alerts." },
      { property: "og:title", content: "Inventory | Pet Good Console" },
      { property: "og:description", content: "Stock levels and reorder thresholds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[] | null>(null);

  useEffect(() => {
    apiClient.get<InventoryItem[]>(endpoints.inventory.list).then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <StaffLayout title="Inventory" subtitle="Stock and supplies" permission="inventory:read">
      {!items ? (
        <Loading />
      ) : (
        <Panel title={`${items.length} items`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase text-foreground/50">
                <tr>
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Reorder at</th>
                  <th className="pb-3">Unit price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="py-3 font-medium">{i.name}</td>
                    <td className="py-3 text-foreground/70">{i.category}</td>
                    <td className={`py-3 ${i.stock <= i.reorder_level ? "font-semibold text-destructive" : "text-foreground/70"}`}>
                      {i.stock}
                    </td>
                    <td className="py-3 text-foreground/70">{i.reorder_level}</td>
                    <td className="py-3 text-foreground/70">{formatMoney(i.unit_price)}</td>
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
