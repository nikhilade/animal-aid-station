import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, CreditCard, Globe, Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { StaffLayout } from "@/components/app/StaffLayout";
import { AdminHospitalSelector } from "@/components/app/AdminHospitalSelector";

import { EmptyState, Loading, Panel } from "@/components/app/ui";
import { INR, MoneyInput } from "@/components/app/kit/MoneyInput";
import { IdempotentSubmitButton } from "@/components/app/kit/IdempotentSubmitButton";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { InvoiceDetail, Payment, PaymentMethod } from "@/lib/api/billing-types";

export const Route = createFileRoute("/app/payments")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      invoiceId: search.invoiceId as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Collect Payment | Pet Good Console" },
      { name: "description", content: "Collect cash, card, UPI and online payments against clinic invoices." },
      { property: "og:title", content: "Collect Payment | Pet Good Console" },
      { property: "og:description", content: "Payment collection with gateway reconciliation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentsPage,
});

const methods: { key: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { key: "CASH", label: "Cash", icon: Banknote },
  { key: "CARD", label: "Card", icon: CreditCard },
  { key: "UPI", label: "UPI", icon: Smartphone },
  { key: "ONLINE", label: "Online", icon: Globe },
];

function PaymentsPage() {
  const [invoices, setInvoices] = useState<InvoiceDetail[] | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [selected, setSelected] = useState<InvoiceDetail | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [pending, setPending] = useState<Payment | null>(null);
  const [resolved, setResolved] = useState<Payment | null>(null);
  const [polls, setPolls] = useState(0);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { invoiceId } = Route.useSearch();

  const load = useCallback(() => {
    apiClient
      .get<InvoiceDetail[] | { content: InvoiceDetail[] }>(endpoints.billing.invoices)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.content ?? []);
        setInvoices(list.filter((i) => i.status === "DUE" || i.status === "OVERDUE" || i.status === "PENDING"));
      })
      .catch(() => setInvoices([]));
    apiClient.get<Payment[]>(endpoints.payments.list)
      .then((res) => {
        setHistory(res);
        setHistoryError("");
      })
      .catch((err) => {
        setHistoryError(err.message || String(err));
        setHistory([]);
      });
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    if (invoices && invoiceId && !selected) {
      const match = invoices.find(i => i.id === invoiceId);
      if (match) {
        setSelected(match);
        setAmount(Number((match.grandTotal - match.amountPaid).toFixed(2)));
        setResolved(null);
        setError("");
      }
    }
  }, [invoices, invoiceId, selected]);

  // While a payment is UNKNOWN the gateway hasn't told us anything yet.
  // Poll reconcile until it settles — never allow a re-submit meanwhile.
  useEffect(() => {
    if (!pending) return;
    let active = true;
    function poll() {
      timer.current = setTimeout(async () => {
        if (!active || !pending) return;
        try {
          const next = await apiClient.get<Payment>(endpoints.payments.reconcile, { payment_id: pending.id });
          if (!active) return;
          setPolls((n) => n + 1);
          if (next.status === "UNKNOWN") {
            poll();
          } else {
            setPending(null);
            setResolved(next);
            load();
          }
        } catch {
          if (active) poll();
        }
      }, 2500);
    }
    poll();
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pending, load]);

  const outstanding = selected ? selected.grandTotal - selected.amountPaid : 0;

  function choose(invoice: InvoiceDetail) {
    setSelected(invoice);
    setAmount(Number((invoice.grandTotal - invoice.amountPaid).toFixed(2)));
    setResolved(null);
    setError("");
    setReference("");
    setCardNumber("");
    setCvv("");
    setUpiId("");
  }

  async function submit(headers: { "Idempotency-Key": string }) {
    setError("");
    setResolved(null);
    if (!selected) throw new Error("Select an invoice first.");

    let finalRemarks = "";
    if (method === "CARD" && cardNumber) finalRemarks = `Card Number: ${cardNumber}, CVV: ${cvv}`;
    if (method === "UPI" && upiId) finalRemarks = `UPI ID: ${upiId}`;
    if (method === "CASH") finalRemarks = reference;

    if (method === "UPI" || method === "ONLINE" || method === "CARD") {
      await new Promise((r) => setTimeout(r, 2500));
    }

    const payload = {
      invoiceId: selected.id,
      paymentMode: method,
      amount: amount,
      transactionId: (method !== "CASH" && method !== "CARD" && method !== "UPI") ? reference : null,
      remarks: finalRemarks,
    };

    const payment = await apiClient.post<Payment>(
      endpoints.payments.create,
      payload,
      headers,
    );
    if (payment.status === "UNKNOWN") {
      setPolls(0);
      setPending(payment);
    } else {
      if (payment.status === "SUCCESS") {
        const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg");
        audio.play().catch(() => {});
      }
      setResolved(payment);
      load();
    }
    return payment;
  }

  return (
    <StaffLayout title="Payments" subtitle="Collect and reconcile" permission="payments:write">
      <AdminHospitalSelector />
      {!invoices ? (
        <Loading />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Panel title="Unpaid invoices">
            {invoices.length === 0 ? (
              <EmptyState message="Everything is settled — no invoices are awaiting payment." />
            ) : (
              <ul className="space-y-2">
                {invoices.map((i) => (
                  <li key={i.id}>
                    <button
                      onClick={() => choose(i)}
                      disabled={Boolean(pending)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                        selected?.id === i.id ? "border-forest bg-forest/5" : "border-border hover:border-forest"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-medium">{i.invoiceNumber}</span>
                        <span className="block text-xs text-foreground/60">{i.ownerName}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm tabular-nums">{INR(i.grandTotal - i.amountPaid)}</span>
                        <span className="block text-xs text-foreground/50">due</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="space-y-5">
            {pending ? (
              <PendingState payment={pending} polls={polls} />
            ) : (
              <Panel title={selected ? `Collect for ${selected.invoiceNumber}` : "Collect payment"}>
                {!selected ? (
                  <EmptyState message="Pick an invoice on the left to collect a payment." />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {methods.map((m) => (
                        <button
                          key={m.key}
                          onClick={() => setMethod(m.key)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                            method === m.key ? "bg-forest text-primary-foreground" : "bg-muted text-foreground/70"
                          }`}
                        >
                          <m.icon className="size-4" /> {m.label}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                      Outstanding on this invoice: <span className="font-semibold tabular-nums">{INR(outstanding)}</span>
                    </div>

                    <MoneyInput label="Amount received" value={amount} onChange={setAmount} />
                    
                    {method === "CARD" && (
                      <div className="grid grid-cols-[1fr_100px] gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-foreground/60">
                            Card Number
                          </label>
                          <input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-forest"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-foreground/60">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="***"
                            maxLength={4}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-forest"
                          />
                        </div>
                      </div>
                    )}
                    
                    {method === "UPI" && (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground/60">
                          UPI ID
                        </label>
                        <input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. username@bank"
                          className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-forest"
                        />
                      </div>
                    )}

                    {method !== "CARD" && method !== "UPI" && (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground/60">
                          {method === "CASH" ? "Reference (optional)" : "Transaction ID / Auth Code"}
                        </label>
                        <input
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder={method === "CASH" ? "Receipt note" : "e.g. TXN-88412"}
                          className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-forest"
                        />
                      </div>
                    )}

                    {error ? <p className="text-xs text-destructive">{error}</p> : null}

                    <IdempotentSubmitButton
                      key={`${selected.id}-${method}`}
                      disabled={amount <= 0}
                      showKey
                      onSubmit={submit}
                    >
                      Take {INR(amount)}
                    </IdempotentSubmitButton>

                    {resolved ? (
                      <div
                        className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${
                          resolved.status === "SUCCESS" ? "bg-forest/10 text-forest" : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {resolved.status === "SUCCESS" ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        ) : (
                          <XCircle className="mt-0.5 size-4 shrink-0" />
                        )}
                        <p>
                          Payment {resolved.status.toLowerCase()} — {INR(resolved.amount)} via{" "}
                          {resolved.paymentMode.toLowerCase()} {resolved.transactionId ? `(${resolved.transactionId})` : ""}.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </Panel>
            )}

            <Panel title="Recent payments">
              {historyError ? (
                <div className="py-8 text-center text-sm text-destructive">
                  Failed to load: {historyError}
                </div>
              ) : history.length === 0 ? (
                <EmptyState message="No payments recorded yet." />
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {history.slice(0, 8).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span>
                        <span className="block font-medium">{p.invoiceNumber}</span>
                        <span className="block text-xs text-foreground/55">
                          {p.paymentMode.toLowerCase()} · {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block tabular-nums">{INR(p.amount)}</span>
                        <span
                          className={`block text-xs ${
                            p.status === "SUCCESS"
                              ? "text-forest"
                              : p.status === "UNKNOWN"
                                ? "text-clay"
                                : "text-destructive"
                          }`}
                        >
                          {p.status.toLowerCase()}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

/** Gateway timeout: the payment may still have succeeded, so re-submitting is blocked. */
function PendingState({ payment, polls }: { payment: Payment; polls: number }) {
  return (
    <Panel title="Confirming payment status…">
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Loader2 className="size-10 animate-spin text-clay" />
        <div>
          <p className="text-lg font-medium text-forest">Confirming payment status…</p>
          <p className="mt-1 max-w-sm text-sm text-foreground/60">
            The gateway hasn’t confirmed {INR(payment.amount)} on {payment.invoiceNumber} yet. This is not a failure —
            do not collect again or ask the client to retry.
          </p>
        </div>
        <div className="rounded-2xl bg-muted px-4 py-3 text-xs text-foreground/60">
          Reference {payment.reference} · reconcile attempt {polls + 1}
        </div>
        <button
          disabled
          className="cursor-not-allowed rounded-full bg-forest px-6 py-3 text-sm font-medium text-primary-foreground opacity-50"
        >
          Pay
        </button>
        <p className="text-xs text-foreground/50">The Pay button stays disabled until the status resolves.</p>
      </div>
    </Panel>
  );
}
