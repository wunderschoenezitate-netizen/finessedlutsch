import {
  ArrowRight,
  Ban,
  Building2,
  ClipboardCheck,
  FileSearch,
  Fingerprint,
  Handshake,
  Layers,
  Landmark,
  Scale,
  ScanSearch,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { MatrixRow } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { AuditBadge } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/marketing/section-heading";

/* ---------------------------------- Problem ---------------------------------- */

const problems = [
  {
    icon: Layers,
    title: "Fragmented supplier data",
    body: "Specifications, MOQs and lead times sit in PDFs, portals and email threads. A comparable shortlist takes weeks to assemble and is outdated on arrival.",
    response: "One normalised matrix: landed cost, MOQ value, lead time and dispatch hub per verified quote.",
  },
  {
    icon: TriangleAlert,
    title: "Intermediary markups",
    body: "Brokers resell distributor stock at 20–45 % above direct landed cost, frequently for little more than a supplier introduction.",
    response: "Every price is decomposed into factory rate, freight, distributor margin and broker markup.",
  },
  {
    icon: FileSearch,
    title: "Unverifiable compliance",
    body: "Certificates circulate as screenshots. Expired ISO or GMP status typically surfaces at incoming inspection, not at award.",
    response: "Certificates are confirmed with the issuing body and monitored until expiry.",
  },
];

export function ProblemSection() {
  return (
    <section id="platform" aria-labelledby="platform-heading" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          id="platform-heading"
          eyebrow="The problem"
          title="Wholesale sourcing is opaque by design."
          description="Fragmented markets reward whoever controls the supplier contact. Origo removes that leverage by making verified direct pricing visible to the buyer."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {problems.map(({ icon: Icon, title, body, response }) => (
            <article key={title} className="flex flex-col rounded-xl border border-line bg-surface p-6">
              <Icon aria-hidden className="size-5 text-ink-3" />
              <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{body}</p>
              <p className="mt-5 border-t border-line pt-4 text-sm text-emerald-200">
                <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Origo</span>
                {response}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Workflow ---------------------------------- */

const steps = [
  {
    n: "01",
    icon: ShieldCheck,
    title: "Verify",
    body: "Automated KYB on every vendor before listing: legal entity, VAT, EORI, sanctions and certificate authenticity. Annual re-audit.",
    points: ["Trade-register extract matched to legal entity", "Certificates confirmed with issuing body", "Failed checks block awards automatically"],
  },
  {
    n: "02",
    icon: Scale,
    title: "Compare",
    body: "Quotes are normalised to delivered EU cost and benchmarked against distributor list and observed broker quotes.",
    points: ["Landed cost per pricing unit (DAP)", "MOQ commitment and lead time", "Spread versus broker median"],
  },
  {
    n: "03",
    icon: Handshake,
    title: "Contract direct",
    body: "Issue RFQs to the manufacturer or authorised distributor. Origo takes no commission and is not party to the transaction.",
    points: ["RFQ and award tracking", "ERP export (Enterprise)", "Zero transaction fees"],
  },
];

export function WorkflowSection() {
  return (
    <section aria-labelledby="workflow-heading" className="border-b border-line bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          id="workflow-heading"
          eyebrow="How it works"
          title="Verify. Compare. Contract direct."
          description="A three-step workflow that replaces broker introductions with audited supplier data."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {steps.map(({ n, icon: Icon, title, body, points }) => (
            <li key={n} className="bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-3">{n}</span>
                <Icon aria-hidden className="size-5 text-emerald-400" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p>
              <ul className="mt-5 space-y-2 border-t border-line pt-4">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-ink-2">
                    <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-cyan-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------- Verification -------------------------------- */

const checks = [
  { icon: Landmark, label: "VAT number validated against VIES", key: "vies" as const },
  { icon: Fingerprint, label: "EORI number confirmed for customs", key: "eori" as const },
  { icon: Building2, label: "Trade-register extract matched to legal entity", key: "tradeRegister" as const },
  { icon: ScanSearch, label: "EU and UN consolidated sanctions screening, daily", key: "sanctions" as const },
  { icon: ClipboardCheck, label: "ISO / EU GMP / GDP certificates confirmed with issuer", key: "certificateAuthenticity" as const },
];

export function VerificationSection({ sample }: { sample: MatrixRow }) {
  const { supplier } = sample;
  return (
    <section id="verification" aria-labelledby="verification-heading" className="border-b border-line">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="verification-heading"
            eyebrow="Automated vendor verification"
            title="Only audited vendors. Brokers are excluded by policy."
            description="Listing requires a legal entity that manufactures, tests or holds stock. Pure intermediaries are rejected at onboarding; failed checks suspend a vendor from awards until resolved."
          />
          <ul className="mt-8 space-y-3">
            {checks.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-ink-2">
                <span className="grid size-8 place-items-center rounded-md border border-line bg-surface-2">
                  <Icon aria-hidden className="size-4 text-emerald-400" />
                </span>
                {label}
              </li>
            ))}
            <li className="flex items-center gap-3 text-sm text-ink-2">
              <span className="grid size-8 place-items-center rounded-md border border-line bg-surface-2">
                <Ban aria-hidden className="size-4 text-ink-3" />
              </span>
              No paid placement — vendors cannot buy ranking or visibility
            </li>
          </ul>
        </div>

        <article aria-label="Sample verification record" className="rounded-xl border border-line bg-surface">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-3">Verification record</p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{supplier.name}</h3>
            </div>
            <AuditBadge status={supplier.audit.status} score={supplier.audit.score} />
          </header>
          <dl className="grid grid-cols-2 gap-px bg-line text-xs">
            {[
              ["Vendor type", supplier.type],
              ["Country", supplier.country],
              ["Last audit", formatDate(supplier.audit.lastAudit)],
              ["Next audit", formatDate(supplier.audit.nextAudit)],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-5 py-3">
                <dt className="text-ink-3">{k}</dt>
                <dd className="mt-0.5 font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-line px-5 py-4">
            <p className="text-[11px] uppercase tracking-wider text-ink-3">Certificates on file</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {supplier.certifications.map((c) => (
                <Badge key={c} tone={c === "EU GMP" || c === "GDP" ? "cyan" : "neutral"}>
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <ul className="border-t border-line px-5 py-4">
            {checks.map(({ label, key }) => {
              const passed = supplier.audit.checks[key];
              return (
                <li key={key} className="flex items-center justify-between gap-3 py-1.5 text-xs">
                  <span className="text-ink-2">{label}</span>
                  <span className={passed ? "font-medium text-emerald-300" : "font-medium text-orange-300"}>
                    {passed ? "Passed" : "Failed"}
                  </span>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </section>
  );
}

/* ------------------------------------ FAQ ------------------------------------ */

const faqs = [
  {
    q: "Does Origo take a commission on orders?",
    a: "No. Revenue comes exclusively from buyer memberships. Origo is not party to the transaction, charges no transaction fees and accepts no vendor payments for placement.",
  },
  {
    q: "How is a vendor verified before listing?",
    a: "Each vendor passes VIES VAT validation, EORI confirmation, a trade-register match, sanctions screening and certificate confirmation with the issuing body. Vendors are re-audited annually and monitored continuously; a failed check suspends awards.",
  },
  {
    q: "How are broker markups measured?",
    a: "Broker medians are derived from intermediary quotes observed on member RFQs for identical specifications and pricing units, normalised to delivered EU cost. Spreads are reported against the best verified direct quote.",
  },
  {
    q: "Which payment methods are available for corporate accounts?",
    a: "SEPA Direct Debit and corporate cards on all plans; invoice and purchase-order billing (net 30) on Pro annual and Enterprise. VAT is handled automatically, including reverse charge for EU businesses.",
  },
  {
    q: "How quickly is the dashboard available?",
    a: "Immediately. The workspace unlocks in the browser as soon as the payment method is confirmed. There are no community servers, chat groups or manual onboarding calls.",
  },
  {
    q: "Where is data processed?",
    a: "In the EU (Frankfurt region). Origo acts as processor under a standard DPA; Enterprise agreements include audit rights and custom retention.",
  },
];

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="border-b border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading id="faq-heading" eyebrow="FAQ" title="Procurement, legal and finance questions." />
        <div className="divide-y divide-line rounded-xl border border-line bg-surface">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60">
                {q}
                <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------ CTA ------------------------------------ */

export function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h2 id="cta-heading" className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Replace broker quotes with verified factory rates.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-2">
          Activate a workspace in minutes. SEPA, corporate card or invoice. Access is immediate.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/access" size="lg">
            Activate workspace
            <ArrowRight aria-hidden />
          </ButtonLink>
          <ButtonLink href="/dashboard" size="lg" variant="secondary">
            Explore the demo dashboard
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
