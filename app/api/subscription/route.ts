import { NextResponse, type NextRequest } from "next/server";
import { billing } from "@/lib/billing/provider";
import { allowedMethods } from "@/lib/billing/checkout";
import { sealWorkspace, unsealWorkspace, WORKSPACE_COOKIE, workspaceCookieOptions } from "@/lib/session";
import type { BillingCycle, PlanId } from "@/lib/types";

const PLAN_IDS: PlanId[] = ["basic", "pro", "enterprise"];

/** PATCH /api/subscription — change tier and/or billing cycle of the active workspace. */
export async function PATCH(request: NextRequest) {
  const workspace = unsealWorkspace(request.cookies.get(WORKSPACE_COOKIE)?.value);
  if (!workspace) {
    return NextResponse.json({ error: "no_active_subscription" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { plan?: string; cycle?: string } | null;
  const plan = body?.plan as PlanId;
  if (!PLAN_IDS.includes(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 422 });
  }
  const cycle: BillingCycle = plan === "enterprise" || body?.cycle === "annual" ? "annual" : "monthly";

  // Keep the existing payment method if the new configuration supports it.
  const methods = allowedMethods(plan, cycle);
  const paymentMethod = methods.includes(workspace.paymentMethod) ? workspace.paymentMethod : methods[0];

  const { effectiveAt } = await billing.changePlan(workspace.subscriptionId, plan, cycle);

  const next = { ...workspace, tier: plan, cycle, paymentMethod };
  const response = NextResponse.json({ tier: plan, cycle, paymentMethod, effectiveAt });
  response.cookies.set(WORKSPACE_COOKIE, sealWorkspace(next), workspaceCookieOptions);
  return response;
}
