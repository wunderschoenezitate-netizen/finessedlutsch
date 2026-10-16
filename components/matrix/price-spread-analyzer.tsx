"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, Lock, Mail, Trophy } from "lucide-react";
import type { MatrixRow, Product } from "@/lib/types";
import { channelBuildUp, segmentColors, summariseSpread } from "@/lib/spread";
import { categoryOptions } from "@/lib/matrix/query";
import { formatDays, formatEUR, formatNumber, formatPct } from "@/lib/format";
import { BuildUpChart } from "@/components/charts/build-up-chart";
import { Field, Input, Select } from "@/components/ui/field";
import { AuditBadge } from "@/components/ui/status";
import { buttonClasses } from "@/components/ui/button";
import { clamp, cn } from "@/lib/utils";

function defaultVolume(productRows: MatrixRow[]) {
  const smallestMoq = Math.min(...productRows.map((r) => r.moq));
  return Number.isFinite(smallestMoq) ? smallestMoq * 12 : 12;
}

function rfqMailto(row: MatrixRow, volume: number) {
  const slug = row.supplier.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const subject = encodeURIComponent(`RFQ ${row.sku} — ${row.product.name}`);
  const body = encodeURIComponent(
    `Product: ${row.product.name} (${row.product.spec})\nOffer reference: ${row.sku}\nAnnual volume: ${volume} × ${row.product.unit}\nIncoterm: ${row.incoterm}\n\nSent via Origo verified sourcing.`,
  );
  return `mailto:sales@${slug}.example?subject=${subject}&body=${body}`;
}

export function PriceSpreadAnalyzer({
  products,
  rows,
  initialProductId,
  canContact,
  className,
}: {
  products: Product[];
  rows: MatrixRow[];
  initialProductId?: string;
  /** Members may contact vendors directly; preview visitors are routed to the access portal */
  canContact: boolean;
  className?: string;
}) {
  const [productId, setProductId] = useState(initialProductId ?? products[0]?.id);
  const product = products.find((p) => p.id === productId) ?? products[0];
  const productRows = useMemo(
    () => rows.filter((r) => r.product.id === product.id).sort((a, b) => a.unitPrice - b.unitPrice),
    [rows, product.id],
  );
  // Raw input per product so the field can be cleared while typing.
  const [volumeInput, setVolumeInput] = useState<Record<string, string>>({});
  const rawVolume = volumeInput[product.id] ?? String(defaultVolume(productRows));
  const volume = clamp(Number.parseInt(rawVolume, 10) || 0, 0, 1_000_000);

  const buildUp = useMemo(() => channelBuildUp(product), [product]);
  const summary = useMemo(() => summariseSpread(product, rows), [product, rows]);
  const annualSaving = summary.savingPerUnit * volume;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <Field label="Product line" htmlFor="analyzer-product">
          <Select id="analyzer-product" value={product.id} onChange={(e) => setProductId(e.target.value)}>
            {categoryOptions.map((cat) => {
              const items = products.filter((p) => p.category === cat);
              if (!items.length) return null;
              return (
                <optgroup key={cat} label={cat}>
                  {items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.unit}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </Select>
        </Field>
        <Field label={`Annual volume (${product.unit})`} htmlFor="analyzer-volume">
          <Input
            id="analyzer-volume"
            type="number"
            inputMode="numeric"
            min={0}
            max={1_000_000}
            value={rawVolume}
            onChange={(e) => {
              const next = e.target.value;
              setVolumeInput((v) => ({ ...v, [product.id]: next }));
            }}
            className="tabular-nums"
          />
        </Field>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
        <div className="bg-surface-2 p-3.5">
          <dt className="text-[11px] text-ink-3">Broker median</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">{formatEUR(summary.brokerMedian)}</dd>
          <dd className="text-[11px] text-ink-3">per {product.unit}</dd>
        </div>
        <div className="bg-surface-2 p-3.5">
          <dt className="text-[11px] text-ink-3">Best verified direct quote</dt>
          <dd className="mt-1 text-lg font-semibold text-emerald-300">
            {formatEUR(summary.bestDirect?.unitPrice ?? product.channel.directLanded)}
          </dd>
          <dd className="truncate text-[11px] text-ink-3">{summary.bestDirect?.supplierLabel ?? "Benchmark"}</dd>
        </div>
        <div className="bg-surface-2 p-3.5">
          <dt className="text-[11px] text-ink-3">Broker spread</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">{formatPct(summary.spread)}</dd>
          <dd className="text-[11px] text-ink-3">{formatEUR(summary.savingPerUnit)} per unit</dd>
        </div>
        <div className="bg-surface-2 p-3.5">
          <dt className="text-[11px] text-ink-3">Annual saving at volume</dt>
          <dd className="mt-1 flex items-center gap-1 text-lg font-semibold text-emerald-300">
            <ArrowDownRight aria-hidden className="size-4" />
            {formatEUR(annualSaving, { decimals: 0 })}
          </dd>
          <dd className="text-[11px] tabular-nums text-ink-3">
            {formatNumber(volume)} × {product.unit}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="buildup-heading">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="buildup-heading" className="text-sm font-semibold text-ink">
            Price build-up per {product.unit}
          </h3>
          <span className="text-[11px] text-ink-3">
            HS {product.hsCode} · EUR, delivered EU (DAP)
          </span>
        </div>
        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <BuildUpChart data={buildUp} unit={product.unit} />
        </div>

        {/* Table view: every value in the chart is readable without hovering */}
        <div className="scroll-thin mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-xs">
            <caption className="sr-only">Price build-up values per channel</caption>
            <thead>
              <tr className="border-b border-line text-[11px] text-ink-3">
                <th scope="col" className="py-1.5 pr-3 font-medium">Channel</th>
                {(["factory", "logistics", "distributor", "broker"] as const).map((k) => (
                  <th key={k} scope="col" className="py-1.5 pr-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className="size-2 rounded-[2px]" style={{ background: segmentColors[k] }} />
                      {{ factory: "Factory", logistics: "Freight & duty", distributor: "Distributor", broker: "Broker" }[k]}
                    </span>
                  </th>
                ))}
                <th scope="col" className="py-1.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {buildUp.map((row) => (
                <tr key={row.channel} className="border-b border-line/60 tabular-nums text-ink-2">
                  <th scope="row" className="py-1.5 pr-3 font-medium text-ink">{row.label}</th>
                  {(["factory", "logistics", "distributor", "broker"] as const).map((k) => {
                    const seg = row.segments.find((s) => s.key === k);
                    return (
                      <td key={k} className="py-1.5 pr-3 text-right">
                        {seg ? formatEUR(seg.value) : <span className="text-ink-3">—</span>}
                      </td>
                    );
                  })}
                  <td className="py-1.5 text-right font-semibold text-ink">{formatEUR(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="quotes-heading">
        <h3 id="quotes-heading" className="mb-3 text-sm font-semibold text-ink">
          Verified quotes · {productRows.length}
        </h3>
        <ul className="divide-y divide-line rounded-lg border border-line">
          {productRows.map((row, idx) => (
            <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3.5 py-3">
              <div className="min-w-0 flex-1 basis-56">
                <div className="flex items-center gap-2">
                  {idx === 0 ? <Trophy aria-label="Best quote" className="size-3.5 text-emerald-400" /> : null}
                  <span className="truncate text-sm font-medium text-ink">{row.supplierLabel}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
                  <AuditBadge status={row.supplier.audit.status} score={row.supplier.audit.score} />
                  <span>
                    {row.dispatchHub.city}, {row.dispatchHub.country}
                  </span>
                  <span>·</span>
                  <span>{formatDays(row.leadTimeDays)} lead time</span>
                  <span>·</span>
                  <span>MOQ {formatNumber(row.moq)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums text-ink">{formatEUR(row.unitPrice)}</div>
                <div className="text-[11px] tabular-nums text-emerald-300">{formatPct(-(1 - row.unitPrice / row.brokerMedian))} vs. broker</div>
              </div>
              {canContact ? (
                <a href={rfqMailto(row, volume)} className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  <Mail aria-hidden />
                  Request quote
                </a>
              ) : (
                <Link href="/access?plan=pro" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  <Lock aria-hidden />
                  Unlock contact
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
