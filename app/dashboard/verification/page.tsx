import type { Metadata } from "next";
import { suppliers } from "@/lib/data/suppliers";
import { PageHeader } from "@/components/dashboard/primitives";
import { VendorRegister } from "@/components/dashboard/vendor-register";

export const metadata: Metadata = { title: "Vendor Verification" };

export default function VerificationPage() {
  const total = suppliers.length;
  const due = suppliers.filter((s) => s.audit.status === "reaudit_due").length;
  const failedChecks = suppliers.reduce((n, s) => n + Object.values(s.audit.checks).filter((ok) => !ok).length, 0);
  const gmpGdp = suppliers.filter((s) => s.certifications.some((c) => c === "EU GMP" || c === "GDP")).length;
  const avgScore = Math.round(suppliers.reduce((n, s) => n + s.audit.score, 0) / total);

  const tiles = [
    { label: "Vendors monitored", value: String(total), note: "Continuous registry sync" },
    { label: "Average audit score", value: String(avgScore), note: "Scale 0–100" },
    { label: "Re-audits due", value: String(due), note: "Awards remain open until due date" },
    { label: "Failed registry checks", value: String(failedChecks), note: "Awards blocked until resolved" },
    { label: "EU GMP / GDP holders", value: String(gmpGdp), note: "Pharma-grade supply chain" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Vendor Verification"
        description="Automated KYB and certificate monitoring for every vendor in the network. Checks run daily; certificates are confirmed with the issuing body."
      />
      <section aria-label="Verification summary" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-line bg-surface p-4">
            <p className="text-xs text-ink-3">{t.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{t.value}</p>
            <p className="mt-1 text-[11px] text-ink-3">{t.note}</p>
          </div>
        ))}
      </section>
      <VendorRegister suppliers={suppliers} />
    </div>
  );
}
