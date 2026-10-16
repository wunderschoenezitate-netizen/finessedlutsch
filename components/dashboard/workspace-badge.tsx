import Link from "next/link";
import { Building2, FlaskConical } from "lucide-react";
import { getWorkspace } from "@/lib/session";
import { planById } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/dashboard/workspace-controls";

/* Request-time components: render inside <Suspense>. */

export async function WorkspaceBadge() {
  const ws = await getWorkspace();
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard/billing"
        className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2.5 py-1.5 hover:border-line-strong"
      >
        <Building2 aria-hidden className="size-3.5 text-ink-3" />
        <span className="max-w-[12rem] truncate text-xs font-medium text-ink">{ws.company}</span>
        <Badge tone={ws.tier === "basic" ? "neutral" : "emerald"}>{planById[ws.tier].name}</Badge>
      </Link>
      {ws.demo ? null : <SignOutButton />}
    </div>
  );
}

export function WorkspaceBadgeFallback() {
  return <div aria-hidden className="h-8 w-48 animate-pulse rounded-md bg-surface-2" />;
}

export async function DemoBanner() {
  const ws = await getWorkspace();
  if (!ws.demo) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-2 sm:px-6">
      <p className="flex items-center gap-2 text-xs text-cyan-100">
        <FlaskConical aria-hidden className="size-3.5 text-cyan-300" />
        Demo workspace with {planById[ws.tier].name} entitlements. Figures are illustrative.
      </p>
      <Link href="/access" className="text-xs font-medium text-cyan-200 underline-offset-2 hover:underline">
        Activate your own workspace →
      </Link>
    </div>
  );
}
