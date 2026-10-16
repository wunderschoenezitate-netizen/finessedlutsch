"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, LogOut, X } from "lucide-react";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/session", { method: "DELETE" });
        // Full reload clears client state preserved by <Activity> across routes
        // (recommended for logout in the Next.js "Preserving UI state" guide).
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/";
      }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-ink-3 hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:opacity-50"
    >
      <LogOut aria-hidden className="size-3.5" />
      Sign out
    </button>
  );
}

/** Shown once after checkout redirects with ?activated=1. */
export function ActivationNotice() {
  const params = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  if (params.get("activated") !== "1" || dismissed) return null;
  return (
    <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3">
      <p className="flex items-start gap-2 text-sm text-emerald-100">
        <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-400" />
        Subscription confirmed. Your workspace is unlocked and the first invoice has been issued to your billing contact.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="rounded p-0.5 text-emerald-200/70 hover:text-emerald-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
