import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { AuditStatus } from "@/lib/types";
import type { AlertSeverity } from "@/lib/data/dashboard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* Status colours are reserved for state and always ship with an icon and a label. */

const severityConfig: Record<AlertSeverity, { label: string; icon: typeof Info; className: string }> = {
  good: { label: "Opportunity", icon: CircleCheck, className: "text-emerald-400" },
  info: { label: "Update", icon: Info, className: "text-cyan-400" },
  warning: { label: "Action due", icon: TriangleAlert, className: "text-amber-400" },
  serious: { label: "Blocked", icon: CircleAlert, className: "text-orange-400" },
};

export function SeverityIcon({ severity, className }: { severity: AlertSeverity; className?: string }) {
  const { icon: Icon, className: tone, label } = severityConfig[severity];
  return <Icon aria-label={label} className={cn("size-4 shrink-0", tone, className)} />;
}

export function severityLabel(severity: AlertSeverity) {
  return severityConfig[severity].label;
}

export function AuditBadge({ status, score }: { status: AuditStatus; score?: number }) {
  if (status === "verified") {
    return (
      <Badge tone="emerald">
        <CircleCheck aria-hidden />
        Verified{score !== undefined ? <span className="tabular-nums text-emerald-200/80"> · {score}</span> : null}
      </Badge>
    );
  }
  return (
    <Badge tone="amber">
      <TriangleAlert aria-hidden />
      Re-audit due{score !== undefined ? <span className="tabular-nums text-amber-200/80"> · {score}</span> : null}
    </Badge>
  );
}
