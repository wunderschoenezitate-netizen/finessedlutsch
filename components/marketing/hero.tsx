import { ArrowRight, BadgeCheck, Fingerprint, ScanSearch } from "lucide-react";
import Link from "next/link";
import type { MatrixRow } from "@/lib/types";
import { platformMetrics } from "@/lib/site";
import { formatEUR, formatPct } from "@/lib/format";
import { median } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

function MarketSnapshot({ rows }: { rows: MatrixRow[] }) {
  // One row per product line: the widest spread against its best direct quote.
  const byProduct = new Map<string, MatrixRow>();
  for (const r of rows) {
    const current = byProduct.get(r.product.id);
    if (!current || r.spread > current.spread) byProduct.set(r.product.id, r);
  }
  const top = [...byProduct.values()].sort((a, b) => b.spread - a.spread).slice(0, 6);
  const maxSpread = top[0]?.spread ?? 1;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-cyan-400 motion-reduce:animate-none" />
          <span className="text-xs font-semibold text-ink">Market snapshot</span>
          <span className="text-[11px] text-ink-3">Widest broker spreads</span>
        </div>
        <span className="font-mono text-[10px] text-ink-3">EUR · DAP EU</span>
      </div>
      <table className="w-full text-left text-xs">
        <caption className="sr-only">Product lines with the widest spread between broker median and best verified direct quote</caption>
        <thead className="text-[10px] uppercase tracking-wider text-ink-3">
          <tr className="border-b border-line">
            <th scope="col" className="px-4 py-2 font-medium">Product</th>
            <th scope="col" className="px-2 py-2 text-right font-medium">Direct</th>
            <th scope="col" className="hidden px-2 py-2 text-right font-medium sm:table-cell">Broker</th>
            <th scope="col" className="px-4 py-2 font-medium">Spread</th>
          </tr>
        </thead>
        <tbody>
          {top.map((row) => (
            <tr key={row.id} className="border-b border-line/60 last:border-b-0">
              <td className="max-w-[12rem] px-4 py-2.5">
                <div className="truncate font-medium text-ink">{row.product.name}</div>
                <div className="truncate text-[10px] text-ink-3">{row.supplierLabel}</div>
              </td>
              <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-emerald-300">{formatEUR(row.unitPrice)}</td>
              <td className="hidden px-2 py-2.5 text-right tabular-nums text-ink-3 line-through decoration-ink-3/50 sm:table-cell">
                {formatEUR(row.brokerMedian)}
              </td>
              <td className="w-32 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-right font-semibold tabular-nums text-ink">{formatPct(row.spread, { decimals: 0 })}</span>
                  <span aria-hidden className="h-1.5 flex-1 rounded-full bg-surface-3">
                    <span className="block h-full rounded-full bg-series-broker" style={{ width: `${(row.spread / maxSpread) * 100}%` }} />
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[11px]">
        <span className="text-ink-3">
          Median spread, all quotes:{" "}
          <span className="font-semibold tabular-nums text-ink">{formatPct(median(rows.map((r) => r.spread)))}</span>
        </span>
        <Link href="/matrix" className="inline-flex items-center gap-1 font-medium text-emerald-300 hover:text-emerald-200">
          Open matrix <ArrowRight aria-hidden className="size-3" />
        </Link>
      </div>
    </div>
  );
}

export function Hero({ rows }: { rows: MatrixRow[] }) {
  const categories = new Set(rows.map((r) => r.product.category)).size;
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3 py-1 text-xs text-ink-2">
            <span aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-cyan-400 motion-reduce:animate-none" />
            Live: {rows.length} verified quotes across {categories} categories
          </p>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Source direct from certified European manufacturers.{" "}
            <span className="text-ink-3">Without the broker markup.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-2">
            Origo indexes audited OEMs, laboratories and EU logistics hubs, normalises their quotes to landed cost, and
            shows exactly what intermediaries add on top. Compare, verify and contract directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/matrix" size="lg">
              Open the comparison matrix
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href="/#pricing" size="lg" variant="secondary">
              Membership tiers
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-3">
            <li className="flex items-center gap-1.5">
              <BadgeCheck aria-hidden className="size-4 text-emerald-400" />
              ISO, EU GMP &amp; GDP certificates validated at source
            </li>
            <li className="flex items-center gap-1.5">
              <Fingerprint aria-hidden className="size-4 text-emerald-400" />
              VIES, EORI &amp; trade-register checks
            </li>
            <li className="flex items-center gap-1.5">
              <ScanSearch aria-hidden className="size-4 text-emerald-400" />
              Daily sanctions screening
            </li>
          </ul>
        </div>

        <MarketSnapshot rows={rows} />
      </div>

      <div className="relative border-t border-line bg-surface/60">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-4 sm:px-6 lg:grid-cols-4 lg:divide-x">
          {platformMetrics.map((m) => (
            <div key={m.label} className="px-0 py-6 lg:px-6 lg:first:pl-0">
              <dt className="text-xs text-ink-3">{m.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-ink">{m.value}</dd>
              <dd className="mt-0.5 text-[11px] text-ink-3">{m.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
