"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { CreditCard, FileText, Landmark, LoaderCircle, Lock, ShieldCheck, Zap } from "lucide-react";
import type { BillingCycle, PaymentMethod, PlanId } from "@/lib/types";
import { billingCountries, type BillingCountryCode } from "@/lib/geo";
import { computeTax, monthlyRate, paymentMethodLabels, periodNet, planById, plans } from "@/lib/plans";
import { allowedMethods, validateCheckout, vatRequired, type CheckoutErrors } from "@/lib/billing/checkout";
import { formatEUR } from "@/lib/format";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const methodMeta: Record<PaymentMethod, { icon: typeof Landmark; detail: string }> = {
  sepa_debit: { icon: Landmark, detail: "SEPA Core or B2B mandate · charged on confirmation" },
  card: { icon: CreditCard, detail: "Visa, Mastercard, Amex corporate · 3-D Secure" },
  invoice: { icon: FileText, detail: "Net 30 · bank transfer · PO reference printed on invoice" },
};

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-xl border border-line bg-surface">
      <h2 id={`step-${n}`} className="flex items-center gap-3 border-b border-line px-5 py-3.5 text-sm font-semibold text-ink">
        <span className="grid size-6 place-items-center rounded-full border border-line-strong font-mono text-[11px] text-ink-2">{n}</span>
        {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function CheckoutFlow({ initialPlan, initialCycle }: { initialPlan: PlanId; initialCycle: BillingCycle }) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [cycleChoice, setCycle] = useState<BillingCycle>(initialCycle);
  const cycle: BillingCycle = plan === "enterprise" ? "annual" : cycleChoice;
  const methods = allowedMethods(plan, cycle);
  const [methodChoice, setMethod] = useState<PaymentMethod>("sepa_debit");
  const paymentMethod = methods.includes(methodChoice) ? methodChoice : methods[0];

  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<BillingCountryCode>("DE");
  const [vatId, setVatId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const selected = planById[plan];
  const tax = useMemo(() => computeTax(periodNet(selected, cycle), country), [selected, cycle, country]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { plan, cycle, paymentMethod, company, email, country, vatId, poNumber, acceptTerms };
    const local = validateCheckout(payload);
    if (!local.ok) {
      setErrors(local.errors);
      document.getElementById(`field-${Object.keys(local.errors)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 422) {
        setErrors(data.fields ?? {});
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "checkout_failed");
      // Full navigation so every server component re-reads the new session.
      window.location.href = data.redirectTo;
    } catch {
      setStatus("error");
    }
  }

  const fieldProps = (name: keyof CheckoutErrors) => ({
    id: `field-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `field-${name}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <Step n={1} title="Membership tier">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label="Billing cycle"
              size="sm"
              value={cycle}
              onChange={setCycle}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual · −20%" },
              ]}
            />
            {plan === "enterprise" ? <span className="text-[11px] text-ink-3">Enterprise agreements run annually</span> : null}
          </div>
          <div role="radiogroup" aria-label="Membership tier" className="grid gap-3 md:grid-cols-3">
            {plans.map((p) => {
              const active = p.id === plan;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
                    active ? "border-emerald-500/60 bg-emerald-500/[0.06]" : "border-line bg-surface-2 hover:border-line-strong",
                  )}
                >
                  <span className="text-sm font-semibold text-ink">{p.name}</span>
                  <span className="mt-2 block text-xl font-semibold text-ink">
                    {p.priceNote ? <span className="mr-1 text-xs font-normal text-ink-3">{p.priceNote}</span> : null}
                    {formatEUR(monthlyRate(p, p.id === "enterprise" ? "annual" : cycle), { decimals: 0 })}
                    <span className="text-xs font-normal text-ink-3"> / mo</span>
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-ink-3">{p.summary}</span>
                </button>
              );
            })}
          </div>
        </Step>

        <Step n={2} title="Company and tax details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Registered company name" htmlFor="field-company" error={errors.company} className="sm:col-span-2">
              <Input {...fieldProps("company")} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field label="Billing contact (work email)" htmlFor="field-email" error={errors.email} hint="Invoices and access confirmation are sent here">
              <Input {...fieldProps("email")} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Billing country" htmlFor="field-country" error={errors.country}>
              <Select {...fieldProps("country")} value={country} onChange={(e) => setCountry(e.target.value as BillingCountryCode)}>
                {billingCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={`VAT ID${vatRequired(country) ? "" : " (optional)"}`}
              htmlFor="field-vatId"
              error={errors.vatId}
              hint={vatRequired(country) ? "Validated against VIES; enables reverse charge" : "Validated against VIES when provided"}
            >
              <Input
                {...fieldProps("vatId")}
                value={vatId}
                onChange={(e) => setVatId(e.target.value)}
                placeholder={`${country}…`}
                className="font-mono uppercase"
              />
            </Field>
            <Field label="Purchase order reference (optional)" htmlFor="field-poNumber" error={errors.poNumber}>
              <Input {...fieldProps("poNumber")} value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
            </Field>
          </div>
        </Step>

        <Step n={3} title="Payment method">
          <div role="radiogroup" aria-label="Payment method" className="grid gap-2">
            {methods.map((m) => {
              const { icon: Icon, detail } = methodMeta[m];
              const active = m === paymentMethod;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
                    active ? "border-emerald-500/60 bg-emerald-500/[0.06]" : "border-line bg-surface-2 hover:border-line-strong",
                  )}
                >
                  <Icon aria-hidden className={cn("size-4", active ? "text-emerald-400" : "text-ink-3")} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{paymentMethodLabels[m]}</span>
                    <span className="block text-[11px] text-ink-3">{detail}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn("size-4 rounded-full border-2", active ? "border-emerald-400 bg-emerald-400 shadow-[inset_0_0_0_3px_#0f0f12]" : "border-line-strong")}
                  />
                </button>
              );
            })}
          </div>
          {plan !== "enterprise" && cycle === "monthly" ? (
            <p className="mt-2 text-[11px] text-ink-3">Invoice billing is available on annual terms.</p>
          ) : null}

          {paymentMethod !== "invoice" ? (
            <div className="mt-4 rounded-lg border border-dashed border-line-strong bg-surface-2 p-4">
              <p className="flex items-center gap-2 text-xs font-medium text-ink-2">
                <Lock aria-hidden className="size-3.5 text-emerald-400" />
                {paymentMethod === "card" ? "Card details" : "IBAN and mandate"} — provider-hosted secure field
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-3">
                Sandbox mode: no payment data is collected. In production the payment provider&apos;s hosted field mounts
                here, so card and account data never reach Origo servers (PCI DSS SAQ-A).
              </p>
            </div>
          ) : null}

          <label className="mt-5 flex items-start gap-2.5 text-xs text-ink-2">
            <input
              id="field-acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              aria-invalid={errors.acceptTerms ? true : undefined}
              aria-describedby={errors.acceptTerms ? "field-acceptTerms-error" : undefined}
              className="mt-0.5 size-4 rounded border-line-strong bg-surface-2 accent-emerald-500"
            />
            <span>
              I am authorised to contract on behalf of the company and accept the Terms of Service and the Data
              Processing Agreement (Art. 28 GDPR).
            </span>
          </label>
          {errors.acceptTerms ? (
            <p id="field-acceptTerms-error" className="mt-1 text-xs text-red-300">
              {errors.acceptTerms}
            </p>
          ) : null}
        </Step>
      </div>

      {/* Order summary */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-xl border border-line bg-surface">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink">Order summary</h2>
          </div>
          <dl className="space-y-2.5 px-5 py-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">
                {selected.name} · {cycle === "annual" ? "12 months" : "1 month"}
              </dt>
              <dd className="tabular-nums text-ink">{formatEUR(tax.net)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">VAT {tax.vatRate ? `${Math.round(tax.vatRate * 100)}%` : ""}</dt>
              <dd className="tabular-nums text-ink">{formatEUR(tax.vat)}</dd>
            </div>
            <p className="text-[11px] leading-relaxed text-ink-3">{tax.note}</p>
            <div className="flex justify-between gap-3 border-t border-line pt-3">
              <dt className="font-medium text-ink">{paymentMethod === "invoice" ? "Invoiced, due in 30 days" : "Due today"}</dt>
              <dd className="text-lg font-semibold tabular-nums text-ink">{formatEUR(tax.gross)}</dd>
            </div>
          </dl>
          <div className="border-t border-line px-5 py-4">
            <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" ? <LoaderCircle aria-hidden className="animate-spin" /> : <Zap aria-hidden />}
              Confirm and unlock dashboard
            </Button>
            {status === "error" ? (
              <p role="alert" className="mt-2 text-xs text-red-300">
                Activation failed and no charge was made. Please retry.
              </p>
            ) : null}
            {Object.keys(errors).length ? (
              <p role="alert" className="mt-2 text-xs text-red-300">
                Review the highlighted fields.
              </p>
            ) : null}
          </div>
        </div>

        <ul className="space-y-2.5 rounded-xl border border-line bg-surface px-5 py-4 text-xs text-ink-2">
          <li className="flex gap-2">
            <Zap aria-hidden className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
            Instant web access on confirmation — no chat servers, invites or onboarding calls.
          </li>
          <li className="flex gap-2">
            <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
            Cancel monthly plans any time; annual plans renew with 30 days&apos; notice.
          </li>
          <li className="flex gap-2">
            <FileText aria-hidden className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
            VAT-compliant invoices with reverse charge for EU businesses.
          </li>
        </ul>
        <p className="text-center text-xs text-ink-3">
          Evaluating first?{" "}
          <Link href="/dashboard" className="font-medium text-emerald-300 hover:text-emerald-200">
            Open the demo workspace
          </Link>
        </p>
      </aside>
    </form>
  );
}
