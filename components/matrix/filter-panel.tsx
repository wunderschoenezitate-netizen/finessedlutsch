"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import type { MatrixRow } from "@/lib/types";
import {
  categoryOptions,
  certificationOptions,
  defaultQuery,
  leadTimeSteps,
  moqValueSteps,
  supplierTypeOptions,
  type MatrixQuery,
} from "@/lib/matrix/query";
import { dispatchRegions } from "@/lib/geo";
import { formatEUR } from "@/lib/format";
import { RangeField, Switch, ToggleChip } from "@/components/ui/controls";

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function countBy<T extends string>(rows: MatrixRow[], get: (r: MatrixRow) => T | T[]) {
  const counts = new Map<T, number>();
  for (const row of rows) {
    const values = get(row);
    for (const v of Array.isArray(values) ? values : [values]) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

function FacetGroup({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line px-4 py-4 last:border-b-0">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden className="mb-2.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{title}</span>
        {hint ? <span className="text-[10px] text-ink-3">{hint}</span> : null}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

export function FilterPanel({
  rows,
  query,
  onChange,
}: {
  rows: MatrixRow[];
  query: MatrixQuery;
  onChange: (next: MatrixQuery) => void;
}) {
  const categoryCounts = countBy(rows, (r) => r.product.category);
  const typeCounts = countBy(rows, (r) => r.supplier.type);
  const regionCounts = countBy(rows, (r) => r.dispatchRegion);
  const certCounts = countBy(rows, (r) => r.supplier.certifications);

  // `null` ("Any") is the last step of each scale.
  const moqIdx = Math.max(0, moqValueSteps.indexOf(query.maxMoqValue));
  const leadIdx = Math.max(0, leadTimeSteps.indexOf(query.maxLeadTime));

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Filters</h2>
        <button
          type="button"
          onClick={() => onChange({ ...defaultQuery, search: query.search, sort: query.sort })}
          className="inline-flex items-center gap-1 rounded text-xs text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
        >
          <RotateCcw aria-hidden className="size-3" />
          Reset
        </button>
      </div>

      <FacetGroup title="Category">
        {categoryOptions.map((c) => (
          <ToggleChip
            key={c}
            pressed={query.categories.includes(c)}
            onToggle={() => onChange({ ...query, categories: toggle(query.categories, c) })}
            count={categoryCounts.get(c) ?? 0}
          >
            {c}
          </ToggleChip>
        ))}
      </FacetGroup>

      <FacetGroup title="Vendor type">
        {supplierTypeOptions.map((t) => (
          <ToggleChip
            key={t}
            pressed={query.supplierTypes.includes(t)}
            onToggle={() => onChange({ ...query, supplierTypes: toggle(query.supplierTypes, t) })}
            count={typeCounts.get(t) ?? 0}
          >
            {t}
          </ToggleChip>
        ))}
      </FacetGroup>

      <FacetGroup title="Dispatch region">
        {dispatchRegions.map((r) => (
          <ToggleChip
            key={r}
            pressed={query.regions.includes(r)}
            onToggle={() => onChange({ ...query, regions: toggle(query.regions, r) })}
            count={regionCounts.get(r) ?? 0}
          >
            {r}
          </ToggleChip>
        ))}
      </FacetGroup>

      <FacetGroup title="Certifications" hint="Vendor holds all selected">
        {certificationOptions.map((c) => (
          <ToggleChip
            key={c}
            pressed={query.certifications.includes(c)}
            onToggle={() => onChange({ ...query, certifications: toggle(query.certifications, c) })}
            count={certCounts.get(c) ?? 0}
          >
            {c}
          </ToggleChip>
        ))}
      </FacetGroup>

      <div className="space-y-5 border-b border-line px-4 py-4">
        <RangeField
          label="MOQ commitment"
          min={0}
          max={moqValueSteps.length - 1}
          value={moqIdx}
          onChange={(i) => onChange({ ...query, maxMoqValue: moqValueSteps[i] })}
          display={query.maxMoqValue === null ? "Any" : `≤ ${formatEUR(query.maxMoqValue, { decimals: 0 })}`}
          minLabel={formatEUR(moqValueSteps[0] ?? 0, { decimals: 0 })}
          maxLabel="Any"
          hint="Minimum order quantity × direct unit price"
        />
        <RangeField
          label="Lead time"
          min={0}
          max={leadTimeSteps.length - 1}
          value={leadIdx}
          onChange={(i) => onChange({ ...query, maxLeadTime: leadTimeSteps[i] })}
          display={query.maxLeadTime === null ? "Any" : `≤ ${query.maxLeadTime} days`}
          minLabel={`${leadTimeSteps[0]} days`}
          maxLabel="Any"
        />
      </div>

      <div className="px-4 py-4">
        <Switch
          checked={query.auditedOnly}
          onChange={(auditedOnly) => onChange({ ...query, auditedOnly })}
          label="Current audits only"
          description="Hide vendors whose annual re-audit is due"
        />
      </div>
    </div>
  );
}
