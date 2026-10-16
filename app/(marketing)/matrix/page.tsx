import type { Metadata } from "next";
import { getMarketSnapshot } from "@/lib/data/catalog";
import { ComparisonMatrix } from "@/components/matrix/comparison-matrix";

export const metadata: Metadata = {
  title: "Wholesale Comparison Matrix",
  description:
    "Live comparison of verified EU manufacturers, laboratory suppliers and logistics hubs by price, MOQ, lead time, dispatch region and certification.",
};

export default async function MatrixPage() {
  const { rows, products } = await getMarketSnapshot(false);

  return (
    <div className="mx-auto max-w-[96rem] px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Live wholesale comparison matrix</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Verified direct quotes, normalised to landed cost.</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Filter by MOQ commitment, dispatch region, certification and lead time. Spread is the broker median over each
            verified direct quote for the identical specification and pricing unit.
          </p>
        </div>
      </header>
      <ComparisonMatrix rows={rows} products={products} access="preview" />
    </div>
  );
}
