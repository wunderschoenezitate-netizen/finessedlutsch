/**
 * Savings model for the ROI calculator.
 *
 * If a broker quote sits at direct landed cost × (1 + m), the avoidable share of every
 * euro spent through brokers is m / (1 + m). Only the addressable share of spend
 * (SKUs available from verified direct sources) is counted.
 */
export interface RoiInput {
  /** Annual spend currently routed through brokers / intermediaries (EUR) */
  intermediatedSpend: number;
  /** Average broker markup over direct landed cost, e.g. 0.28 */
  brokerMarkup: number;
  /** Share of that spend available from verified direct sources, e.g. 0.65 */
  addressableShare: number;
  /** Annual platform subscription cost (EUR) */
  subscriptionCost: number;
}

export interface RoiResult {
  addressableSpend: number;
  nonAddressableSpend: number;
  directCost: number;
  avoidableMarkup: number;
  netSavings: number;
  /** Net savings ÷ subscription cost */
  roiMultiple: number;
  paybackDays: number;
}

export function computeRoi({ intermediatedSpend, brokerMarkup, addressableShare, subscriptionCost }: RoiInput): RoiResult {
  const addressableSpend = intermediatedSpend * addressableShare;
  const avoidableMarkup = addressableSpend * (brokerMarkup / (1 + brokerMarkup));
  const directCost = addressableSpend - avoidableMarkup;
  const netSavings = avoidableMarkup - subscriptionCost;
  const dailySavings = avoidableMarkup / 365;
  return {
    addressableSpend,
    nonAddressableSpend: intermediatedSpend - addressableSpend,
    directCost,
    avoidableMarkup,
    netSavings,
    roiMultiple: subscriptionCost > 0 ? netSavings / subscriptionCost : 0,
    paybackDays: dailySavings > 0 ? Math.ceil(subscriptionCost / dailySavings) : Infinity,
  };
}

/* Logarithmic mapping for the spend slider: 0–1000 → €100K–€50M, rounded to 2 significant figures. */
export const SPEND_MIN = 100_000;
export const SPEND_MAX = 50_000_000;
export const SPEND_STEPS = 1000;

export function spendFromPosition(position: number) {
  const raw = SPEND_MIN * Math.pow(SPEND_MAX / SPEND_MIN, position / SPEND_STEPS);
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / magnitude) * magnitude;
}

export function positionFromSpend(spend: number) {
  return Math.round((Math.log(spend / SPEND_MIN) / Math.log(SPEND_MAX / SPEND_MIN)) * SPEND_STEPS);
}
