import type { Metadata } from "next";
import { Suspense } from "react";
import type { BillingCycle, PlanId } from "@/lib/types";
import { CheckoutFlow } from "@/components/access/checkout-flow";

export const metadata: Metadata = {
  title: "Activate Workspace",
  description: "Choose a membership tier, confirm company and tax details, and unlock the Origo dashboard immediately.",
};

const PLAN_IDS: PlanId[] = ["basic", "pro", "enterprise"];

async function Checkout({ searchParams }: { searchParams: PageProps<"/access">["searchParams"] }) {
  const params = await searchParams;
  const plan = PLAN_IDS.includes(params.plan as PlanId) ? (params.plan as PlanId) : "pro";
  const cycle: BillingCycle = params.cycle === "monthly" ? "monthly" : "annual";
  return <CheckoutFlow initialPlan={plan} initialCycle={cycle} />;
}

function CheckoutSkeleton() {
  return (
    <div aria-hidden className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <div className="h-56 animate-pulse rounded-xl bg-surface" />
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}

export default function AccessPage(props: PageProps<"/access">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Subscription &amp; access portal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Activate your workspace.</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Three steps, one confirmation. The dashboard unlocks in this browser as soon as the payment method is
          confirmed. Seats are assigned from the dashboard after activation.
        </p>
      </header>
      <Suspense fallback={<CheckoutSkeleton />}>
        <Checkout searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
