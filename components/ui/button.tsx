import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
  "disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
  secondary: "border border-line-strong bg-surface-2 text-ink hover:border-zinc-600 hover:bg-surface-3",
  ghost: "text-ink-2 hover:bg-surface-3 hover:text-ink",
  outline: "border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
  md: "h-9 px-4 text-sm [&_svg]:size-4",
  lg: "h-11 px-5 text-sm [&_svg]:size-4",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type StyleProps = { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
