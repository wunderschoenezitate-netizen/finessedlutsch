import { NextResponse, type NextRequest } from "next/server";
import { billing } from "@/lib/billing/provider";
import { validateCheckout } from "@/lib/billing/checkout";
import { sealWorkspace, WORKSPACE_COOKIE, workspaceCookieOptions, type Workspace } from "@/lib/session";

/**
 * POST /api/checkout
 * Creates the subscription with the billing provider and unlocks the workspace
 * in the same response (signed session cookie). No manual onboarding step.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = validateCheckout(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "validation_failed", fields: parsed.errors }, { status: 422 });
  }
  const input = parsed.value;

  const subscription = await billing.createSubscription({
    plan: input.plan,
    cycle: input.cycle,
    paymentMethod: input.paymentMethod,
    customer: {
      company: input.company,
      email: input.email,
      country: input.country,
      vatId: input.vatId || null,
      poNumber: input.poNumber || null,
    },
  });

  if (subscription.status !== "active") {
    return NextResponse.json({ error: "payment_pending", subscriptionId: subscription.subscriptionId }, { status: 402 });
  }

  const workspace: Workspace = {
    id: `ws_${subscription.customerId.slice(4)}`,
    company: input.company,
    contactEmail: input.email,
    country: input.country,
    vatId: input.vatId || null,
    tier: input.plan,
    cycle: input.cycle,
    paymentMethod: input.paymentMethod,
    subscriptionId: subscription.subscriptionId,
    activatedAt: subscription.firstInvoice.issuedAt,
    demo: false,
  };

  const response = NextResponse.json(
    {
      workspaceId: workspace.id,
      tier: workspace.tier,
      invoice: { number: subscription.firstInvoice.number, total: subscription.firstInvoice.tax.gross },
      redirectTo: "/dashboard?activated=1",
    },
    { status: 201 },
  );
  response.cookies.set(WORKSPACE_COOKIE, sealWorkspace(workspace), workspaceCookieOptions);
  return response;
}
