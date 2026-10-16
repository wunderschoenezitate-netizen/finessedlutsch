import type { MatrixRow } from "@/lib/types";
import { formatEUR, formatPct } from "@/lib/format";

/** Scrolling strip of best direct quotes. Pauses on hover; static under reduced motion. */
export function LiveTicker({ rows }: { rows: MatrixRow[] }) {
  const best = new Map<string, MatrixRow>();
  for (const r of rows) {
    const current = best.get(r.product.id);
    if (!current || r.unitPrice < current.unitPrice) best.set(r.product.id, r);
  }
  const items = [...best.values()];

  const strip = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((r) => (
        <li key={r.id} className="flex items-center gap-2 whitespace-nowrap border-r border-line px-5 text-xs">
          <span className="text-ink-2">{r.product.name}</span>
          <span className="font-mono text-[10px] text-ink-3">{r.product.unit}</span>
          <span className="font-semibold tabular-nums text-ink">{formatEUR(r.unitPrice)}</span>
          <span className="tabular-nums text-emerald-300">{formatPct(-(1 - r.unitPrice / r.brokerMedian))}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Best verified direct quotes vs. broker median" className="border-b border-line bg-surface">
      <div className="group relative flex overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {strip(false)}
          {strip(true)}
        </div>
      </div>
    </section>
  );
}
