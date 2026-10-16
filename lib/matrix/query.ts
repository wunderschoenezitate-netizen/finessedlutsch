import type { Category, Certification, DispatchRegion, MatrixRow, SupplierType } from "@/lib/types";

/*
 * Pure filter / sort engine for the comparison matrix.
 * Shared by the client-side grid and the /api/v1/offers endpoint so results always agree.
 */

export type SortKey = "spread" | "unitPrice" | "leadTimeDays" | "moqValue" | "score" | "updated" | "supplier";
export type SortDir = "asc" | "desc";

export interface MatrixQuery {
  search: string;
  categories: Category[];
  supplierTypes: SupplierType[];
  regions: DispatchRegion[];
  /** Offer must hold every selected certification */
  certifications: Certification[];
  /** Maximum MOQ commitment (MOQ × unit price) in EUR; null = any */
  maxMoqValue: number | null;
  /** Maximum lead time in days; null = any */
  maxLeadTime: number | null;
  /** Exclude vendors whose annual re-audit is overdue */
  auditedOnly: boolean;
  sort: { key: SortKey; dir: SortDir };
}

export const defaultQuery: MatrixQuery = {
  search: "",
  categories: [],
  supplierTypes: [],
  regions: [],
  certifications: [],
  maxMoqValue: null,
  maxLeadTime: null,
  auditedOnly: false,
  sort: { key: "spread", dir: "desc" },
};

export const certificationOptions: Certification[] = [
  "ISO 9001",
  "ISO 13485",
  "ISO 14001",
  "ISO/IEC 17025",
  "EU GMP",
  "GDP",
  "REACH",
  "CE",
];

export const categoryOptions: Category[] = [
  "Lab Equipment",
  "Lab Consumables",
  "Analytical Reagents",
  "Pharma Excipients",
  "Industrial Packaging",
  "Process Components",
];

export const supplierTypeOptions: SupplierType[] = [
  "OEM Manufacturer",
  "Laboratory Supplier",
  "Wholesale Distributor",
  "Logistics Hub",
];

/** Discrete MOQ commitment thresholds (EUR) for the slider. `null` = no limit. */
export const moqValueSteps: (number | null)[] = [500, 1_000, 2_500, 5_000, 10_000, 25_000, null];
export const leadTimeSteps: (number | null)[] = [3, 5, 7, 10, 14, 21, 30, null];

function matchesSearch(row: MatrixRow, needle: string) {
  if (!needle) return true;
  const haystack = [
    row.product.name,
    row.product.spec,
    row.product.category,
    row.product.hsCode,
    row.sku,
    row.supplierLabel,
    row.dispatchHub.city,
    row.dispatchRegion,
    ...row.tags,
    ...row.supplier.certifications,
  ]
    .join(" ")
    .toLowerCase();
  return needle
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function filterRows(rows: MatrixRow[], q: MatrixQuery): MatrixRow[] {
  return rows.filter((row) => {
    if (!matchesSearch(row, q.search.trim())) return false;
    if (q.categories.length && !q.categories.includes(row.product.category)) return false;
    if (q.supplierTypes.length && !q.supplierTypes.includes(row.supplier.type)) return false;
    if (q.regions.length && !q.regions.includes(row.dispatchRegion)) return false;
    if (q.certifications.length && !q.certifications.every((c) => row.supplier.certifications.includes(c))) return false;
    if (q.maxMoqValue !== null && row.moqValue > q.maxMoqValue) return false;
    if (q.maxLeadTime !== null && row.leadTimeDays > q.maxLeadTime) return false;
    if (q.auditedOnly && row.supplier.audit.status !== "verified") return false;
    return true;
  });
}

const sortValue: Record<SortKey, (r: MatrixRow) => number | string> = {
  spread: (r) => r.spread,
  unitPrice: (r) => r.unitPrice,
  leadTimeDays: (r) => r.leadTimeDays,
  moqValue: (r) => r.moqValue,
  score: (r) => r.supplier.audit.score,
  updated: (r) => r.updatedMinutesAgo,
  supplier: (r) => r.supplierLabel.toLowerCase(),
};

export function sortRows(rows: MatrixRow[], sort: MatrixQuery["sort"]): MatrixRow[] {
  const get = sortValue[sort.key];
  const factor = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    if (va < vb) return -1 * factor;
    if (va > vb) return 1 * factor;
    return a.id.localeCompare(b.id);
  });
}

export function runQuery(rows: MatrixRow[], q: MatrixQuery) {
  return sortRows(filterRows(rows, q), q.sort);
}

/** Number of active filter facets, for the toolbar badge. */
export function activeFilterCount(q: MatrixQuery) {
  return (
    q.categories.length +
    q.supplierTypes.length +
    q.regions.length +
    q.certifications.length +
    (q.maxMoqValue !== null ? 1 : 0) +
    (q.maxLeadTime !== null ? 1 : 0) +
    (q.auditedOnly ? 1 : 0)
  );
}

export function toCsv(rows: MatrixRow[]) {
  const header = [
    "Offer ID",
    "Product",
    "Specification",
    "Category",
    "Unit",
    "Supplier",
    "Supplier type",
    "Certifications",
    "Audit score",
    "Direct unit price EUR",
    "Broker median EUR",
    "Spread",
    "MOQ",
    "MOQ value EUR",
    "Lead time days",
    "Incoterm",
    "Dispatch hub",
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [
      r.sku,
      r.product.name,
      r.product.spec,
      r.product.category,
      r.product.unit,
      r.supplierLabel,
      r.supplier.type,
      r.supplier.certifications.join("; "),
      r.supplier.audit.score,
      r.unitPrice.toFixed(2),
      r.brokerMedian.toFixed(2),
      (r.spread * 100).toFixed(1) + "%",
      r.moq,
      r.moqValue.toFixed(2),
      r.leadTimeDays,
      r.incoterm,
      `${r.dispatchHub.city}, ${r.dispatchHub.country}`,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
