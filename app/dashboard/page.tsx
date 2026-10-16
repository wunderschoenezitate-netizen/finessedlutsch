import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { getMarketSnapshot } from "@/lib/data/catalog";
import { getWorkspace } from "@/lib/session";
import { planById } from "@/lib/plans";
import { alerts, kpis, rfqs, savingsSeries, usage, watchlist, type RfqStatus } from "@/lib/data/dashboard";
import { formatDate, formatEUR, formatPct } from "@/lib/format";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { SeverityIcon, severityLabel } from "@/components/ui/status";
import { KpiTile, PageHeader, UsageMeter } from "@/components/dashboard/primitives";
import { ActivationNotice } from "@/components/dashboard/workspace-controls";
import { SavingsChart } from "@/components/charts/savings-chart";

export const metadata: Metadata = { title: "Overview" };

const rfqStatus: Record<RfqStatus, { label: string; tone: BadgeTone }> = {
  awaiting: { label: "Awaiting quotes", tone: "neutral" },
  quoted: { label: "Quoted", tone: "cyan" },
  negotiating: { label: "Negotiating", tone: "amber" },
  awarded: { label: "Awarded", tone: "emerald" },
};

async function Greeting() {
  const ws = await getWorkspace();
  return (
    <>
      {ws.company} · {planById[ws.tier].name} plan
    </>
  );
}

async function PlanUsage() {
  const ws = await getWorkspace();
  const plan = planById[ws.tier];
  return (
    <div className="space-y-4 p-4">
      <UsageMeter label="Supplier contact unlocks" used={usage.contactUnlocks} limit={plan.limits.contactUnlocks} />
      <UsageMeter label="API calls this month" used={plan.limits.apiCallsPerMonth ? usage.apiCalls : 0} limit={plan.limits.apiCallsPerMonth} />
      <UsageMeter label="Seats" used={Math.min(usage.seats, plan.seats === "unlimited" ? usage.seats : plan.seats)} limit={plan.seats} />
      <UsageMeter label="Watchlist SKUs" used={Math.min(usage.watchlistSkus, plan.limits.watchlistSkus === "unlimited" ? usage.watchlistSkus : plan.limits.watchlistSkus)} limit={plan.limits.watchlistSkus} />
      <Link href="/dashboard/billing" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200">
        Manage plan <ArrowRight aria-hidden className="size-3" />
      </Link>
    </div>
  );
}

function PlanUsageFallback() {
  return (
    <div aria-hidden className="space-y-4 p-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-7 animate-pulse rounded bg-surface-2" />
      ))}
    </div>
  );
}

export default async function OverviewPage() {
  const { rows } = await getMarketSnapshot(true);
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const ytd = savingsSeries.filter((p) => p.month.startsWith("2026")).reduce((s, p) => s + p.value, 0);
  const complete = savingsSeries.filter((p) => !p.partial);
  const best = complete.reduce((a, b) => (b.value > a.value ? b : a));
  const lastQuarter = complete.slice(-3).reduce((s, p) => s + p.value, 0);
  const savingsStats = [
    { label: "Year to date", value: formatEUR(ytd, { compact: true }) },
    { label: `Best month (${best.label})`, value: formatEUR(best.value, { compact: true }) },
    { label: "Trailing 3-month average", value: formatEUR(lastQuarter / 3, { compact: true }) },
    { label: "Annualised run rate", value: formatEUR((lastQuarter / 3) * 12, { compact: true }) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Overview"
        description={
          <Suspense fallback="Loading workspace…">
            <Greeting />
          </Suspense>
        }
      />

      <Suspense fallback={null}>
        <ActivationNotice />
      </Suspense>

      <section aria-label="Key figures" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map(({ id, ...kpi }) => (
          <KpiTile key={id} {...kpi} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="flex flex-col xl:col-span-2">
          <PanelHeader
            title="Realised savings vs. broker median"
            description={`Monthly, awarded orders · ${formatEUR(ytd, { compact: true })} year to date`}
          />
          <div className="p-4">
            <SavingsChart data={savingsSeries} />
          </div>
          <dl className="mt-auto grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
            {savingsStats.map((s) => (
              <div key={s.label} className="bg-surface px-4 py-3">
                <dt className="text-[11px] text-ink-3">{s.label}</dt>
                <dd className="mt-0.5 text-base font-semibold text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel>
          <PanelHeader title="Alerts" description="Compliance and price monitoring" />
          <ul className="divide-y divide-line">
            {alerts.map((a) => (
              <li key={a.id} className="flex gap-3 px-4 py-3">
                <SeverityIcon severity={a.severity} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-medium text-ink">{a.title}</p>
                    <span className="shrink-0 text-[10px] text-ink-3">{a.time}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{a.body}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-ink-3">{severityLabel(a.severity)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader title="Open RFQs" description="Quotes received from verified vendors" />
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-xs">
              <thead className="text-[11px] text-ink-3">
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2 font-medium">RFQ</th>
                  <th scope="col" className="px-3 py-2 font-medium">Product</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Quotes</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Best quote</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">vs. broker</th>
                  <th scope="col" className="px-3 py-2 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-ink-2">{r.id}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink">{r.product}</div>
                      <div className="text-[11px] text-ink-3">{r.quantity}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-2">{r.quotes}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink">{r.bestQuote ? formatEUR(r.bestQuote) : "—"}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-emerald-300">{r.vsBroker ? formatPct(r.vsBroker) : "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={rfqStatus[r.status].tone}>{rfqStatus[r.status].label}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-3">{formatDate(r.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Plan usage" description="Current billing period" />
          <Suspense fallback={<PlanUsageFallback />}>
            <PlanUsage />
          </Suspense>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Watchlist"
          description="Tracked offers · 7-day price movement"
          actions={
            <Link href="/dashboard/matrix" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200">
              Open matrix <ArrowRight aria-hidden className="size-3" />
            </Link>
          }
        />
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-xs">
            <thead className="text-[11px] text-ink-3">
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-2 font-medium">Product</th>
                <th scope="col" className="px-3 py-2 font-medium">Vendor</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Direct rate</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">7-day change</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Broker median</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Spread</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((w) => {
                const row = rowById.get(w.offerId);
                if (!row) return null;
                return (
                  <tr key={w.offerId} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-ink">{row.product.name}</div>
                      <div className="font-mono text-[10px] text-ink-3">
                        {row.sku} · {row.product.unit}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-ink-2">{row.supplierLabel}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-ink">{formatEUR(row.unitPrice)}</td>
                    <td
                      className={`px-3 py-2.5 text-right tabular-nums ${w.change7d < 0 ? "text-emerald-300" : w.change7d > 0 ? "text-orange-300" : "text-ink-3"}`}
                    >
                      {w.change7d === 0 ? "0.0%" : formatPct(w.change7d, { signed: true })}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-3">{formatEUR(row.brokerMedian)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">{formatPct(row.spread)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
