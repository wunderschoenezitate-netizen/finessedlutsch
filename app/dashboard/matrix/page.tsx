import type { Metadata } from "next";
import { Suspense } from "react";
import { getMarketSnapshot } from "@/lib/data/catalog";
import { getWorkspace } from "@/lib/session";
import { ComparisonMatrix } from "@/components/matrix/comparison-matrix";
import { PageHeader } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Comparison Matrix" };

async function MemberMatrix() {
  const [ws, { rows, products }] = await Promise.all([getWorkspace(), getMarketSnapshot(true)]);
  return <ComparisonMatrix rows={rows} products={products} access={ws.tier} />;
}

function MatrixSkeleton() {
  return (
    <div aria-hidden className="space-y-4">
      <div className="h-9 animate-pulse rounded-md bg-surface-2" />
      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <div className="hidden h-[32rem] animate-pulse rounded-lg bg-surface lg:block" />
        <div className="h-[32rem] animate-pulse rounded-lg bg-surface" />
      </div>
    </div>
  );
}

export default function DashboardMatrixPage() {
  return (
    <div className="mx-auto max-w-[96rem]">
      <PageHeader
        title="Comparison Matrix"
        description="All verified offers with vendor identities. Open the Spread Analyzer on any row to decompose the price."
      />
      <Suspense fallback={<MatrixSkeleton />}>
        <MemberMatrix />
      </Suspense>
    </div>
  );
}
