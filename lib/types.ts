/* Domain model for the wholesale comparison engine. */

export type CountryCode =
  | "AT"
  | "BE"
  | "CZ"
  | "DE"
  | "DK"
  | "ES"
  | "FR"
  | "HU"
  | "IE"
  | "IT"
  | "LT"
  | "NL"
  | "PL"
  | "SE";

export type DispatchRegion = "DACH" | "Benelux" | "Nordics" | "CEE" | "France" | "Southern Europe" | "Ireland";

export type SupplierType = "OEM Manufacturer" | "Laboratory Supplier" | "Wholesale Distributor" | "Logistics Hub";

export type Certification =
  | "ISO 9001"
  | "ISO 13485"
  | "ISO 14001"
  | "ISO/IEC 17025"
  | "EU GMP"
  | "GDP"
  | "REACH"
  | "CE";

export type Category =
  | "Lab Equipment"
  | "Lab Consumables"
  | "Analytical Reagents"
  | "Pharma Excipients"
  | "Industrial Packaging"
  | "Process Components";

export type Incoterm = "EXW" | "FCA" | "DAP";

export type AuditStatus = "verified" | "reaudit_due";

export interface RegistryChecks {
  /** EU VAT number validated against VIES */
  vies: boolean;
  /** Economic Operators Registration and Identification number */
  eori: boolean;
  /** Commercial register extract matched to legal entity */
  tradeRegister: boolean;
  /** EU / UN consolidated sanctions list screening */
  sanctions: boolean;
  /** Certificates cross-checked with the issuing certification body */
  certificateAuthenticity: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  country: CountryCode;
  city: string;
  founded: number;
  employees: string;
  certifications: Certification[];
  audit: {
    status: AuditStatus;
    score: number;
    lastAudit: string;
    nextAudit: string;
    checks: RegistryChecks;
  };
}

export interface Product {
  id: string;
  name: string;
  spec: string;
  category: Category;
  /** Pricing unit, e.g. "case of 1,000" */
  unit: string;
  hsCode: string;
  /**
   * Channel price levels per unit (EUR). Each level is cumulative:
   * factory (EXW) → direct landed (DAP) → authorised distributor → broker median.
   */
  channel: {
    factory: number;
    directLanded: number;
    distributor: number;
    brokerMedian: number;
  };
}

export interface Offer {
  id: string;
  productId: string;
  supplierId: string;
  /** Verified direct quote per unit (EUR, DAP destination EU) */
  unitPrice: number;
  moq: number;
  leadTimeDays: number;
  incoterm: Incoterm;
  dispatchHub: { city: string; country: CountryCode };
  updatedMinutesAgo: number;
  tags: string[];
}

/** Flattened row consumed by the comparison matrix. */
export interface MatrixRow {
  id: string;
  sku: string;
  product: Product;
  supplier: Supplier;
  /** Display name; masked for non-members. */
  supplierLabel: string;
  supplierMasked: boolean;
  unitPrice: number;
  brokerMedian: number;
  /** (broker median − direct quote) / direct quote */
  spread: number;
  moq: number;
  moqValue: number;
  leadTimeDays: number;
  incoterm: Incoterm;
  dispatchHub: { city: string; country: CountryCode };
  dispatchRegion: DispatchRegion;
  updatedMinutesAgo: number;
  tags: string[];
}

export type PlanId = "basic" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "annual";
export type PaymentMethod = "sepa_debit" | "card" | "invoice";
export type MatrixAccess = "preview" | PlanId;
