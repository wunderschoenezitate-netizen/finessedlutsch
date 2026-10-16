"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ChartColumn, Download, Lock, Rows2, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import type { MatrixAccess, MatrixRow, Product } from "@/lib/types";
import { activeFilterCount, defaultQuery, runQuery, toCsv, type MatrixQuery, type SortKey } from "@/lib/matrix/query";
import { entitlementsFor } from "@/lib/plans";
import { formatEUR, formatPct } from "@/lib/format";
import { cn, median } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Sheet } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/matrix/filter-panel";
import { MatrixTable, type Density } from "@/components/matrix/matrix-table";
import { PriceSpreadAnalyzer } from "@/components/matrix/price-spread-analyzer";

/** Ascending by default for cost/time columns, descending for spread. */
const defaultDir: Record<SortKey, "asc" | "desc"> = {
  spread: "desc",
  unitPrice: "asc",
  leadTimeDays: "asc",
  moqValue: "asc",
  score: "desc",
  updated: "asc",
  supplier: "asc",
};

function downloadCsv(rows: MatrixRow[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `origo-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ActiveFilters({ query, onChange }: { query: MatrixQuery; onChange: (q: MatrixQuery) => void }) {
  const chips: { key: string; label: string; remove: () => MatrixQuery }[] = [
    ...query.categories.map((c) => ({ key: `cat-${c}`, label: c, remove: () => ({ ...query, categories: query.categories.filter((v) => v !== c) }) })),
    ...query.supplierTypes.map((t) => ({ key: `type-${t}`, label: t, remove: () => ({ ...query, supplierTypes: query.supplierTypes.filter((v) => v !== t) }) })),
    ...query.regions.map((r) => ({ key: `reg-${r}`, label: `Dispatch: ${r}`, remove: () => ({ ...query, regions: query.regions.filter((v) => v !== r) }) })),
    ...query.certifications.map((c) => ({ key: `cert-${c}`, label: c, remove: () => ({ ...query, certifications: query.certifications.filter((v) => v !== c) }) })),
    ...(query.maxMoqValue !== null
      ? [{ key: "moq", label: `MOQ ≤ ${formatEUR(query.maxMoqValue, { decimals: 0 })}`, remove: () => ({ ...query, maxMoqValue: null }) }]
      : []),
    ...(query.maxLeadTime !== null
      ? [{ key: "lead", label: `Lead time ≤ ${query.maxLeadTime} d`, remove: () => ({ ...query, maxLeadTime: null }) }]
      : []),
    ...(query.auditedOnly ? [{ key: "audit", label: "Current audits only", remove: () => ({ ...query, auditedOnly: false }) }] : []),
  ];
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.remove())}
          className="inline-flex h-6 items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] font-medium text-emerald-200 hover:border-emerald-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X aria-hidden className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...defaultQuery, search: query.search, sort: query.sort })}
        className="ml-1 text-[11px] text-ink-3 underline-offset-2 hover:text-ink hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

export function ComparisonMatrix({
  rows,
  products,
  access,
}: {
  rows: MatrixRow[];
  products: Product[];
  access: MatrixAccess;
}) {
  const entitlements = entitlementsFor(access);
  const [query, setQuery] = useState<MatrixQuery>(defaultQuery);
  const [density, setDensity] = useState<Density>("compact");
  // Filters start collapsed on small screens and expanded on desktop; each has its own toggle.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [analyzerProduct, setAnalyzerProduct] = useState<string | null>(null);

  // Keep typing responsive on large result sets; filtering runs on the deferred value.
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => runQuery(rows, deferredQuery), [rows, deferredQuery]);
  const stale = deferredQuery !== query;
  const filterCount = activeFilterCount(query);

  const resultStats = useMemo(() => {
    const vendors = new Set(results.map((r) => r.supplier.id)).size;
    return { vendors, medianSpread: median(results.map((r) => r.spread)) };
  }, [results]);

  const onSort = (key: SortKey) =>
    setQuery((q) => ({
      ...q,
      sort: q.sort.key === key ? { key, dir: q.sort.dir === "asc" ? "desc" : "asc" } : { key, dir: defaultDir[key] },
    }));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[16rem] flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={query.search}
            onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value }))}
            placeholder="Search products, specs, HS codes, hubs…"
            aria-label="Search verified offers"
            className="h-9 w-full rounded-md border border-line-strong bg-surface-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 hover:border-zinc-600 focus:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <Button
          variant="secondary"
          className="lg:hidden"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="matrix-filters"
        >
          <SlidersHorizontal aria-hidden />
          Filters
          {filterCount ? <span className="rounded bg-emerald-500/20 px-1.5 text-xs tabular-nums text-emerald-200">{filterCount}</span> : null}
        </Button>
        <Button
          variant="secondary"
          className="hidden lg:inline-flex"
          onClick={() => setFiltersCollapsed((c) => !c)}
          aria-expanded={!filtersCollapsed}
          aria-controls="matrix-filters"
        >
          <SlidersHorizontal aria-hidden />
          {filtersCollapsed ? "Show filters" : "Hide filters"}
          {filtersCollapsed && filterCount ? (
            <span className="rounded bg-emerald-500/20 px-1.5 text-xs tabular-nums text-emerald-200">{filterCount}</span>
          ) : null}
        </Button>
        <Segmented
          label="Row density"
          size="sm"
          value={density}
          onChange={setDensity}
          options={[
            { value: "compact", label: <Rows3 aria-label="Compact rows" className="size-3.5" /> },
            { value: "comfortable", label: <Rows2 aria-label="Comfortable rows" className="size-3.5" /> },
          ]}
        />
        <Button variant="secondary" onClick={() => setAnalyzerProduct(results[0]?.product.id ?? products[0].id)}>
          <ChartColumn aria-hidden />
          Spread Analyzer
        </Button>
        {entitlements.export ? (
          <Button variant="secondary" onClick={() => downloadCsv(results)} disabled={!results.length}>
            <Download aria-hidden />
            Export CSV
          </Button>
        ) : (
          <ButtonLink
            href="/access?plan=pro"
            variant="secondary"
            title="CSV export is included from the Pro plan"
            className="text-ink-3"
          >
            <Lock aria-hidden />
            Export CSV
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Pro</span>
          </ButtonLink>
        )}
      </div>

      {access === "preview" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-3">
          <p className="flex items-center gap-2 text-xs text-cyan-100">
            <Lock aria-hidden className="size-3.5 shrink-0 text-cyan-300" />
            Preview mode: vendor identities, cities and contact channels are masked. Prices, certifications and audit
            status are shown in full.
          </p>
          <ButtonLink href="/access" size="sm">
            Unlock full matrix
          </ButtonLink>
        </div>
      ) : null}

      <div className={cn("grid grid-cols-1 gap-4", !filtersCollapsed && "lg:grid-cols-[16rem_minmax(0,1fr)]")}>
        <aside
          id="matrix-filters"
          className={cn(filtersOpen ? "block" : "hidden", filtersCollapsed ? "lg:hidden" : "lg:block")}
          aria-label="Matrix filters"
        >
          <FilterPanel rows={rows} query={query} onChange={setQuery} />
        </aside>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-3" aria-live="polite">
              <span className="font-semibold tabular-nums text-ink">{results.length}</span> verified offers ·{" "}
              <span className="tabular-nums text-ink-2">{resultStats.vendors}</span> vendors · median broker spread{" "}
              <span className="font-semibold tabular-nums text-ink">{formatPct(resultStats.medianSpread)}</span>
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <span aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-cyan-400 motion-reduce:animate-none" />
              Live feed · prices in EUR, delivered EU
            </p>
          </div>
          <ActiveFilters query={query} onChange={setQuery} />
          <div className={stale ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <MatrixTable rows={results} sort={query.sort} onSort={onSort} density={density} onAnalyze={setAnalyzerProduct} />
          </div>
        </div>
      </div>

      <Sheet
        open={analyzerProduct !== null}
        onClose={() => setAnalyzerProduct(null)}
        title="Price Spread Analyzer"
        description="Direct factory rates vs. distributor and broker channels, per unit"
      >
        {analyzerProduct ? (
          <PriceSpreadAnalyzer
            key={analyzerProduct}
            products={products}
            rows={rows}
            initialProductId={analyzerProduct}
            canContact={entitlements.supplierIdentity}
          />
        ) : null}
      </Sheet>
    </div>
  );
}
