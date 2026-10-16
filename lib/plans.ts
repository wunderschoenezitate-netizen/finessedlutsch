import type { BillingCycle, MatrixAccess, PaymentMethod, PlanId } from "@/lib/types";
import { billingCountries, type BillingCountryCode } from "@/lib/geo";

export interface Entitlements {
  /** Supplier legal names, cities and contact channels are revealed */
  supplierIdentity: boolean;
  /** Matrix CSV export */
  export: boolean;
  /** Price alerts and watchlists */
  alerts: boolean;
  /** REST API access */
  api: boolean;
  sso: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  summary: string;
  /** Net monthly price in EUR, billed monthly */
  monthly: number;
  /** Net monthly price in EUR when billed annually */
  annualMonthly: number;
  /** Shown instead of a fixed price (Enterprise) */
  priceNote?: string;
  seats: number | "unlimited";
  limits: { contactUnlocks: number | "unlimited"; apiCallsPerMonth: number; watchlistSkus: number | "unlimited" };
  entitlements: Entitlements;
  paymentMethods: PaymentMethod[];
  features: string[];
  highlighted?: boolean;
}

export const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    summary: "Single-site procurement teams validating direct sourcing on a defined category set.",
    monthly: 190,
    annualMonthly: 152,
    seats: 2,
    limits: { contactUnlocks: 25, apiCallsPerMonth: 0, watchlistSkus: 25 },
    entitlements: { supplierIdentity: true, export: false, alerts: false, api: false, sso: false },
    paymentMethods: ["sepa_debit", "card"],
    features: [
      "Full comparison matrix with supplier identities",
      "Price Spread Analyzer on all product lines",
      "25 direct supplier contact unlocks per month",
      "Verification records and certificate status",
      "Weekly price snapshots",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    summary: "Central procurement functions running continuous price benchmarking across categories.",
    monthly: 590,
    annualMonthly: 472,
    seats: 10,
    limits: { contactUnlocks: "unlimited", apiCallsPerMonth: 25_000, watchlistSkus: 500 },
    entitlements: { supplierIdentity: true, export: true, alerts: true, api: true, sso: false },
    paymentMethods: ["sepa_debit", "card", "invoice"],
    highlighted: true,
    features: [
      "Everything in Basic",
      "Unlimited supplier contact unlocks",
      "Live price feed, alerts and watchlists (500 SKUs)",
      "Certificate expiry and re-audit monitoring",
      "CSV export and REST API (25k calls / month)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    summary: "Multi-entity groups that require ERP integration, audit support and contractual SLAs.",
    monthly: 1950,
    annualMonthly: 1950,
    priceNote: "from",
    seats: "unlimited",
    limits: { contactUnlocks: "unlimited", apiCallsPerMonth: 500_000, watchlistSkus: "unlimited" },
    entitlements: { supplierIdentity: true, export: true, alerts: true, api: true, sso: true },
    paymentMethods: ["invoice", "sepa_debit"],
    features: [
      "Everything in Pro",
      "SAML SSO, SCIM provisioning, audit log",
      "SAP Ariba, Coupa and Oracle procurement connectors",
      "On-site vendor audits on request",
      "Invoice billing (net 30), DPA and 99.9 % SLA",
    ],
  },
];

export const planById = Object.fromEntries(plans.map((p) => [p.id, p])) as Record<PlanId, Plan>;

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  sepa_debit: "SEPA Direct Debit",
  card: "Corporate card",
  invoice: "Invoice / purchase order",
};

const previewEntitlements: Entitlements = {
  supplierIdentity: false,
  export: false,
  alerts: false,
  api: false,
  sso: false,
};

export function entitlementsFor(access: MatrixAccess): Entitlements {
  return access === "preview" ? previewEntitlements : planById[access].entitlements;
}

export function monthlyRate(plan: Plan, cycle: BillingCycle) {
  return cycle === "annual" ? plan.annualMonthly : plan.monthly;
}

/** Net amount charged per billing period. */
export function periodNet(plan: Plan, cycle: BillingCycle) {
  return cycle === "annual" ? plan.annualMonthly * 12 : plan.monthly;
}

export function annualCost(plan: Plan, cycle: BillingCycle) {
  return monthlyRate(plan, cycle) * 12;
}

const SELLER_COUNTRY = "DE";
const DOMESTIC_VAT = 0.19;

export interface TaxBreakdown {
  net: number;
  vatRate: number;
  vat: number;
  gross: number;
  treatment: "domestic" | "reverse_charge" | "outside_scope";
  note: string;
}

/**
 * B2B VAT treatment for a German seller of electronically supplied services:
 * domestic customers pay 19 %, EU customers with a VAT ID are reverse-charged,
 * customers outside the EU are outside the scope of EU VAT.
 */
export function computeTax(net: number, country: BillingCountryCode): TaxBreakdown {
  const entry = billingCountries.find((c) => c.code === country);
  if (country === SELLER_COUNTRY) {
    const vat = Math.round(net * DOMESTIC_VAT * 100) / 100;
    return { net, vatRate: DOMESTIC_VAT, vat, gross: net + vat, treatment: "domestic", note: "German VAT 19 %" };
  }
  if (entry?.eu) {
    return {
      net,
      vatRate: 0,
      vat: 0,
      gross: net,
      treatment: "reverse_charge",
      note: "Reverse charge — VAT due by recipient (Art. 196 Directive 2006/112/EC)",
    };
  }
  return { net, vatRate: 0, vat: 0, gross: net, treatment: "outside_scope", note: "Outside the scope of EU VAT" };
}
