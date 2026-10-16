"use client";

import { useState } from "react";
import type { ChannelBuildUp, BuildUpSegmentKey } from "@/lib/spread";
import { segmentColors, segmentLabels } from "@/lib/spread";
import { formatEUR, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const ORDER: BuildUpSegmentKey[] = ["factory", "logistics", "distributor", "broker"];
/** Longest bar uses this share of the track so the tip label always fits. */
const SCALE_HEADROOM = 0.8;

/** Keep the tooltip inside the track: anchor left, centre or right depending on position (0–1). */
function tooltipAlign(position: number) {
  if (position < 0.2) return "left-0";
  if (position > 0.6) return "right-0";
  return "left-1/2 -translate-x-1/2";
}

interface HoverState {
  row: number;
  key: BuildUpSegmentKey;
}

/**
 * Horizontal stacked bars: price build-up per unit for each procurement channel.
 * Segments are separated by a 2px surface gap; totals sit at the bar tip.
 */
export function BuildUpChart({ data, unit }: { data: ChannelBuildUp[]; unit: string }) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const max = Math.max(...data.map((d) => d.total));
  const direct = data[0]?.total ?? 1;

  return (
    <figure className="m-0">
      <figcaption className="sr-only">Price build-up per {unit} across procurement channels</figcaption>

      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legend">
        {ORDER.map((key) => (
          <li key={key} className="flex items-center gap-1.5 text-[11px] text-ink-2">
            <span aria-hidden className="size-2.5 rounded-[2px]" style={{ background: segmentColors[key] }} />
            {segmentLabels[key]}
          </li>
        ))}
      </ul>

      <div className="space-y-3.5">
        {data.map((row, rowIdx) => {
          let offset = 0;
          const barShare = (row.total / max) * SCALE_HEADROOM;
          return (
            <div key={row.channel} className="grid grid-cols-1 gap-1.5 sm:grid-cols-[11rem_1fr] sm:items-center sm:gap-4">
              <div className="min-w-0">
                <div className="text-xs font-medium text-ink">{row.label}</div>
                <div className="truncate text-[11px] text-ink-3">{row.description}</div>
              </div>

              <div className="relative flex h-6 items-center border-l border-line-strong">
                <div className="flex h-5 items-stretch gap-[2px]" style={{ width: `${barShare * 100}%` }}>
                  {row.segments.map((seg, segIdx) => {
                    const widthPct = (seg.value / row.total) * 100;
                    const start = offset;
                    offset += widthPct;
                    const isLast = segIdx === row.segments.length - 1;
                    const active = hover?.row === rowIdx && hover.key === seg.key;
                    const share = seg.value / row.total;
                    return (
                      <div
                        key={seg.key}
                        tabIndex={0}
                        role="img"
                        aria-label={`${row.label} — ${seg.label}: ${formatEUR(seg.value)} (${formatPct(share)} of price)`}
                        onPointerEnter={() => setHover({ row: rowIdx, key: seg.key })}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover({ row: rowIdx, key: seg.key })}
                        onBlur={() => setHover(null)}
                        className={cn(
                          "relative min-w-[3px] cursor-default outline-none transition-[filter] focus-visible:ring-2 focus-visible:ring-ink/70",
                          isLast && "rounded-r-[4px]",
                          active && "brightness-125",
                        )}
                        style={{ width: `${widthPct}%`, background: segmentColors[seg.key] }}
                      >
                        {active ? (
                          <div
                            role="tooltip"
                            className={cn(
                              "pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-[14rem] rounded-md border border-line-strong bg-surface-3 px-2.5 py-1.5 shadow-lg",
                              tooltipAlign(((start + widthPct / 2) / 100) * barShare),
                            )}
                          >
                            <div className="text-sm font-semibold tabular-nums text-ink">{formatEUR(seg.value)}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-ink-2">
                              <span aria-hidden className="h-0.5 w-3 rounded" style={{ background: segmentColors[seg.key] }} />
                              {seg.label} · {formatPct(share)}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="ml-2 flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-xs font-semibold tabular-nums text-ink">{formatEUR(row.total)}</span>
                  {rowIdx > 0 ? (
                    <span className="text-[11px] tabular-nums text-ink-3">{formatPct(row.total / direct - 1, { signed: true })}</span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
