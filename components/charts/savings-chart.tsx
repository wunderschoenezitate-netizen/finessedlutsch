"use client";

import { useState } from "react";
import type { SavingsPoint } from "@/lib/data/dashboard";
import { formatEUR, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const PLOT_HEIGHT = 248;

function niceMax(value: number) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 2.5, 5, 10];
  const step = steps.find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * Monthly realised savings — single series column chart.
 * Bars ≤ 24px with 4px rounded caps; hairline solid gridlines; the peak month is direct-labelled.
 */
export function SavingsChart({ data }: { data: SavingsPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, max / 2, max];
  const peakIdx = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  return (
    <figure className="m-0">
      <figcaption className="sr-only">Monthly realised savings versus broker median, last 12 months</figcaption>
      <div className="flex">
        {/* Y axis */}
        <div className="relative mr-2 w-10 shrink-0" style={{ height: PLOT_HEIGHT }} aria-hidden>
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-ink-3"
              style={{ top: PLOT_HEIGHT - (t / max) * PLOT_HEIGHT }}
            >
              {formatEUR(t, { compact: true, decimals: 0 })}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((t) => (
              <div
                key={t}
                aria-hidden
                className={cn("absolute inset-x-0 h-px", t === 0 ? "bg-line-strong" : "bg-line")}
                style={{ top: PLOT_HEIGHT - (t / max) * PLOT_HEIGHT }}
              />
            ))}

            <div className="absolute inset-0 flex">
              {data.map((d, i) => {
                const height = (d.value / max) * PLOT_HEIGHT;
                const prev = data[i - 1];
                const isActive = active === i;
                const showLabel = i === peakIdx || isActive;
                return (
                  <div
                    key={d.month}
                    tabIndex={0}
                    role="img"
                    aria-label={`${d.label}${d.partial ? " (month to date)" : ""}: ${formatEUR(d.value)}`}
                    onPointerEnter={() => setActive(i)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="group relative flex flex-1 cursor-default items-end justify-center outline-none focus-visible:bg-white/[0.03]"
                  >
                    {isActive ? <div aria-hidden className="absolute inset-0 bg-white/[0.03]" /> : null}
                    <div
                      className={cn(
                        "relative w-[min(60%,24px)] rounded-t-[4px] transition-[filter]",
                        d.partial ? "bg-series-factory/45" : "bg-series-factory",
                        isActive && "brightness-125",
                      )}
                      style={{ height }}
                    >
                      {showLabel && !isActive ? (
                        <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tabular-nums text-ink">
                          {formatEUR(d.value, { compact: true })}
                        </span>
                      ) : null}
                    </div>

                    {isActive ? (
                      <div
                        role="tooltip"
                        className={cn(
                          "pointer-events-none absolute z-10 w-max rounded-md border border-line-strong bg-surface-3 px-2.5 py-1.5 shadow-lg",
                          i > data.length - 4 ? "right-0" : i < 3 ? "left-0" : "left-1/2 -translate-x-1/2",
                        )}
                        style={{ bottom: height + 8 }}
                      >
                        <div className="text-sm font-semibold tabular-nums text-ink">{formatEUR(d.value)}</div>
                        <div className="text-[11px] text-ink-2">
                          {d.label} {d.month.slice(0, 4)}
                          {d.partial ? " · month to date" : ""}
                        </div>
                        {prev && !d.partial ? (
                          <div className="text-[11px] tabular-nums text-ink-3">
                            {formatPct(d.value / prev.value - 1, { signed: true })} vs. {prev.label}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis */}
          <div className="mt-1.5 flex" aria-hidden>
            {data.map((d) => (
              <span key={d.month} className="flex-1 text-center text-[10px] text-ink-3">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
