import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { buildMatrixRows } from "@/lib/matrix/rows";
import { products } from "@/lib/data/products";
import type { MatrixRow, Product } from "@/lib/types";

/*
 * Server-side data access for market data.
 *
 * Swap the bodies for calls to the pricing service; callers stay unchanged.
 * Results are cached for minutes and tagged so a feed ingest can invalidate them
 * with `revalidateTag("market-snapshot")`.
 */

export interface MarketSnapshot {
  rows: MatrixRow[];
  products: Product[];
}

export async function getMarketSnapshot(revealIdentity: boolean): Promise<MarketSnapshot> {
  "use cache";
  cacheLife("minutes");
  cacheTag("market-snapshot");
  return { rows: buildMatrixRows(revealIdentity), products };
}
