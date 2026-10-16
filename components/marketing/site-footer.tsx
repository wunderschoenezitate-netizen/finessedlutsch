import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "@/components/ui/logo";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/matrix", label: "Comparison Matrix" },
      { href: "/#analyzer", label: "Price Spread Analyzer" },
      { href: "/#roi", label: "ROI model" },
      { href: "/#verification", label: "Vendor verification" },
    ],
  },
  {
    title: "Membership",
    links: [
      { href: "/#pricing", label: "Plans & pricing" },
      { href: "/access", label: "Activate a workspace" },
      { href: "/dashboard", label: "Member dashboard" },
      { href: "/dashboard/billing", label: "Billing & invoices" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-sm font-semibold">{site.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-3">{site.description}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-2 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Compliance</h2>
          <ul className="mt-3 space-y-2 text-xs text-ink-3">
            <li>GDPR-compliant processing, EU data residency (Frankfurt)</li>
            <li>No transaction fees, no commissions from vendors</li>
            <li>Card and SEPA data handled by a PCI DSS Level 1 provider</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[11px] text-ink-3 sm:px-6">
          <span>
            © 2026 {site.legalName} · {site.registeredOffice}
          </span>
          <a href={`mailto:${site.contactEmail}`} className="hover:text-ink">
            {site.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
