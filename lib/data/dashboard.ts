import { suppliers } from "@/lib/data/suppliers";

/*
 * Member dashboard demo data. In production these come from the workspace's
 * order history, RFQ service and monitoring jobs.
 */

export interface SavingsPoint {
  month: string;
  label: string;
  /** Realised savings vs broker median on awarded orders (EUR) */
  value: number;
  partial?: boolean;
}

export const savingsSeries: SavingsPoint[] = [
  { month: "2025-11", label: "Nov", value: 18_400 },
  { month: "2025-12", label: "Dec", value: 21_200 },
  { month: "2026-01", label: "Jan", value: 24_900 },
  { month: "2026-02", label: "Feb", value: 27_300 },
  { month: "2026-03", label: "Mar", value: 31_800 },
  { month: "2026-04", label: "Apr", value: 29_600 },
  { month: "2026-05", label: "May", value: 35_100 },
  { month: "2026-06", label: "Jun", value: 38_400 },
  { month: "2026-07", label: "Jul", value: 36_200 },
  { month: "2026-08", label: "Aug", value: 41_700 },
  { month: "2026-09", label: "Sep", value: 46_300 },
  { month: "2026-10", label: "Oct", value: 28_900, partial: true },
];

export const kpis = [
  {
    id: "savings",
    label: "Realised savings, YTD",
    value: 340_200,
    format: "eur" as const,
    delta: 0.226,
    deltaLabel: "vs. Jan–Oct 2025",
    upIsGood: true,
  },
  {
    id: "spread",
    label: "Spread captured on awarded RFQs",
    value: 0.278,
    format: "pct" as const,
    delta: 0.031,
    deltaLabel: "pts vs. Q2",
    upIsGood: true,
  },
  {
    id: "rfqs",
    label: "Open RFQs",
    value: 7,
    format: "int" as const,
    note: "3 awaiting vendor quotes",
  },
  {
    id: "vendors",
    label: "Vendors under monitoring",
    value: suppliers.length,
    format: "int" as const,
    note: `${suppliers.filter((s) => s.audit.status === "reaudit_due").length} re-audits due`,
  },
];

export interface WatchItem {
  offerId: string;
  change7d: number;
}

export const watchlist: WatchItem[] = [
  { offerId: "OF-30111", change7d: -0.024 },
  { offerId: "OF-10511", change7d: -0.031 },
  { offerId: "OF-20111", change7d: 0.018 },
  { offerId: "OF-40121", change7d: 0 },
  { offerId: "OF-60121", change7d: -0.012 },
  { offerId: "OF-10621", change7d: 0.006 },
];

export type AlertSeverity = "good" | "info" | "warning" | "serious";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  time: string;
}

export const alerts: Alert[] = [
  {
    id: "al-1",
    severity: "serious",
    title: "Registry check failed",
    body: "Emilia Inox S.r.l. — EORI validation failed on the last registry sync. Quotes remain visible; awards are blocked until resolved.",
    time: "08:12",
  },
  {
    id: "al-2",
    severity: "warning",
    title: "Re-audit due 28 Oct",
    body: "Nordlys Plastics A/S — ISO 13485 renewal not yet confirmed by the certification body.",
    time: "07:40",
  },
  {
    id: "al-3",
    severity: "good",
    title: "Price drop on watchlist",
    body: "Nitrile examination gloves −3.1 % at Iberia Protective Polymers (OF-10511).",
    time: "Yesterday",
  },
  {
    id: "al-4",
    severity: "info",
    title: "New verified vendor",
    body: "Lyon Hub Pharma Logistique (GDP, EU GMP) now supplies Pharma Excipients from Saint-Priest.",
    time: "Yesterday",
  },
];

export type RfqStatus = "awaiting" | "quoted" | "negotiating" | "awarded";

export interface Rfq {
  id: string;
  product: string;
  quantity: string;
  quotes: number;
  bestQuote: number | null;
  vsBroker: number | null;
  status: RfqStatus;
  due: string;
}

export const rfqs: Rfq[] = [
  {
    id: "RFQ-2291",
    product: "Microcrystalline cellulose PH-102",
    quantity: "1,200 bags",
    quotes: 3,
    bestQuote: 89.26,
    vsBroker: -0.266,
    status: "quoted",
    due: "2026-10-21",
  },
  {
    id: "RFQ-2288",
    product: "Acetonitrile, HPLC gradient grade",
    quantity: "960 bottles",
    quotes: 2,
    bestQuote: 43.61,
    vsBroker: -0.21,
    status: "negotiating",
    due: "2026-10-19",
  },
  {
    id: "RFQ-2284",
    product: "Fume cupboard 1,500 mm",
    quantity: "6 units",
    quotes: 0,
    bestQuote: null,
    vsBroker: null,
    status: "awaiting",
    due: "2026-10-30",
  },
  {
    id: "RFQ-2279",
    product: "Nitrile examination gloves",
    quantity: "4,000 cases",
    quotes: 4,
    bestQuote: 33.25,
    vsBroker: -0.274,
    status: "awarded",
    due: "2026-10-09",
  },
];

/** Plan usage for the current billing period. */
export const usage = {
  contactUnlocks: 14,
  apiCalls: 8_420,
  seats: 6,
  watchlistSkus: 38,
};
