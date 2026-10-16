"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { BillingCycle, PlanId } from "@/lib/types";
import { monthlyRate, paymentMethodLabels, plans } from "@/lib/plans";
import { formatEUR } from "@/lib/format";
import { Segmented } from "@/components/ui/controls";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingTiers({ currentPlan }: { currentPlan?: PlanId }) {
  const [cycle, setCycle] = useState<BillingCycle>("annual");

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <Segmented
          label="Billing cycle"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual" },
          ]}
        />
        <span className="text-xs text-emerald-300">Annual billing: 20% lower on Basic and Pro</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = monthlyRate(plan, cycle);
          const isCurrent = plan.id === currentPlan;
          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl border bg-surface p-6",
                plan.highlighted ? "border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_20px_60px_-30px_rgba(16,185,129,0.45)]" : "border-line",
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-2.5 left-6 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-950">
                  Most adopted
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1 min-h-10 text-xs leading-relaxed text-ink-3">{plan.summary}</p>

              <div className="mt-5 flex items-baseline gap-1.5">
                {plan.priceNote ? <span className="text-sm text-ink-3">{plan.priceNote}</span> : null}
                <span className="text-4xl font-semibold tracking-tight text-ink">{formatEUR(price, { decimals: 0 })}</span>
                <span className="text-sm text-ink-3">/ month</span>
              </div>
              <p className="mt-1 text-[11px] text-ink-3">
                {plan.id === "enterprise"
                  ? "Annual agreement, invoiced net 30"
                  : cycle === "annual"
                    ? `Billed annually · ${formatEUR(price * 12, { decimals: 0 })} net per year`
                    : "Billed monthly · cancel any time"}
                {" · excl. VAT"}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-line bg-surface-2 p-3 text-xs">
                <div>
                  <dt className="text-ink-3">Seats</dt>
                  <dd className="mt-0.5 font-semibold capitalize text-ink">{plan.seats}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Contact unlocks</dt>
                  <dd className="mt-0.5 font-semibold capitalize text-ink">
                    {plan.limits.contactUnlocks === "unlimited" ? "Unlimited" : `${plan.limits.contactUnlocks} / month`}
                  </dd>
                </div>
              </dl>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-ink-2">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[11px] text-ink-3">
                Payment:{" "}
                {plan.paymentMethods
                  .map((m) => (m === "invoice" && plan.id !== "enterprise" ? `${paymentMethodLabels[m]} (annual)` : paymentMethodLabels[m]))
                  .join(" · ")}
              </p>

              <ButtonLink
                href={isCurrent ? "/dashboard/billing" : `/access?plan=${plan.id}&cycle=${plan.id === "enterprise" ? "annual" : cycle}`}
                variant={plan.highlighted ? "primary" : "secondary"}
                className="mt-4 w-full"
              >
                {isCurrent ? "Manage current plan" : plan.id === "enterprise" ? "Configure Enterprise" : `Activate ${plan.name}`}
              </ButtonLink>
            </article>
          );
        })}
      </div>
    </div>
  );
}
