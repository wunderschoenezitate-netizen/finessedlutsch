"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { computeRoi, positionFromSpend, spendFromPosition, SPEND_MAX, SPEND_MIN, SPEND_STEPS } from "@/lib/roi";
import { annualCost, planById } from "@/lib/plans";
import type { PlanId } from "@/lib/types";
import { formatEUR, formatPct } from "@/lib/format";
import { RangeField, Segmented } from "@/components/ui/controls";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SegmentKey = "direct" | "markup" | "other";

const segmentStyle: Record<SegmentKey, { label: string; color: string }> = {
  direct: { label: "Direct landed cost", color: "var(--color-series-factory)" },
  markup: { label: "Avoidable broker markup", color: "var(--color-series-broker)" },
  other: { label: "Not yet addressable", color: "var(--color-series-neutral)" },
};

export function RoiCalculator() {
  const [spendPos, setSpendPos] = useState(positionFromSpend(4_200_000));
  const [markup, setMarkup] = useState(28);
  const [share, setShare] = useState(65);
  const [plan, setPlan] = useState<Extract<PlanId, "pro" | "enterprise">>("pro");
  const [hover, setHover] = useState<SegmentKey | null>(null);

  const spend = spendFromPosition(spendPos);
  const subscription = annualCost(planById[plan], "annual");
  const result = useMemo(
    () =>
      computeRoi({
        intermediatedSpend: spend,
        brokerMarkup: markup / 100,
        addressableShare: share / 100,
        subscriptionCost: subscription,
      }),
    [spend, markup, share, subscription],
  );

  const segments: { key: SegmentKey; value: number }[] = [
    { key: "direct", value: result.directCost },
    { key: "markup", value: result.avoidableMarkup },
    { key: "other", value: result.nonAddressableSpend },
  ];

  return (
    <div className="grid overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Inputs */}
      <div className="space-y-6 border-b border-line p-6 lg:border-b-0 lg:border-r">
        <RangeField
          label="Annual spend routed through brokers"
          min={0}
          max={SPEND_STEPS}
          value={spendPos}
          onChange={setSpendPos}
          display={formatEUR(spend, { compact: true })}
          minLabel={formatEUR(SPEND_MIN, { compact: true })}
          maxLabel={formatEUR(SPEND_MAX, { compact: true })}
        />
        <RangeField
          label="Average broker markup over direct landed cost"
          min={5}
          max={60}
          value={markup}
          onChange={setMarkup}
          display={`${markup}%`}
          minLabel="5%"
          maxLabel="60%"
          hint="Platform median across indexed categories: 32.8%"
        />
        <RangeField
          label="Share of that spend available from verified direct sources"
          min={10}
          max={100}
          step={5}
          value={share}
          onChange={setShare}
          display={`${share}%`}
          minLabel="10%"
          maxLabel="100%"
        />
        <div>
          <span id="roi-plan-label" className="mb-1.5 block text-xs font-medium text-ink-2">
            Membership (billed annually)
          </span>
          <Segmented
            label="Membership tier"
            value={plan}
            onChange={setPlan}
            options={[
              { value: "pro", label: `Pro · ${formatEUR(annualCost(planById.pro, "annual"), { decimals: 0 })}/yr` },
              { value: "enterprise", label: `Enterprise · from ${formatEUR(annualCost(planById.enterprise, "annual"), { compact: true })}/yr` },
            ]}
          />
        </div>
      </div>

      {/* Outputs */}
      <div className="p-6">
        <p className="text-xs font-medium text-ink-2">Estimated net annual savings</p>
        <p className={cn("mt-1 text-5xl font-semibold tracking-tight", result.netSavings >= 0 ? "text-ink" : "text-ink-2")} aria-live="polite">
          {formatEUR(result.netSavings, { decimals: 0 })}
        </p>
        <p className="mt-1 text-xs text-ink-3">After membership fees. Gross avoidable markup {formatEUR(result.avoidableMarkup, { decimals: 0 })}.</p>

        <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
          <div className="bg-surface-2 p-3">
            <dt className="text-[11px] text-ink-3">Return on fees</dt>
            <dd className="mt-0.5 text-lg font-semibold text-ink">{result.roiMultiple > 0 ? `${result.roiMultiple.toFixed(1)}×` : "—"}</dd>
          </div>
          <div className="bg-surface-2 p-3">
            <dt className="text-[11px] text-ink-3">Payback period</dt>
            <dd className="mt-0.5 text-lg font-semibold text-ink">
              {Number.isFinite(result.paybackDays) ? `${result.paybackDays} days` : "—"}
            </dd>
          </div>
          <div className="bg-surface-2 p-3">
            <dt className="text-[11px] text-ink-3">Effective cost reduction</dt>
            <dd className="mt-0.5 text-lg font-semibold text-ink">{formatPct(result.avoidableMarkup / spend)}</dd>
          </div>
        </dl>

        {/* Composition of current intermediated spend */}
        <figure className="mt-6">
          <figcaption className="mb-2 text-xs font-medium text-ink-2">Where today&apos;s broker spend goes</figcaption>
          <div className="relative flex h-5 gap-[2px]">
            {segments.map((seg, i) => {
              const pct = (seg.value / spend) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={seg.key}
                  tabIndex={0}
                  role="img"
                  aria-label={`${segmentStyle[seg.key].label}: ${formatEUR(seg.value, { decimals: 0 })}`}
                  onPointerEnter={() => setHover(seg.key)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(seg.key)}
                  onBlur={() => setHover(null)}
                  className={cn(
                    "relative min-w-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ink/70",
                    i === segments.length - 1 && "rounded-r-[4px]",
                    hover === seg.key && "brightness-125",
                  )}
                  style={{ width: `${pct}%`, background: segmentStyle[seg.key].color }}
                />
              );
            })}
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {segments.map((seg) => (
              <li
                key={seg.key}
                className={cn("rounded-md border px-2.5 py-2 transition-colors", hover === seg.key ? "border-line-strong bg-surface-2" : "border-transparent")}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
                  <span aria-hidden className="size-2.5 rounded-[2px]" style={{ background: segmentStyle[seg.key].color }} />
                  {segmentStyle[seg.key].label}
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                  {formatEUR(seg.value, { compact: true })}
                  <span className="ml-1.5 text-[11px] font-normal text-ink-3">{formatPct(seg.value / spend, { decimals: 0 })}</span>
                </div>
              </li>
            ))}
          </ul>
        </figure>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="max-w-sm text-[11px] leading-relaxed text-ink-3">
            Model: avoidable share = markup ÷ (1 + markup), applied to addressable spend. Excludes switching costs and
            volume rebates. Indicative only.
          </p>
          <ButtonLink href={`/access?plan=${plan}&cycle=annual`}>
            Start with {planById[plan].name}
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
