import type { CountryCode, Incoterm, Offer } from "@/lib/types";
import { productById } from "@/lib/data/products";
import { supplierById } from "@/lib/data/suppliers";

/*
 * Verified direct quotes. `factor` positions each quote against its channel benchmark:
 * manufacturers quote around direct landed cost, distributors and hubs around their list level.
 */
type OfferSeed = [
  id: string,
  productId: string,
  supplierId: string,
  factor: number,
  moq: number,
  leadTimeDays: number,
  incoterm: Incoterm,
  hub: [city: string, country: CountryCode],
  updatedMinutesAgo: number,
  tags: string[],
];

const seeds: OfferSeed[] = [
  ["OF-10421", "p-bkr600", "sup-rtg", 0.98, 20, 9, "DAP", ["Mainz", "DE"], 4, ["Batch CoC", "Low-iron glass"]],
  ["OF-10422", "p-bkr600", "sup-bhl", 0.94, 40, 14, "FCA", ["Kolín", "CZ"], 22, ["Batch CoC"]],
  ["OF-10423", "p-bkr600", "sup-rml", 0.97, 5, 3, "DAP", ["Frankfurt am Main", "DE"], 2, ["Stock item", "Next-day DACH"]],
  ["OF-10431", "p-vfl250", "sup-rtg", 1.0, 10, 12, "DAP", ["Mainz", "DE"], 9, ["Batch-certified", "DAkkS traceable"]],
  ["OF-10432", "p-vfl250", "sup-bhl", 0.95, 25, 18, "FCA", ["Kolín", "CZ"], 41, ["Batch-certified"]],
  ["OF-10511", "p-ngl", "sup-ipp", 0.97, 50, 10, "DAP", ["Valencia", "ES"], 3, ["EN 455", "AQL 1.5"]],
  ["OF-10512", "p-ngl", "sup-rll", 0.95, 20, 4, "DAP", ["Rotterdam", "NL"], 6, ["Bonded stock", "EN 455"]],
  ["OF-10513", "p-ngl", "sup-pld", 0.98, 10, 5, "DAP", ["Budapest", "HU"], 18, ["EN 455"]],
  ["OF-10621", "p-mct", "sup-wpt", 0.99, 10, 7, "DAP", ["Bremen", "DE"], 5, ["DNase/RNase-free", "Lot release"]],
  ["OF-10622", "p-mct", "sup-nlp", 0.96, 20, 11, "FCA", ["Odense", "DK"], 27, ["DNase/RNase-free"]],
  ["OF-10623", "p-mct", "sup-rml", 0.96, 2, 2, "DAP", ["Frankfurt am Main", "DE"], 3, ["Stock item"]],
  ["OF-10631", "p-tip", "sup-wpt", 1.01, 20, 7, "DAP", ["Bremen", "DE"], 5, ["Sterile SAL 10⁻⁶", "Low retention"]],
  ["OF-10632", "p-tip", "sup-nlp", 0.97, 40, 12, "FCA", ["Odense", "DK"], 33, ["Sterile SAL 10⁻⁶"]],
  ["OF-20111", "p-acn", "sup-rca", 0.99, 24, 6, "DAP", ["Lyon", "FR"], 2, ["ADR class 3", "CoA per lot"]],
  ["OF-20112", "p-acn", "sup-vrg", 0.95, 48, 9, "FCA", ["Gdańsk", "PL"], 12, ["ADR class 3", "CoA per lot"]],
  ["OF-20113", "p-acn", "sup-rll", 0.97, 12, 3, "DAP", ["Rotterdam", "NL"], 7, ["ADR class 3", "Bonded stock"]],
  ["OF-20121", "p-meoh", "sup-rca", 1.0, 16, 6, "DAP", ["Lyon", "FR"], 2, ["ADR class 3", "CoA per lot"]],
  ["OF-20122", "p-meoh", "sup-vrg", 0.96, 32, 10, "FCA", ["Gdańsk", "PL"], 15, ["ADR class 3"]],
  ["OF-30111", "p-mcc", "sup-lec", 0.98, 40, 12, "DAP", ["Pavia", "IT"], 8, ["CEP", "DMF on file"]],
  ["OF-30112", "p-mcc", "sup-hex", 1.0, 20, 8, "DAP", ["Veendam", "NL"], 11, ["CEP", "GDP chain"]],
  ["OF-30113", "p-mcc", "sup-lhp", 0.96, 10, 4, "DAP", ["Saint-Priest", "FR"], 19, ["GDP chain", "QP release"]],
  ["OF-30121", "p-mgst", "sup-lec", 0.97, 10, 14, "DAP", ["Pavia", "IT"], 8, ["Vegetable origin", "CEP"]],
  ["OF-30122", "p-mgst", "sup-hex", 1.01, 8, 9, "DAP", ["Veendam", "NL"], 26, ["Vegetable origin"]],
  ["OF-30131", "p-lac", "sup-hex", 0.98, 40, 8, "DAP", ["Veendam", "NL"], 11, ["TSE/BSE statement"]],
  ["OF-30132", "p-lac", "sup-lhp", 0.97, 16, 3, "DAP", ["Saint-Priest", "FR"], 14, ["GDP chain"]],
  ["OF-40111", "p-cfg", "sup-alt", 0.99, 1, 21, "DAP", ["Graz", "AT"], 37, ["3-yr warranty", "IQ/OQ available"]],
  ["OF-40112", "p-cfg", "sup-rml", 0.98, 1, 4, "DAP", ["Frankfurt am Main", "DE"], 12, ["Stock item"]],
  ["OF-40121", "p-bal", "sup-npr", 1.0, 1, 15, "DAP", ["Heilbronn", "DE"], 20, ["DAkkS calibration", "IQ/OQ available"]],
  ["OF-40122", "p-bal", "sup-alt", 1.02, 1, 18, "DAP", ["Graz", "AT"], 44, ["Internal calibration"]],
  ["OF-40123", "p-bal", "sup-pld", 0.97, 1, 6, "DAP", ["Budapest", "HU"], 31, ["Stock item"]],
  ["OF-40131", "p-fhd", "sup-blf", 0.97, 1, 35, "DAP", ["Kaunas", "LT"], 58, ["EN 14175 type-tested", "Installation incl."]],
  ["OF-40132", "p-fhd", "sup-rml", 0.99, 1, 28, "DAP", ["Frankfurt am Main", "DE"], 63, ["EN 14175 type-tested"]],
  ["OF-50111", "p-jcn", "sup-ard", 0.98, 2, 10, "DAP", ["Liège", "BE"], 16, ["UN 3H1/Y1.6/150", "Food-contact grade"]],
  ["OF-50112", "p-jcn", "sup-rll", 0.96, 1, 4, "DAP", ["Rotterdam", "NL"], 9, ["UN 3H1/Y1.6/150"]],
  ["OF-50121", "p-ctn", "sup-smk", 0.97, 4, 9, "DAP", ["Växjö", "SE"], 24, ["FSC board", "Print-ready"]],
  ["OF-50122", "p-ctn", "sup-ard", 1.01, 2, 11, "DAP", ["Liège", "BE"], 29, ["80 % recycled content"]],
  ["OF-60111", "p-fer", "sup-emi", 0.96, 4, 13, "DAP", ["Parma", "IT"], 21, ["EN 10204 3.1", "Ra ≤ 0.8 µm"]],
  ["OF-60112", "p-fer", "sup-bfc", 1.0, 2, 8, "DAP", ["Eindhoven", "NL"], 13, ["EN 10204 3.1"]],
  ["OF-60121", "p-dvl", "sup-bfc", 0.98, 4, 16, "DAP", ["Eindhoven", "NL"], 13, ["FDA 21 CFR 177", "EN 10204 3.1"]],
  ["OF-60122", "p-dvl", "sup-emi", 0.95, 6, 20, "DAP", ["Parma", "IT"], 47, ["EN 10204 3.1"]],
  ["OF-60131", "p-tub", "sup-sbp", 0.99, 10, 9, "DAP", ["Limerick", "IE"], 6, ["USP Class VI", "Lot traceability"]],
  ["OF-60132", "p-tub", "sup-rll", 0.97, 4, 3, "DAP", ["Rotterdam", "NL"], 10, ["USP Class VI", "Bonded stock"]],
];

const isChannelPartner = (supplierId: string) => {
  const type = supplierById.get(supplierId)?.type;
  return type === "Wholesale Distributor" || type === "Logistics Hub";
};

export const offers: Offer[] = seeds.map(
  ([id, productId, supplierId, factor, moq, leadTimeDays, incoterm, [city, country], updatedMinutesAgo, tags]) => {
    const product = productById.get(productId);
    if (!product) throw new Error(`Unknown product ${productId} in offer ${id}`);
    const base = isChannelPartner(supplierId) ? product.channel.distributor : product.channel.directLanded;
    return {
      id,
      productId,
      supplierId,
      unitPrice: Math.round(base * factor * 100) / 100,
      moq,
      leadTimeDays,
      incoterm,
      dispatchHub: { city, country },
      updatedMinutesAgo,
      tags,
    };
  },
);
