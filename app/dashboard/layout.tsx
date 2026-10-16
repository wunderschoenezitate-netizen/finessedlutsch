import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { MobileNav, SidebarNav } from "@/components/dashboard/sidebar-nav";
import { DemoBanner, WorkspaceBadge, WorkspaceBadgeFallback } from "@/components/dashboard/workspace-badge";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Origo Dashboard" },
  robots: { index: false },
};

/*
 * Static app shell: sidebar and frame prerender instantly; anything that reads the
 * workspace session streams in behind its own <Suspense> boundary.
 */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex">
        <div className="px-1.5 pb-6">
          <Logo href="/dashboard" compact />
        </div>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="lg:hidden">
              <Logo href="/dashboard" compact />
            </div>
            <p className="hidden text-xs text-ink-3 lg:block">
              Prices in EUR, delivered EU (DAP) · Broker medians from observed RFQ responses
            </p>
            <Suspense fallback={<WorkspaceBadgeFallback />}>
              <WorkspaceBadge />
            </Suspense>
          </div>
          <MobileNav />
        </header>
        <Suspense fallback={null}>
          <DemoBanner />
        </Suspense>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
