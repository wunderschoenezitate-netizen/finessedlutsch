"use client";

import { useMemo, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import type { RegistryChecks, Supplier } from "@/lib/types";
import { countryNames } from "@/lib/geo";
import { formatDate } from "@/lib/format";
import { Segmented } from "@/components/ui/controls";
import { AuditBadge } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";

type View = "all" | "verified" | "reaudit_due";

const checkColumns: { key: keyof RegistryChecks; label: string; title: string }[] = [
  { key: "vies", label: "VIES", title: "VAT number validated against VIES" },
  { key: "eori", label: "EORI", title: "EORI number confirmed" },
  { key: "tradeRegister", label: "Register", title: "Trade-register extract matched" },
  { key: "sanctions", label: "Sanctions", title: "EU/UN sanctions screening" },
  { key: "certificateAuthenticity", label: "Certs", title: "Certificates confirmed with issuing body" },
];

export function VendorRegister({ suppliers }: { suppliers: Supplier[] }) {
  const [view, setView] = useState<View>("all");
  const visible = useMemo(
    () =>
      suppliers
        .filter((s) => view === "all" || s.audit.status === view)
        .sort((a, b) => a.audit.nextAudit.localeCompare(b.audit.nextAudit)),
    [suppliers, view],
  );
  const dueCount = suppliers.filter((s) => s.audit.status === "reaudit_due").length;

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Vendor register</h2>
          <p className="mt-0.5 text-xs text-ink-3">Sorted by next audit date</p>
        </div>
        <Segmented
          label="Filter by audit status"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: "all", label: `All ${suppliers.length}` },
            { value: "verified", label: "Verified" },
            { value: "reaudit_due", label: `Re-audit due ${dueCount}` },
          ]}
        />
      </div>
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[64rem] text-left text-xs">
          <caption className="sr-only">Registry checks and audit status per vendor</caption>
          <thead className="text-[11px] text-ink-3">
            <tr className="border-b border-line">
              <th scope="col" className="px-4 py-2 font-medium">Vendor</th>
              <th scope="col" className="px-3 py-2 font-medium">Certifications</th>
              <th scope="col" className="px-3 py-2 font-medium">Audit</th>
              <th scope="col" className="px-3 py-2 font-medium">Last audit</th>
              <th scope="col" className="px-3 py-2 font-medium">Next audit</th>
              {checkColumns.map((c) => (
                <th key={c.key} scope="col" title={c.title} className="px-2 py-2 text-center font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id} className="border-b border-line/60 last:border-b-0 hover:bg-white/[0.02]">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-ink">{s.name}</div>
                  <div className="text-[11px] text-ink-3">
                    {s.type} · {s.city}, {countryNames[s.country]} · est. {s.founded}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex max-w-[14rem] flex-wrap gap-1">
                    {s.certifications.map((c) => (
                      <Badge key={c} tone={c === "EU GMP" || c === "GDP" ? "cyan" : "neutral"}>
                        {c}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <AuditBadge status={s.audit.status} score={s.audit.score} />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-ink-2">{formatDate(s.audit.lastAudit)}</td>
                <td className={`whitespace-nowrap px-3 py-2.5 tabular-nums ${s.audit.status === "reaudit_due" ? "font-medium text-amber-300" : "text-ink-2"}`}>
                  {formatDate(s.audit.nextAudit)}
                </td>
                {checkColumns.map((c) => (
                  <td key={c.key} className="px-2 py-2.5 text-center">
                    {s.audit.checks[c.key] ? (
                      <CircleCheck aria-label={`${c.title}: passed`} className="mx-auto size-4 text-emerald-400" />
                    ) : (
                      <CircleX aria-label={`${c.title}: failed`} className="mx-auto size-4 text-orange-400" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
