import "server-only";
import { randomUUID } from "node:crypto";
import type { BillingCycle, PaymentMethod, PlanId } from "@/lib/types";
import type { BillingCountryCode } from "@/lib/geo";
import { computeTax, periodNet, planById, type TaxBreakdown } from "@/lib/plans";

/*
 * Billing adapter boundary.
 *
 * The UI and route handlers depend only on `BillingProvider`. Production deployments bind
 * it to a corporate-payments provider (e.g. Stripe Billing, Adyen, GoCardless for SEPA,
 * or an ERP invoicing bridge). Card and IBAN data are captured exclusively by the provider's
 * hosted fields and never touch this application (PCI DSS SAQ-A scope).
 */

export interface CustomerDetails {
  company: string;
  email: string;
  country: BillingCountryCode;
  vatId: string | null;
  poNumber: string | null;
}

export interface CreateSubscriptionInput {
  plan: PlanId;
  cycle: BillingCycle;
  paymentMethod: PaymentMethod;
  customer: CustomerDetails;
}

export interface SubscriptionResult {
  subscriptionId: string;
  customerId: string;
  status: "active" | "pending_payment";
  firstInvoice: Invoice;
}

export interface Invoice {
  id: string;
  number: string;
  issuedAt: string;
  dueAt: string;
  description: string;
  tax: TaxBreakdown;
  status: "paid" | "open" | "scheduled";
  method: PaymentMethod;
}

export interface BillingProvider {
  createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult>;
  changePlan(subscriptionId: string, plan: PlanId, cycle: BillingCycle): Promise<{ effectiveAt: string }>;
}

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
const shortId = (prefix: string, length: number) => `${prefix}_${randomUUID().replace(/-/g, "").slice(0, length)}`;

/**
 * Sandbox provider: confirms subscriptions synchronously so the dashboard unlocks instantly.
 * SEPA and card mandates are treated as authorised; invoice billing is issued net 30.
 */
class SandboxBillingProvider implements BillingProvider {
  async createSubscription({ plan, cycle, paymentMethod, customer }: CreateSubscriptionInput) {
    const now = new Date();
    const net = periodNet(planById[plan], cycle);
    const sequence = String(Math.floor(now.getTime() / 1000) % 100_000).padStart(5, "0");
    const invoice: Invoice = {
      id: shortId("in", 14),
      number: `OR-${now.getUTCFullYear()}-${sequence}`,
      issuedAt: now.toISOString(),
      dueAt: addDays(now, paymentMethod === "invoice" ? 30 : 0).toISOString(),
      description: `${planById[plan].name} plan — ${cycle === "annual" ? "12 months" : "1 month"}`,
      tax: computeTax(net, customer.country),
      status: paymentMethod === "invoice" ? "open" : "paid",
      method: paymentMethod,
    };
    return {
      subscriptionId: shortId("sub", 14),
      customerId: shortId("cus", 14),
      // Invoice customers get immediate access; dunning applies if unpaid after the due date.
      status: "active" as const,
      firstInvoice: invoice,
    };
  }

  async changePlan() {
    return { effectiveAt: new Date().toISOString() };
  }
}

export const billing: BillingProvider = new SandboxBillingProvider();
