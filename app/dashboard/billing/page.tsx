import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, CreditCard, FileText, Landmark, Receipt } from "lucide-react";
import { getWorkspace } from "@/lib/session";
import { invoicesFor } from "@/lib/billing/invoices";
import { computeTax, monthlyRate, paymentMethodLabels, periodNet, planById } from "@/lib/plans";
import { billingCountries } from "@/lib/geo";
import { usage } from "@/lib/data/dashboard";
import { formatEUR } from "@/lib/format";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { PageHeader, UsageMeter } from "@/components/dashboard/primitives";
import { PlanManager } from "@/components/dashboard/plan-manager";

export const metadata: Metadata = { title: "Billing & Plan" };

const dateFmt = new Intl.DateTimeFormat("en-IE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

const methodIcon = { sepa_debit: Landmark, card: CreditCard, invoice: FileText } as const;

async function BillingContent() {
  const ws = await getWorkspace();
  const plan = planById[ws.tier];
  const { invoices, nextRenewal } = invoicesFor(ws, new Date());
  const tax = computeTax(periodNet(plan, ws.cycle), ws.country);
  const countryName = billingCountries.find((c) => c.code === ws.country)?.name ?? ws.country;
  const MethodIcon = methodIcon[ws.paymentMethod];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Current plan"
            description={`Subscription ${ws.subscriptionId}`}
            actions={<Badge tone="emerald">Active</Badge>}
          />
          <dl className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            {[
              ["Plan", `${plan.name} · ${ws.cycle === "annual" ? "Annual" : "Monthly"}`],
              ["Rate", `${formatEUR(monthlyRate(plan, ws.cycle), { decimals: 0 })} / month net`],
              ["Next renewal", dateFmt.format(nextRenewal)],
              ["Per period", `${formatEUR(tax.gross)} incl. tax`],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-4 py-3">
                <dt className="text-[11px] text-ink-3">{k}</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <PlanManager currentPlan={ws.tier} currentCycle={ws.cycle} demo={ws.demo} />
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Usage this period" />
            <div className="space-y-4 p-4">
              <UsageMeter label="Supplier contact unlocks" used={usage.contactUnlocks} limit={plan.limits.contactUnlocks} />
              <UsageMeter
                label="API calls"
                used={plan.limits.apiCallsPerMonth ? usage.apiCalls : 0}
                limit={plan.limits.apiCallsPerMonth}
              />
              <UsageMeter label="Seats" used={Math.min(usage.seats, plan.seats === "unlimited" ? usage.seats : plan.seats)} limit={plan.seats} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Payment method" />
            <div className="flex items-start gap-3 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface-2">
                <MethodIcon aria-hidden className="size-4 text-ink-2" />
              </span>
              <div className="text-xs">
                <p className="font-medium text-ink">{paymentMethodLabels[ws.paymentMethod]}</p>
                <p className="mt-0.5 text-ink-3">
                  {ws.paymentMethod === "invoice"
                    ? "Net 30 · bank transfer to the IBAN on each invoice"
                    : ws.paymentMethod === "sepa_debit"
                      ? "SEPA Core mandate on file with the payment provider"
                      : "Card token stored by the payment provider"}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader title="Invoices" description="Net, VAT and gross per billing period" />
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-xs">
              <thead className="text-[11px] text-ink-3">
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2 font-medium">Invoice</th>
                  <th scope="col" className="px-3 py-2 font-medium">Period</th>
                  <th scope="col" className="px-3 py-2 font-medium">Method</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Net</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">VAT</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Total</th>
                  <th scope="col" className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.number} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Receipt aria-hidden className="size-3.5 text-ink-3" />
                        <span className="font-mono text-[11px] text-ink">{inv.number}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink-3">Issued {dateFmt.format(inv.issuedAt)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-ink-2">{inv.periodLabel}</td>
                    <td className="px-3 py-2.5 text-ink-2">{paymentMethodLabels[inv.method]}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-2">{formatEUR(inv.tax.net)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-3">
                      {inv.tax.vat ? formatEUR(inv.tax.vat) : inv.tax.treatment === "reverse_charge" ? "RC" : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-ink">{formatEUR(inv.tax.gross)}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={inv.status === "paid" ? "emerald" : "amber"}>{inv.status === "paid" ? "Paid" : "Open · net 30"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Billing entity" />
          <dl className="space-y-3 p-4 text-xs">
            <div className="flex items-start gap-2">
              <Building2 aria-hidden className="mt-0.5 size-3.5 text-ink-3" />
              <div>
                <dt className="sr-only">Company</dt>
                <dd className="font-medium text-ink">{ws.company}</dd>
                <dd className="text-ink-3">{countryName}</dd>
              </div>
            </div>
            <div>
              <dt className="text-ink-3">VAT ID</dt>
              <dd className="mt-0.5 font-mono text-ink">{ws.vatId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Billing contact</dt>
              <dd className="mt-0.5 text-ink">{ws.contactEmail}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Tax treatment</dt>
              <dd className="mt-0.5 text-ink">{tax.note}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}

function BillingSkeleton() {
  return (
    <div aria-hidden className="grid gap-6 xl:grid-cols-3">
      <div className="h-96 animate-pulse rounded-lg bg-surface xl:col-span-2" />
      <div className="h-96 animate-pulse rounded-lg bg-surface" />
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Billing & Plan"
        description="Membership tier, invoices and payment method. Changes apply to the whole workspace."
      />
      <Suspense fallback={<BillingSkeleton />}>
        <BillingContent />
      </Suspense>
    </div>
  );
}
