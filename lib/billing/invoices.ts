import type { Workspace } from "@/lib/session";
import { computeTax, periodNet, planById, type TaxBreakdown } from "@/lib/plans";
import type { PaymentMethod } from "@/lib/types";

export interface InvoiceLine {
  number: string;
  issuedAt: Date;
  periodLabel: string;
  description: string;
  tax: TaxBreakdown;
  method: PaymentMethod;
  status: "paid" | "open";
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

const periodFormatter = new Intl.DateTimeFormat("en-IE", { month: "short", year: "numeric", timeZone: "UTC" });

function sequenceSeed(id: string) {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 90_000;
  return 10_000 + h;
}

/**
 * Invoice ledger derived from the subscription. In production this is read from the
 * billing provider (e.g. `invoices.list({ customer })`).
 */
export function invoicesFor(ws: Workspace, now: Date): { invoices: InvoiceLine[]; nextRenewal: Date } {
  const plan = planById[ws.tier];
  const start = new Date(ws.activatedAt);
  const step = ws.cycle === "annual" ? 12 : 1;
  const net = periodNet(plan, ws.cycle);
  const seed = sequenceSeed(ws.id);

  const invoices: InvoiceLine[] = [];
  let issued = start;
  for (let i = 0; issued <= now && i < 12; i++) {
    const end = addMonths(issued, step);
    const ageDays = (now.getTime() - issued.getTime()) / 86_400_000;
    invoices.push({
      number: `OR-${issued.getUTCFullYear()}-${String(seed + i).padStart(5, "0")}`,
      issuedAt: issued,
      periodLabel:
        step === 12
          ? `${periodFormatter.format(issued)} – ${periodFormatter.format(addMonths(end, -1))}`
          : periodFormatter.format(issued),
      description: `${plan.name} plan, ${ws.cycle === "annual" ? "annual" : "monthly"}`,
      tax: computeTax(net, ws.country),
      method: ws.paymentMethod,
      status: ws.paymentMethod === "invoice" && ageDays < 30 ? "open" : "paid",
    });
    issued = end;
  }
  return { invoices: invoices.reverse(), nextRenewal: issued };
}
