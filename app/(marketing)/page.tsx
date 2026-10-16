import { ArrowRight } from "lucide-react";
import { getMarketSnapshot } from "@/lib/data/catalog";
import { Hero } from "@/components/marketing/hero";
import { LiveTicker } from "@/components/marketing/live-ticker";
import { CtaSection, FaqSection, ProblemSection, VerificationSection, WorkflowSection } from "@/components/marketing/sections";
import { SectionHeading } from "@/components/marketing/section-heading";
import { RoiCalculator } from "@/components/marketing/roi-calculator";
import { PricingTiers } from "@/components/pricing/pricing-tiers";
import { PriceSpreadAnalyzer } from "@/components/matrix/price-spread-analyzer";
import { ButtonLink } from "@/components/ui/button";

export default async function LandingPage() {
  // Public pages only ever receive masked vendor identities.
  const { rows, products } = await getMarketSnapshot(false);
  const verificationSample = rows.find((r) => r.supplier.certifications.includes("EU GMP")) ?? rows[0];

  return (
    <>
      <Hero rows={rows} />
      <LiveTicker rows={rows} />
      <ProblemSection />
      <WorkflowSection />

      <section id="analyzer" aria-labelledby="analyzer-heading" className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="analyzer-heading"
              eyebrow="Price Spread Analyzer"
              title="See exactly what each intermediary adds."
              description="Factory rate, freight and duty, distributor margin and broker markup — decomposed per pricing unit and benchmarked against every verified direct quote."
            />
            <ButtonLink href="/matrix" variant="secondary">
              Full comparison matrix
              <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
          <div className="mt-10 rounded-xl border border-line bg-surface p-5 sm:p-6">
            <PriceSpreadAnalyzer products={products} rows={rows} initialProductId="p-mcc" canContact={false} />
          </div>
        </div>
      </section>

      <VerificationSection sample={verificationSample} />

      <section id="roi" aria-labelledby="roi-heading" className="border-b border-line bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading
            id="roi-heading"
            eyebrow="ROI model"
            title="Estimate annual savings from bypassing broker markups."
            description="Set your intermediated spend and observed markup. The model applies only the share of spend available from verified direct sources and nets off membership fees."
          />
          <div className="mt-10">
            <RoiCalculator />
          </div>
        </div>
      </section>

      <section id="pricing" aria-labelledby="pricing-heading" className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading
            id="pricing-heading"
            eyebrow="Membership"
            title="Flat membership. No commissions, no transaction fees."
            description="Tiers scale with seats, monitoring depth and integration needs — never with your order volume."
            align="center"
            className="mb-12"
          />
          <PricingTiers />
        </div>
      </section>

      <FaqSection />
      <CtaSection />
    </>
  );
}
