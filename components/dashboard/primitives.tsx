import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatEUR, formatNumber, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? <div className="mt-1 text-sm text-ink-3">{description}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Stat tile: label · value (proportional figures) · optional signed delta vs. a named period. */
export function KpiTile({
  label,
  value,
  format,
  delta,
  deltaLabel,
  upIsGood = true,
  note,
}: {
  label: string;
  value: number;
  format: "eur" | "pct" | "int";
  delta?: number;
  deltaLabel?: string;
  upIsGood?: boolean;
  note?: string;
}) {
  const formatted =
    format === "eur" ? formatEUR(value, { compact: true }) : format === "pct" ? formatPct(value) : formatNumber(value);
  const good = delta === undefined ? null : delta >= 0 === upIsGood;
  const DeltaIcon = delta !== undefined && delta < 0 ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-ink-3">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{formatted}</p>
      {delta !== undefined ? (
        <p className="mt-1 flex items-center gap-1 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium tabular-nums", good ? "text-emerald-400" : "text-orange-300")}>
            <DeltaIcon aria-hidden className="size-3.5" />
            {format === "pct" ? `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(1)}` : formatPct(delta, { signed: true })}
          </span>
          <span className="text-ink-3">{deltaLabel}</span>
        </p>
      ) : note ? (
        <p className="mt-1 text-xs text-ink-3">{note}</p>
      ) : null}
    </div>
  );
}

/** Usage meter: the fill carries severity; the track is a lighter step of the same ramp. */
export function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | "unlimited";
}) {
  const unlimited = limit === "unlimited";
  const ratio = unlimited || limit === 0 ? 0 : Math.min(1, used / limit);
  const tone = unlimited ? "emerald" : ratio >= 0.9 ? "orange" : ratio >= 0.75 ? "amber" : "emerald";
  const fill = { emerald: "bg-emerald-500", amber: "bg-amber-500", orange: "bg-orange-500" }[tone];
  const track = { emerald: "bg-emerald-500/15", amber: "bg-amber-500/15", orange: "bg-orange-500/15" }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-ink-2">{label}</span>
        <span className="tabular-nums text-ink">
          {formatNumber(used)}
          <span className="text-ink-3"> / {unlimited ? "Unlimited" : limit === 0 ? "Not included" : formatNumber(limit)}</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={unlimited ? undefined : limit}
        aria-valuenow={used}
        className={cn("mt-1.5 h-1.5 overflow-hidden rounded-full", limit === 0 ? "bg-surface-3" : track)}
      >
        {!unlimited && limit !== 0 ? <div className={cn("h-full rounded-full", fill)} style={{ width: `${ratio * 100}%` }} /> : null}
      </div>
    </div>
  );
}
