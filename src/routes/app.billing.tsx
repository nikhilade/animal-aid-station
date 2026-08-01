import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { Loading, Panel, StatusPill, formatDate, formatMoney } from "@/components/app/ui";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { Invoice } from "@/lib/api/types";

export const Route = createFileRoute("/app/billing")({
  head: () => ({
    meta: [
      { title: "Billing | Pet Good Console" },
      { name: "description", content: "Invoices, outstanding balances and payment status across all clients." },
      { property: "og:title", content: "Billing | Pet Good Console" },
      { property: "og:description", content: "Clinic invoicing and payment tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  const [items, setItems] = useState<Invoice[] | null>(null);

  useEffect(() => {
    apiClient.get<Invoice[]>(endpoints.invoices.list).then(setItems).catch(() => setItems([]));
  }, []);

  const outstanding = (items ?? []).filter((i) => i.status !== "PAID").reduce((s, i) => s + i.amount, 0);

  return (
    <StaffLayout title="Billing" subtitle="Invoices and payments" permission="billing:read">
      {!items ? (
        <Loading />
      ) : (
        <Panel title={`Outstanding: ${formatMoney(outstanding)}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-foreground/50">
                <tr>
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Issued</th>
                  <th className="pb-3">Due</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="py-3 font-medium">{i.number}</td>
                    <td className="py-3 text-foreground/70">{i.owner_name}</td>
                    <td className="py-3 text-foreground/70">{formatDate(i.issued_at)}</td>
                    <td className="py-3 text-foreground/70">{formatDate(i.due_at)}</td>
                    <td className="py-3">{formatMoney(i.amount)}</td>
                    <td className="py-3">
                      <StatusPill status={i.status} />
                    </td>
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
