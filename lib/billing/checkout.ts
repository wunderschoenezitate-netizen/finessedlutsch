import type { BillingCycle, PaymentMethod, PlanId } from "@/lib/types";
import { billingCountries, type BillingCountryCode } from "@/lib/geo";
import { planById } from "@/lib/plans";

/* Checkout payload validation, shared by the access portal (inline errors) and /api/checkout. */

export interface CheckoutInput {
  plan: PlanId;
  cycle: BillingCycle;
  paymentMethod: PaymentMethod;
  company: string;
  email: string;
  country: BillingCountryCode;
  vatId: string;
  poNumber: string;
  acceptTerms: boolean;
}

export type CheckoutField = keyof CheckoutInput;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

const PLAN_IDS: PlanId[] = ["basic", "pro", "enterprise"];
const CYCLES: BillingCycle[] = ["monthly", "annual"];
const METHODS: PaymentMethod[] = ["sepa_debit", "card", "invoice"];
const FREEMAIL = /@(gmail|googlemail|yahoo|hotmail|outlook|live|gmx|web|icloud|aol|proton|protonmail)\./i;

export function normaliseVatId(vatId: string) {
  return vatId.replace(/[\s.-]/g, "").toUpperCase();
}

export function vatRequired(country: BillingCountryCode) {
  return country !== "DE" && billingCountries.some((c) => c.code === country && c.eu);
}

/** Payment methods offered for a plan and cycle. Invoice billing requires an annual term. */
export function allowedMethods(plan: PlanId, cycle: BillingCycle): PaymentMethod[] {
  return planById[plan].paymentMethods.filter((m) => m !== "invoice" || cycle === "annual");
}

export function validateCheckout(raw: unknown): { ok: true; value: CheckoutInput } | { ok: false; errors: CheckoutErrors } {
  const input = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const str = (k: string) => (typeof input[k] === "string" ? (input[k] as string).trim() : "");
  const errors: CheckoutErrors = {};

  const plan = str("plan") as PlanId;
  if (!PLAN_IDS.includes(plan)) errors.plan = "Select a membership tier.";

  let cycle = str("cycle") as BillingCycle;
  if (!CYCLES.includes(cycle)) errors.cycle = "Select a billing cycle.";
  if (plan === "enterprise") cycle = "annual";

  const paymentMethod = str("paymentMethod") as PaymentMethod;
  if (!METHODS.includes(paymentMethod)) {
    errors.paymentMethod = "Select a payment method.";
  } else if (!errors.plan && !errors.cycle && !allowedMethods(plan, cycle).includes(paymentMethod)) {
    errors.paymentMethod = "This payment method is not available for the selected plan and billing cycle.";
  }

  const company = str("company");
  if (company.length < 2 || company.length > 120) errors.company = "Enter the registered company name.";

  const email = str("email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address.";
  else if (FREEMAIL.test(email)) errors.email = "Use a corporate email address.";

  const country = str("country") as BillingCountryCode;
  if (!billingCountries.some((c) => c.code === country)) errors.country = "Select the billing country.";

  const vatId = normaliseVatId(str("vatId"));
  if (vatId) {
    if (!/^[A-Z]{2}[0-9A-Z]{8,12}$/.test(vatId)) errors.vatId = "VAT ID format is invalid (e.g. NL859048139B01).";
    else if (!errors.country && vatId.slice(0, 2) !== country && billingCountries.find((c) => c.code === country)?.eu)
      errors.vatId = "VAT ID prefix must match the billing country.";
  } else if (!errors.country && vatRequired(country)) {
    errors.vatId = "A VAT ID is required for EU reverse-charge invoicing.";
  }

  const poNumber = str("poNumber");
  if (poNumber.length > 40) errors.poNumber = "Use at most 40 characters.";

  const acceptTerms = input.acceptTerms === true;
  if (!acceptTerms) errors.acceptTerms = "Accept the terms and the data processing agreement to continue.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { plan, cycle, paymentMethod, company, email, country, vatId, poNumber, acceptTerms } };
}
