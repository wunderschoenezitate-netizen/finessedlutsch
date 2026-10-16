import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { BillingCycle, PaymentMethod, PlanId } from "@/lib/types";
import type { BillingCountryCode } from "@/lib/geo";

/*
 * Workspace session: an HMAC-signed, httpOnly cookie written once the billing provider
 * confirms a subscription. Reading it is a request-time operation, so every caller must
 * sit behind a <Suspense> boundary (Cache Components).
 */

export const WORKSPACE_COOKIE = "origo_ws";
export const WORKSPACE_MAX_AGE = 60 * 60 * 24 * 30;

export interface Workspace {
  id: string;
  company: string;
  contactEmail: string;
  country: BillingCountryCode;
  vatId: string | null;
  tier: PlanId;
  cycle: BillingCycle;
  paymentMethod: PaymentMethod;
  subscriptionId: string;
  activatedAt: string;
  demo: boolean;
}

export const demoWorkspace: Workspace = {
  id: "ws_demo",
  company: "Demo workspace",
  contactEmail: "demo@origo.example",
  country: "DE",
  vatId: null,
  tier: "pro",
  cycle: "annual",
  paymentMethod: "invoice",
  subscriptionId: "sub_demo",
  activatedAt: "2026-01-05T09:00:00.000Z",
  demo: true,
};

let ephemeralSecret: string | undefined;

function secret() {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV === "production") {
    // Never fall back to a known value in production. A per-process secret keeps
    // sessions unforgeable; they simply expire on restart until SESSION_SECRET is set.
    if (!ephemeralSecret) {
      console.error("[session] SESSION_SECRET is missing or shorter than 32 characters; using an ephemeral secret.");
      ephemeralSecret = randomBytes(32).toString("hex");
    }
    return ephemeralSecret;
  }
  return "origo-development-secret-do-not-use-in-production";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sealWorkspace(ws: Workspace): string {
  const payload = Buffer.from(JSON.stringify(ws)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function unsealWorkspace(token: string | undefined): Workspace | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Workspace;
  } catch {
    return null;
  }
}

export const workspaceCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WORKSPACE_MAX_AGE,
};

/** Active workspace, or the read-only demo workspace when no subscription is present. */
export async function getWorkspace(): Promise<Workspace> {
  const token = (await cookies()).get(WORKSPACE_COOKIE)?.value;
  return unsealWorkspace(token) ?? demoWorkspace;
}
