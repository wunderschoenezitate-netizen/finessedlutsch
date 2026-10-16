import type { CountryCode, DispatchRegion } from "@/lib/types";

export const countryNames: Record<CountryCode, string> = {
  AT: "Austria",
  BE: "Belgium",
  CZ: "Czechia",
  DE: "Germany",
  DK: "Denmark",
  ES: "Spain",
  FR: "France",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  LT: "Lithuania",
  NL: "Netherlands",
  PL: "Poland",
  SE: "Sweden",
};

const regionByCountry: Record<CountryCode, DispatchRegion> = {
  AT: "DACH",
  DE: "DACH",
  BE: "Benelux",
  NL: "Benelux",
  DK: "Nordics",
  SE: "Nordics",
  CZ: "CEE",
  HU: "CEE",
  LT: "CEE",
  PL: "CEE",
  FR: "France",
  ES: "Southern Europe",
  IT: "Southern Europe",
  IE: "Ireland",
};

export const dispatchRegions: DispatchRegion[] = [
  "DACH",
  "Benelux",
  "France",
  "Nordics",
  "CEE",
  "Southern Europe",
  "Ireland",
];

export function regionOf(country: CountryCode): DispatchRegion {
  return regionByCountry[country];
}

/* Billing countries accepted at checkout (EU/EEA + CH + UK). */
export const billingCountries = [
  { code: "DE", name: "Germany", eu: true },
  { code: "AT", name: "Austria", eu: true },
  { code: "BE", name: "Belgium", eu: true },
  { code: "CZ", name: "Czechia", eu: true },
  { code: "DK", name: "Denmark", eu: true },
  { code: "ES", name: "Spain", eu: true },
  { code: "FI", name: "Finland", eu: true },
  { code: "FR", name: "France", eu: true },
  { code: "HU", name: "Hungary", eu: true },
  { code: "IE", name: "Ireland", eu: true },
  { code: "IT", name: "Italy", eu: true },
  { code: "LU", name: "Luxembourg", eu: true },
  { code: "NL", name: "Netherlands", eu: true },
  { code: "PL", name: "Poland", eu: true },
  { code: "PT", name: "Portugal", eu: true },
  { code: "SE", name: "Sweden", eu: true },
  { code: "CH", name: "Switzerland", eu: false },
  { code: "NO", name: "Norway", eu: false },
  { code: "GB", name: "United Kingdom", eu: false },
] as const;

export type BillingCountryCode = (typeof billingCountries)[number]["code"];
