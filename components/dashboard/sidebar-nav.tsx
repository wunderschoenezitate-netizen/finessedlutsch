"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, ExternalLink, LayoutDashboard, ShieldCheck, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const dashboardNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/matrix", label: "Comparison Matrix", icon: Table2 },
  { href: "/dashboard/verification", label: "Vendor Verification", icon: ShieldCheck },
  { href: "/dashboard/billing", label: "Billing & Plan", icon: CreditCard },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-0.5">
      {dashboardNav.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
              active ? "bg-surface-3 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon aria-hidden className={cn("size-4", active ? "text-emerald-400" : "text-ink-3")} />
            {label}
          </Link>
        );
      })}
      <div className="mt-auto border-t border-line pt-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-ink-3 hover:text-ink">
          <ExternalLink aria-hidden className="size-3.5" />
          Public site
        </Link>
      </div>
    </nav>
  );
}

/** Horizontal variant for viewports below lg. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="scroll-thin flex gap-1 overflow-x-auto border-b border-line px-4 py-2 lg:hidden">
      {dashboardNav.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs",
              active ? "bg-surface-3 font-medium text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            <Icon aria-hidden className={cn("size-3.5", active ? "text-emerald-400" : "text-ink-3")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
