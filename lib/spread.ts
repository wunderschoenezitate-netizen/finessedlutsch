import type { MatrixRow, Product } from "@/lib/types";

export type BuildUpSegmentKey = "factory" | "logistics" | "distributor" | "broker";

export interface BuildUpSegment {
  key: BuildUpSegmentKey;
  label: string;
  value: number;
}

export interface ChannelBuildUp {
  channel: "direct" | "distributor" | "broker";
  label: string;
  description: string;
  total: number;
  segments: BuildUpSegment[];
}

export const segmentLabels: Record<BuildUpSegmentKey, string> = {
  factory: "Factory rate (EXW)",
  logistics: "Freight, packaging & duty",
  distributor: "Distributor margin",
  broker: "Broker markup",
};

/** Fixed series order — colour follows the segment, never its rank. */
export const segmentColors: Record<BuildUpSegmentKey, string> = {
  factory: "var(--color-series-factory)",
  logistics: "var(--color-series-logistics)",
  distributor: "var(--color-series-distributor)",
  broker: "var(--color-series-broker)",
};

/** Price build-up per unit across the three procurement channels. */
export function channelBuildUp(product: Product): ChannelBuildUp[] {
  const { factory, directLanded, distributor, brokerMedian } = product.channel;
  const logistics = directLanded - factory;
  const direct: BuildUpSegment[] = [
    { key: "factory", label: segmentLabels.factory, value: factory },
    { key: "logistics", label: segmentLabels.logistics, value: logistics },
  ];
  const viaDistributor: BuildUpSegment[] = [
    ...direct,
    { key: "distributor", label: segmentLabels.distributor, value: distributor - directLanded },
  ];
  return [
    {
      channel: "direct",
      label: "Direct from manufacturer",
      description: "Verified OEM quote, delivered (DAP)",
      total: directLanded,
      segments: direct,
    },
    {
      channel: "distributor",
      label: "Authorised distributor",
      description: "Stocked by an audited EU distributor",
      total: distributor,
      segments: viaDistributor,
    },
    {
      channel: "broker",
      label: "Broker quote (median)",
      description: "Median of observed intermediary quotes",
      total: brokerMedian,
      // Brokers resell distributor stock, so their markup stacks on the distributor level.
      segments: [...viaDistributor, { key: "broker", label: segmentLabels.broker, value: brokerMedian - distributor }],
    },
  ];
}

export interface SpreadSummary {
  bestDirect: MatrixRow | undefined;
  brokerMedian: number;
  /** Broker median over best verified quote */
  spread: number;
  savingPerUnit: number;
}

export function summariseSpread(product: Product, rows: MatrixRow[]): SpreadSummary {
  const productRows = rows.filter((r) => r.product.id === product.id);
  const bestDirect = productRows.reduce<MatrixRow | undefined>(
    (best, r) => (!best || r.unitPrice < best.unitPrice ? r : best),
    undefined,
  );
  const brokerMedian = product.channel.brokerMedian;
  const bestPrice = bestDirect?.unitPrice ?? product.channel.directLanded;
  return {
    bestDirect,
    brokerMedian,
    spread: brokerMedian / bestPrice - 1,
    savingPerUnit: brokerMedian - bestPrice,
  };
}
