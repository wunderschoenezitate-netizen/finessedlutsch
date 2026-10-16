"use client";

import { useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import type { BillingCycle, PlanId } from "@/lib/types";
import { monthlyRate, plans } from "@/lib/plans";
import { formatEUR } from "@/lib/format";
import { Segmented } from "@/components/ui/controls";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlanManager({ currentPlan, currentCycle, demo }: { currentPlan: PlanId; currentCycle: BillingCycle; demo: boolean }) {
  const [plan, setPlan] = useState<PlanId>(currentPlan);
  const [cycle, setCycle] = useState<BillingCycle>(currentCycle);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const effectiveCycle: BillingCycle = plan === "enterprise" ? "annual" : cycle;
  const unchanged = plan === currentPlan && effectiveCycle === currentCycle;

  async function apply() {
    setStatus("saving");
    const res = await fetch("/api/subscription", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, cycle: effectiveCycle }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    // Entitlements are read from the session on the server; reload to pick them up everywhere.
    window.location.reload();
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Billing cycle"
          size="sm"
          value={effectiveCycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual · −20%" },
          ]}
        />
        {plan === "enterprise" ? <span className="text-[11px] text-ink-3">Enterprise is billed annually</span> : null}
      </div>

      <div role="radiogroup" aria-label="Plan" className="grid gap-3 md:grid-cols-3">
        {plans.map((p) => {
          const selected = p.id === plan;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPlan(p.id)}
              className={cn(
                "rounded-lg border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
                selected ? "border-emerald-500/60 bg-emerald-500/[0.06]" : "border-line bg-surface-2 hover:border-line-strong",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{p.name}</span>
                {p.id === currentPlan ? (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-3">Current</span>
                ) : selected ? (
                  <Check aria-hidden className="size-4 text-emerald-400" />
                ) : null}
              </div>
              <div className="mt-2 text-lg font-semibold text-ink">
                {p.priceNote ? <span className="mr-1 text-xs font-normal text-ink-3">{p.priceNote}</span> : null}
                {formatEUR(monthlyRate(p, p.id === "enterprise" ? "annual" : effectiveCycle), { decimals: 0 })}
                <span className="text-xs font-normal text-ink-3"> / month</span>
              </div>
              <p className="mt-1 text-[11px] text-ink-3">
                {p.seats === "unlimited" ? "Unlimited seats" : `${p.seats} seats`} ·{" "}
                {p.entitlements.api ? `${(p.limits.apiCallsPerMonth / 1000).toFixed(0)}k API calls` : "No API"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs text-ink-3">
          Upgrades apply immediately and are prorated. Downgrades take effect at the end of the current period.
        </p>
        {demo ? (
          <ButtonLink href={`/access?plan=${plan}&cycle=${effectiveCycle}`} size="sm">
            Activate {plans.find((p) => p.id === plan)?.name} for your company
            <ArrowRight aria-hidden />
          </ButtonLink>
        ) : (
          <Button size="sm" disabled={unchanged || status === "saving"} onClick={apply}>
            {status === "saving" ? <LoaderCircle aria-hidden className="animate-spin" /> : null}
            {unchanged ? "Current configuration" : "Apply plan change"}
          </Button>
        )}
      </div>
      {status === "error" ? (
        <p role="alert" className="text-xs text-red-300">
          The plan change could not be applied. No charge was made — please retry.
        </p>
      ) : null}
    </div>
  );
}
