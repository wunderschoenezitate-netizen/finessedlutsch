import { NextResponse, type NextRequest } from "next/server";
import { getMarketSnapshot } from "@/lib/data/catalog";
import { defaultQuery, runQuery, type MatrixQuery, type SortKey } from "@/lib/matrix/query";
import { entitlementsFor } from "@/lib/plans";
import { unsealWorkspace, WORKSPACE_COOKIE } from "@/lib/session";
import type { Category, Certification, DispatchRegion } from "@/lib/types";

const SORT_KEYS: SortKey[] = ["spread", "unitPrice", "leadTimeDays", "moqValue", "score", "updated", "supplier"];

function list<T extends string>(params: URLSearchParams, key: string) {
  return params.getAll(key).flatMap((v) => v.split(",")).filter(Boolean) as T[];
}

function num(params: URLSearchParams, key: string) {
  const v = params.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * GET /api/v1/offers
 * Query: q, category, region, cert, type (comma-separated or repeated), maxMoqValue, maxLeadTime,
 * auditedOnly=true, sort=<key>, dir=asc|desc.
 * Uses the same query engine as the matrix UI. Vendor identities require an API-enabled plan.
 */
export async function GET(request: NextRequest) {
  const workspace = unsealWorkspace(request.cookies.get(WORKSPACE_COOKIE)?.value);
  const reveal = workspace ? entitlementsFor(workspace.tier).api : false;
  const { rows } = await getMarketSnapshot(reveal);

  const p = request.nextUrl.searchParams;
  const sortKey = p.get("sort") as SortKey;
  const query: MatrixQuery = {
    ...defaultQuery,
    search: p.get("q") ?? "",
    categories: list<Category>(p, "category"),
    supplierTypes: list(p, "type"),
    regions: list<DispatchRegion>(p, "region"),
    certifications: list<Certification>(p, "cert"),
    maxMoqValue: num(p, "maxMoqValue"),
    maxLeadTime: num(p, "maxLeadTime"),
    auditedOnly: p.get("auditedOnly") === "true",
    sort: {
      key: SORT_KEYS.includes(sortKey) ? sortKey : defaultQuery.sort.key,
      dir: p.get("dir") === "asc" ? "asc" : "desc",
    },
  };

  const data = runQuery(rows, query).map((r) => ({
    id: r.id,
    product: { id: r.product.id, name: r.product.name, spec: r.product.spec, category: r.product.category, unit: r.product.unit, hsCode: r.product.hsCode },
    vendor: {
      name: r.supplierLabel,
      masked: r.supplierMasked,
      type: r.supplier.type,
      country: r.supplier.country,
      certifications: r.supplier.certifications,
      audit: { status: r.supplier.audit.status, score: r.supplier.audit.score },
    },
    price: { unit: r.unitPrice, brokerMedian: r.brokerMedian, spread: Number(r.spread.toFixed(4)), currency: "EUR", incoterm: r.incoterm },
    moq: { quantity: r.moq, value: Number(r.moqValue.toFixed(2)) },
    leadTimeDays: r.leadTimeDays,
    dispatch: { ...r.dispatchHub, region: r.dispatchRegion },
  }));

  return NextResponse.json(
    { count: data.length, identitiesRevealed: reveal, data },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
