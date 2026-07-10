import type { BenchmarkMetric, BenchmarkMetricDefinition, Destination } from "@/lib/types";
import { randRange, seededRandom } from "@/lib/mock-data/random";

export const BENCHMARK_METRIC_DEFINITIONS: BenchmarkMetricDefinition[] = [
  {
    id: "visitor-growth",
    name: "Visitor Growth (YoY)",
    unit: "%",
    direction: "higher-is-better",
    description: "Year-over-year change in total visitor arrivals.",
  },
  {
    id: "segment-strength",
    name: "Segment Strength Index",
    unit: "index",
    direction: "higher-is-better",
    description: "Composite strength of the destination's top-performing tourism segments.",
  },
  {
    id: "price-positioning",
    name: "Price Positioning Index",
    unit: "index",
    direction: "higher-is-better",
    description: "Relative premium/luxury pricing power versus regional peers.",
  },
  {
    id: "sentiment-score",
    name: "Traveler Sentiment Score",
    unit: "index",
    direction: "higher-is-better",
    description: "Net sentiment across reviews, social mentions, and press coverage.",
  },
  {
    id: "digital-demand",
    name: "Digital Search Demand Index",
    unit: "index",
    direction: "higher-is-better",
    description: "Relative search interest for the destination versus its regional set.",
  },
  {
    id: "repeat-visitor-rate",
    name: "Repeat Visitor Rate",
    unit: "%",
    direction: "higher-is-better",
    description: "Share of visitors who have traveled to the destination before.",
  },
];

const METRIC_RANGES: Record<string, [number, number]> = {
  "visitor-growth": [-6, 26],
  "segment-strength": [38, 96],
  "price-positioning": [28, 92],
  "sentiment-score": [45, 96],
  "digital-demand": [28, 96],
  "repeat-visitor-rate": [12, 58],
};

export function getBenchmarkMetricsForDestination(destination: Destination): BenchmarkMetric[] {
  return BENCHMARK_METRIC_DEFINITIONS.map((def) => {
    const rng = seededRandom(`${destination.id}::benchmark::${def.id}`);
    const [min, max] = METRIC_RANGES[def.id];
    const rawValue = randRange(rng, min, max);
    const value = def.unit === "%" ? Math.round(rawValue * 10) / 10 : Math.round(rawValue);
    return { destinationId: destination.id, metricId: def.id, value };
  });
}
