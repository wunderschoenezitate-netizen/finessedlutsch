const LOCALE = "en-IE";

const eurCache = new Map<string, Intl.NumberFormat>();

function eurFormatter(minimumFractionDigits: number, maximumFractionDigits: number, compact: boolean) {
  const key = `${minimumFractionDigits}-${maximumFractionDigits}-${compact}`;
  let f = eurCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits,
      maximumFractionDigits,
      notation: compact ? "compact" : "standard",
    });
    eurCache.set(key, f);
  }
  return f;
}

/** €1,234.56 — unit prices keep cents; large totals drop them. */
export function formatEUR(value: number, opts: { compact?: boolean; decimals?: number } = {}) {
  const { compact = false } = opts;
  const decimals = opts.decimals ?? (compact ? 1 : Math.abs(value) >= 10_000 ? 0 : 2);
  return eurFormatter(compact ? 0 : decimals, decimals, compact).format(value);
}

const numberFormatter = new Intl.NumberFormat(LOCALE);
const compactFormatter = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

export function formatNumber(value: number, opts: { compact?: boolean } = {}) {
  return opts.compact ? compactFormatter.format(value) : numberFormatter.format(value);
}

/** 0.314 → "31.4%" */
export function formatPct(ratio: number, opts: { decimals?: number; signed?: boolean } = {}) {
  const { decimals = 1, signed = false } = opts;
  const pct = (ratio * 100).toFixed(decimals);
  return `${signed && ratio > 0 ? "+" : ""}${pct}%`;
}

export function formatDays(days: number) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function formatRelativeMinutes(minutes: number) {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ago`;
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

/** "2026-06-12" → "12 Jun 2026" (UTC, so server and client agree). */
export function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}
