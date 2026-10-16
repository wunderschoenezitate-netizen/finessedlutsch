import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <rect width="32" height="32" rx="7" fill="#0f0f12" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" stroke="#3f3f46" />
      {/* Origin node and three direct routes */}
      <path d="M9 23 L16 9 L23 23" fill="none" stroke="#34d399" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M11.8 18 H20.2" stroke="#22d3ee" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="16" cy="9" r="2.5" fill="#f4f4f5" />
    </svg>
  );
}

export function Logo({ href = "/", compact = false, className }: { href?: string; compact?: boolean; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        className,
      )}
    >
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-ink">{site.name}</span>
        {compact ? null : (
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3">{site.tagline}</span>
        )}
      </span>
    </Link>
  );
}
