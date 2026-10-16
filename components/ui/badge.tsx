import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "emerald" | "cyan" | "amber" | "orange" | "red" | "violet";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-surface-3 text-ink-2",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none [&_svg]:size-3",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
