/**
 * Brand + platform constants. Every marketing figure rendered on the landing page
 * is sourced from here so it can be replaced with audited numbers in one place.
 */
export const site = {
  name: "Origo",
  legalName: "Origo Sourcing Intelligence GmbH",
  tagline: "Direct Sourcing Intelligence",
  description:
    "B2B price intelligence and vendor verification for European wholesale procurement. Compare certified manufacturers, laboratories and EU logistics hubs directly — without broker markups.",
  registeredOffice: "Frankfurt am Main, Germany",
  contactEmail: "procurement@origo.example",
  salesEmail: "enterprise@origo.example",
} as const;

export const platformMetrics = [
  { label: "Audited EU vendors", value: "2,418", detail: "Manufacturers, labs, distributors" },
  { label: "Median broker markup identified", value: "32.8%", detail: "vs. best verified direct quote" },
  { label: "EU dispatch hubs indexed", value: "26", detail: "Across 14 member states" },
  { label: "Unverified intermediaries listed", value: "0", detail: "Brokers are excluded by policy" },
] as const;

export const marketingNav = [
  { href: "/#platform", label: "Platform" },
  { href: "/matrix", label: "Comparison Matrix" },
  { href: "/#verification", label: "Verification" },
  { href: "/#roi", label: "ROI" },
  { href: "/#pricing", label: "Pricing" },
] as const;
