"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Segmented control (single choice) ---------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-md border border-line-strong bg-surface-2 p-0.5", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded px-3 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
              size === "sm" ? "h-7 text-xs" : "h-8 text-sm",
              active ? "bg-zinc-700/70 text-ink shadow-sm" : "text-ink-3 hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Toggle chip (multi choice) ---------- */

export function ToggleChip({
  pressed,
  onToggle,
  children,
  count,
}: {
  pressed: boolean;
  onToggle: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        pressed
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
          : "border-line-strong bg-surface-2 text-ink-2 hover:border-zinc-600 hover:text-ink",
      )}
    >
      {pressed ? <Check aria-hidden className="size-3" strokeWidth={3} /> : null}
      {children}
      {count !== undefined ? <span className="tabular-nums text-ink-3">{count}</span> : null}
    </button>
  );
}

/* ---------- Switch ---------- */

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <span id={`${id}-label`} className="block text-xs font-medium text-ink-2">
          {label}
        </span>
        {description ? <span className="mt-0.5 block text-[11px] text-ink-3">{description}</span> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
          checked ? "border-emerald-500 bg-emerald-500" : "border-line-strong bg-surface-3",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 size-3.5 rounded-full bg-white transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

/* ---------- Range slider with live output ---------- */

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
  minLabel,
  maxLabel,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Formatted value shown next to the label and announced to assistive tech */
  display: string;
  minLabel?: string;
  maxLabel?: string;
  hint?: string;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-ink-2">
          {label}
        </label>
        <output htmlFor={id} className="text-sm font-semibold tabular-nums text-ink">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-1"
        style={{ "--range-fill": `${fill}%` } as CSSProperties}
      />
      {minLabel || maxLabel ? (
        <div className="flex justify-between text-[11px] tabular-nums text-ink-3">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}
      {hint ? <p className="mt-1 text-[11px] text-ink-3">{hint}</p> : null}
    </div>
  );
}
