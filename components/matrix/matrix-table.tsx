"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChartColumn, Lock } from "lucide-react";
import type { MatrixRow } from "@/lib/types";
import type { MatrixQuery, SortKey } from "@/lib/matrix/query";
import { formatEUR, formatNumber, formatPct, formatRelativeMinutes } from "@/lib/format";
import { AuditBadge } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type Density = "compact" | "comfortable";

/** Spread bars share one scale so lengths are comparable across rows. */
const SPREAD_SCALE_MAX = 0.5;
const MAX_CERT_BADGES = 2;

const sortLabels: Record<SortKey, string> = {
  spread: "Broker spread",
  unitPrice: "Direct rate",
  leadTimeDays: "Lead time",
  moqValue: "MOQ commitment",
  score: "Audit score",
  updated: "Last update",
  supplier: "Vendor",
};

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: MatrixQuery["sort"];
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("whitespace-nowrap px-3 py-2 font-medium", align === "right" && "text-right", className)}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 rounded hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
          active && "text-ink",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <Icon aria-hidden className={cn("size-3", !active && "opacity-50")} />
      </button>
    </th>
  );
}

function Certifications({ certs }: { certs: string[] }) {
  return (
    <div className="flex gap-1">
      {certs.slice(0, MAX_CERT_BADGES).map((c) => (
        <Badge key={c} tone={c === "EU GMP" || c === "GDP" ? "cyan" : "neutral"}>
          {c}
        </Badge>
      ))}
      {certs.length > MAX_CERT_BADGES ? (
        <Badge title={certs.slice(MAX_CERT_BADGES).join(", ")}>
          +{certs.length - MAX_CERT_BADGES}
          <span className="sr-only">: {certs.slice(MAX_CERT_BADGES).join(", ")}</span>
        </Badge>
      ) : null}
    </div>
  );
}

function SpreadBar({ spread }: { spread: number }) {
  return (
    <span aria-hidden className="h-1.5 w-14 shrink-0 rounded-full bg-surface-3">
      <span
        className="block h-full rounded-full bg-series-broker"
        style={{ width: `${Math.min(1, spread / SPREAD_SCALE_MAX) * 100}%` }}
      />
    </span>
  );
}

function VendorCell({ row }: { row: MatrixRow }) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        {row.supplierMasked ? <Lock aria-label="Identity masked" className="size-3 shrink-0 text-ink-3" /> : null}
        <span className={cn("truncate", row.supplierMasked ? "text-ink-2" : "font-medium text-ink")} title={row.supplierLabel}>
          {row.supplierLabel}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-3">
        <AuditBadge status={row.supplier.audit.status} score={row.supplier.audit.score} />
        {!row.supplierMasked ? <span className="truncate">{row.supplier.type}</span> : null}
      </div>
    </>
  );
}

function AnalyzeButton({ row, onAnalyze }: { row: MatrixRow; onAnalyze: (productId: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onAnalyze(row.product.id)}
      className="inline-flex items-center gap-1 rounded-md border border-line-strong px-2 py-1 text-[11px] font-medium text-ink-2 transition-colors hover:border-emerald-500/50 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      aria-label={`Analyze price spread for ${row.product.name} (${row.sku})`}
    >
      <ChartColumn aria-hidden className="size-3" />
      Analyze
    </button>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink">No verified offers match these filters.</p>
      <p className="mt-1 text-xs text-ink-3">Widen the MOQ or lead-time limits, or remove a certification requirement.</p>
    </div>
  );
}

interface MatrixViewProps {
  rows: MatrixRow[];
  sort: MatrixQuery["sort"];
  onSort: (key: SortKey) => void;
  density: Density;
  onAnalyze: (productId: string) => void;
}

/** Dense grid for md+ viewports, card list below. Both render the same rows and sort state. */
export function MatrixTable(props: MatrixViewProps) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopTable {...props} />
      </div>
      <div className="md:hidden">
        <MobileList {...props} />
      </div>
    </>
  );
}

function DesktopTable({ rows, sort, onSort, density, onAnalyze }: MatrixViewProps) {
  const cell = density === "compact" ? "px-3 py-2" : "px-3 py-3.5";

  return (
    <div className="scroll-thin max-h-[72vh] overflow-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[1020px] border-separate border-spacing-0 text-left text-xs">
        <caption className="sr-only">Verified wholesale offers. Column headers with buttons can be sorted.</caption>
        <thead className="sticky top-0 z-10 bg-surface-2 text-[11px] text-ink-3 [&_th]:border-b [&_th]:border-line">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Product
            </th>
            <SortHeader label="Vendor" sortKey="supplier" sort={sort} onSort={onSort} />
            <SortHeader label="Direct rate" sortKey="unitPrice" sort={sort} onSort={onSort} align="right" />
            <SortHeader label="Broker spread" sortKey="spread" sort={sort} onSort={onSort} />
            <SortHeader label="MOQ" sortKey="moqValue" sort={sort} onSort={onSort} align="right" />
            <SortHeader label="Lead time" sortKey="leadTimeDays" sort={sort} onSort={onSort} align="right" />
            <th scope="col" className="px-3 py-2 font-medium">
              Dispatch
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Certifications
            </th>
            <SortHeader label="Updated" sortKey="updated" sort={sort} onSort={onSort} align="right" className="hidden 2xl:table-cell" />
            <th scope="col" className="px-3 py-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-line/70 [&_tr:last-child_td]:border-b-0">
          {rows.map((row) => (
            <tr key={row.id} className="align-middle hover:bg-white/[0.02]">
              <td className={cn(cell, "max-w-[16rem]")}>
                <div className="truncate font-medium text-ink" title={row.product.name}>
                  {row.product.name}
                </div>
                {density === "comfortable" ? (
                  <div className="truncate text-[11px] text-ink-3" title={row.product.spec}>
                    {row.product.spec}
                  </div>
                ) : null}
                <div className="mt-0.5 whitespace-nowrap font-mono text-[10px] text-ink-3">
                  {row.sku} · {row.product.unit}
                </div>
              </td>
              <td className={cn(cell, "max-w-[15rem]")}>
                <VendorCell row={row} />
              </td>
              <td className={cn(cell, "whitespace-nowrap text-right tabular-nums")}>
                <div className="font-semibold text-emerald-300">{formatEUR(row.unitPrice)}</div>
              </td>
              <td className={cn(cell, "whitespace-nowrap")}>
                <div className="flex items-center gap-2">
                  <span className="w-11 text-right font-semibold tabular-nums text-ink">{formatPct(row.spread)}</span>
                  <SpreadBar spread={row.spread} />
                </div>
                <div className="mt-0.5 text-[11px] tabular-nums text-ink-3">Broker {formatEUR(row.brokerMedian)}</div>
              </td>
              <td className={cn(cell, "whitespace-nowrap text-right tabular-nums")}>
                <div className="text-ink">{formatNumber(row.moq)}</div>
                <div className="text-[11px] text-ink-3">{formatEUR(row.moqValue, { decimals: 0 })}</div>
              </td>
              <td className={cn(cell, "whitespace-nowrap text-right tabular-nums text-ink")}>{row.leadTimeDays} d</td>
              <td className={cn(cell, "whitespace-nowrap")}>
                <div className="text-ink">
                  {row.dispatchHub.city}, {row.dispatchHub.country}
                </div>
                <div className="text-[11px] text-ink-3">
                  {row.dispatchRegion} · {row.incoterm}
                </div>
              </td>
              <td className={cell}>
                <Certifications certs={row.supplier.certifications} />
              </td>
              <td className={cn(cell, "hidden whitespace-nowrap text-right tabular-nums text-ink-3 2xl:table-cell")}>
                {formatRelativeMinutes(row.updatedMinutesAgo)}
              </td>
              <td className={cn(cell, "text-right")}>
                <AnalyzeButton row={row} onAnalyze={onAnalyze} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <EmptyState /> : null}
    </div>
  );
}

function MobileList({ rows, sort, onSort, onAnalyze }: MatrixViewProps) {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <label htmlFor="matrix-sort-mobile" className="shrink-0 text-xs text-ink-3">
          Sort by
        </label>
        <div className="flex-1">
          <Select
            id="matrix-sort-mobile"
            value={sort.key}
            onChange={(e) => {
              const key = e.target.value as SortKey;
              if (key !== sort.key) onSort(key);
            }}
            className="h-8 text-xs"
          >
            {(Object.keys(sortLabels) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {sortLabels[k]}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          onClick={() => onSort(sort.key)}
          className="grid size-8 place-items-center rounded-md border border-line-strong text-ink-2"
          aria-label={sort.dir === "asc" ? "Sorted ascending, switch to descending" : "Sorted descending, switch to ascending"}
        >
          {sort.dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
        </button>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id} className="space-y-2.5 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{row.product.name}</p>
                <p className="font-mono text-[10px] text-ink-3">
                  {row.sku} · {row.product.unit}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-emerald-300">{formatEUR(row.unitPrice)}</p>
                <p className="text-[11px] tabular-nums text-ink-3">Broker {formatEUR(row.brokerMedian)}</p>
              </div>
            </div>
            <div className="min-w-0 text-xs">
              <VendorCell row={row} />
            </div>
            <dl className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <dt className="text-ink-3">Spread</dt>
                <dd className="flex items-center gap-1.5 font-semibold tabular-nums text-ink">
                  {formatPct(row.spread)}
                  <SpreadBar spread={row.spread} />
                </dd>
              </div>
              <div>
                <dt className="text-ink-3">MOQ</dt>
                <dd className="tabular-nums text-ink">
                  {formatNumber(row.moq)} · {formatEUR(row.moqValue, { compact: true })}
                </dd>
              </div>
              <div>
                <dt className="text-ink-3">Lead time</dt>
                <dd className="tabular-nums text-ink">{row.leadTimeDays} days</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between gap-2">
              <Certifications certs={row.supplier.certifications} />
              <AnalyzeButton row={row} onAnalyze={onAnalyze} />
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <EmptyState /> : null}
    </div>
  );
}
