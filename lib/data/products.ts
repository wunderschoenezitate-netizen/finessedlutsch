import type { Category, Product } from "@/lib/types";

/*
 * Reference product lines with channel price benchmarks.
 *
 * Every product is parameterised by its ex-works factory rate and three ratios:
 *   logistics   — freight, packaging and duty to an EU destination (DAP), as a share of factory rate
 *   distributor — authorised distributor margin over direct landed cost
 *   brokerSpread — median broker quote over direct landed cost (observed RFQ responses)
 */
interface ProductSeed {
  id: string;
  name: string;
  spec: string;
  category: Category;
  unit: string;
  hsCode: string;
  factory: number;
  logistics: number;
  distributor: number;
  brokerSpread: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function toProduct(seed: ProductSeed): Product {
  const directLanded = seed.factory * (1 + seed.logistics);
  return {
    id: seed.id,
    name: seed.name,
    spec: seed.spec,
    category: seed.category,
    unit: seed.unit,
    hsCode: seed.hsCode,
    channel: {
      factory: round2(seed.factory),
      directLanded: round2(directLanded),
      distributor: round2(directLanded * (1 + seed.distributor)),
      brokerMedian: round2(directLanded * (1 + seed.brokerSpread)),
    },
  };
}

const seeds: ProductSeed[] = [
  {
    id: "p-bkr600",
    name: "Griffin beaker 600 mL",
    spec: "Borosilicate 3.3, ISO 3819, graduated",
    category: "Lab Consumables",
    unit: "case of 48",
    hsCode: "7017.20",
    factory: 58,
    logistics: 0.09,
    distributor: 0.14,
    brokerSpread: 0.29,
  },
  {
    id: "p-vfl250",
    name: "Volumetric flask 250 mL, Class A",
    spec: "DIN EN ISO 1042, batch-certified, NS 14/23",
    category: "Lab Consumables",
    unit: "case of 12",
    hsCode: "7017.20",
    factory: 64.8,
    logistics: 0.08,
    distributor: 0.15,
    brokerSpread: 0.34,
  },
  {
    id: "p-ngl",
    name: "Nitrile examination gloves",
    spec: "Powder-free, EN 455, EN ISO 374-5, size M",
    category: "Lab Consumables",
    unit: "case of 1,000",
    hsCode: "4015.12",
    factory: 31.5,
    logistics: 0.11,
    distributor: 0.12,
    brokerSpread: 0.38,
  },
  {
    id: "p-mct",
    name: "Microcentrifuge tubes 1.5 mL",
    spec: "Polypropylene, DNase/RNase-free, snap cap",
    category: "Lab Consumables",
    unit: "case of 5,000",
    hsCode: "3926.90",
    factory: 54,
    logistics: 0.07,
    distributor: 0.16,
    brokerSpread: 0.33,
  },
  {
    id: "p-tip",
    name: "Filter pipette tips 200 µL",
    spec: "Sterile, racked, low-retention",
    category: "Lab Consumables",
    unit: "case of 960",
    hsCode: "3926.90",
    factory: 29.6,
    logistics: 0.07,
    distributor: 0.17,
    brokerSpread: 0.36,
  },
  {
    id: "p-acn",
    name: "Acetonitrile, HPLC gradient grade",
    spec: "≥ 99.9 %, UV cut-off 190 nm",
    category: "Analytical Reagents",
    unit: "2.5 L bottle",
    hsCode: "2926.90",
    factory: 41.2,
    logistics: 0.12,
    distributor: 0.13,
    brokerSpread: 0.27,
  },
  {
    id: "p-meoh",
    name: "Methanol, LC-MS grade",
    spec: "≥ 99.95 %, residue on evaporation ≤ 1 ppm",
    category: "Analytical Reagents",
    unit: "4 L bottle",
    hsCode: "2905.11",
    factory: 52.4,
    logistics: 0.12,
    distributor: 0.14,
    brokerSpread: 0.29,
  },
  {
    id: "p-mcc",
    name: "Microcrystalline cellulose PH-102",
    spec: "Ph. Eur. / USP-NF, 100 µm nominal",
    category: "Pharma Excipients",
    unit: "25 kg bag",
    hsCode: "3912.90",
    factory: 88,
    logistics: 0.06,
    distributor: 0.11,
    brokerSpread: 0.37,
  },
  {
    id: "p-mgst",
    name: "Magnesium stearate",
    spec: "Vegetable origin, Ph. Eur.",
    category: "Pharma Excipients",
    unit: "20 kg drum",
    hsCode: "2915.70",
    factory: 132,
    logistics: 0.06,
    distributor: 0.12,
    brokerSpread: 0.41,
  },
  {
    id: "p-lac",
    name: "Lactose monohydrate 200 mesh",
    spec: "Ph. Eur. / USP-NF, milled",
    category: "Pharma Excipients",
    unit: "25 kg bag",
    hsCode: "1702.11",
    factory: 49.5,
    logistics: 0.06,
    distributor: 0.11,
    brokerSpread: 0.32,
  },
  {
    id: "p-cfg",
    name: "Microcentrifuge, 24-place",
    spec: "24 × 2.0 mL rotor, 15,000 rpm, 230 V",
    category: "Lab Equipment",
    unit: "unit",
    hsCode: "8421.19",
    factory: 1180,
    logistics: 0.04,
    distributor: 0.15,
    brokerSpread: 0.24,
  },
  {
    id: "p-bal",
    name: "Analytical balance 220 g",
    spec: "Readability 0.1 mg, internal calibration",
    category: "Lab Equipment",
    unit: "unit",
    hsCode: "9016.00",
    factory: 1760,
    logistics: 0.03,
    distributor: 0.16,
    brokerSpread: 0.22,
  },
  {
    id: "p-fhd",
    name: "Fume cupboard 1,500 mm",
    spec: "EN 14175 type-tested, VAV control",
    category: "Lab Equipment",
    unit: "unit",
    hsCode: "8414.80",
    factory: 6150,
    logistics: 0.07,
    distributor: 0.13,
    brokerSpread: 0.21,
  },
  {
    id: "p-jcn",
    name: "HDPE jerrycan 20 L",
    spec: "UN 3H1/Y1.6/150, tamper-evident closure",
    category: "Industrial Packaging",
    unit: "pallet of 120",
    hsCode: "3923.30",
    factory: 384,
    logistics: 0.14,
    distributor: 0.14,
    brokerSpread: 0.31,
  },
  {
    id: "p-ctn",
    name: "Corrugated shipping carton",
    spec: "600 × 400 × 400 mm, double wall, FEFCO 0201",
    category: "Industrial Packaging",
    unit: "pallet of 250",
    hsCode: "4819.10",
    factory: 255,
    logistics: 0.16,
    distributor: 0.12,
    brokerSpread: 0.28,
  },
  {
    id: "p-fer",
    name: "Tri-clamp ferrule 1.5\"",
    spec: "AISI 316L, Ra ≤ 0.8 µm, EN 10204 3.1",
    category: "Process Components",
    unit: "pack of 50",
    hsCode: "7307.29",
    factory: 198,
    logistics: 0.05,
    distributor: 0.17,
    brokerSpread: 0.39,
  },
  {
    id: "p-dvl",
    name: "Diaphragm valve DN25",
    spec: "316L body, PTFE/EPDM diaphragm, manual",
    category: "Process Components",
    unit: "unit",
    hsCode: "8481.80",
    factory: 204,
    logistics: 0.04,
    distributor: 0.18,
    brokerSpread: 0.33,
  },
  {
    id: "p-tub",
    name: "Platinum-cured silicone tubing",
    spec: "6.4 × 9.6 mm, USP Class VI",
    category: "Process Components",
    unit: "15 m coil",
    hsCode: "3917.32",
    factory: 82,
    logistics: 0.05,
    distributor: 0.16,
    brokerSpread: 0.35,
  },
];

export const products: Product[] = seeds.map(toProduct);
export const productById = new Map(products.map((p) => [p.id, p]));
