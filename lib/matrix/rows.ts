import type { MatrixRow, Offer, Supplier } from "@/lib/types";
import { offers } from "@/lib/data/offers";
import { productById } from "@/lib/data/products";
import { supplierById } from "@/lib/data/suppliers";
import { regionOf } from "@/lib/geo";

/** Stable pseudonymous reference so masked rows stay distinguishable without revealing identity. */
function maskedCode(supplier: Supplier) {
  let hash = 0;
  for (const ch of supplier.id) hash = (hash * 31 + ch.charCodeAt(0)) % 9000;
  return `${supplier.country}-${1000 + hash}`;
}

function maskedReference(supplier: Supplier) {
  return `${supplier.type} · ${maskedCode(supplier)}`;
}

function toRow(offer: Offer, revealIdentity: boolean): MatrixRow {
  const product = productById.get(offer.productId);
  const supplier = supplierById.get(offer.supplierId);
  if (!product || !supplier) throw new Error(`Offer ${offer.id} references unknown product or supplier`);

  const masked = !revealIdentity;
  const brokerMedian = product.channel.brokerMedian;
  return {
    id: offer.id,
    sku: offer.id,
    product,
    // Masked rows must not leak identifying fields to the client bundle.
    supplier: masked
      ? { ...supplier, id: `anon-${maskedCode(supplier)}`, name: maskedReference(supplier), city: "—", founded: 0 }
      : supplier,
    supplierLabel: masked ? maskedReference(supplier) : supplier.name,
    supplierMasked: masked,
    unitPrice: offer.unitPrice,
    brokerMedian,
    spread: brokerMedian / offer.unitPrice - 1,
    moq: offer.moq,
    moqValue: offer.moq * offer.unitPrice,
    leadTimeDays: offer.leadTimeDays,
    incoterm: offer.incoterm,
    dispatchHub: masked ? { city: "EU hub", country: offer.dispatchHub.country } : offer.dispatchHub,
    dispatchRegion: regionOf(offer.dispatchHub.country),
    updatedMinutesAgo: offer.updatedMinutesAgo,
    tags: offer.tags,
  };
}

export function buildMatrixRows(revealIdentity: boolean): MatrixRow[] {
  return offers.map((o) => toRow(o, revealIdentity));
}
