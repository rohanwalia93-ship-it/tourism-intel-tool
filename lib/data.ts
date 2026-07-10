// Public data-layer API.
//
// Every UI component in this app imports from HERE, not from the files in
// `lib/mock-data/` directly. That indirection is the whole point: when real
// data sources are ready (Google Trends, booking-platform APIs, social
// listening, tourism board statistics), swap the implementations in this
// file for real fetches — the function signatures and return types
// (`lib/types.ts`) can stay the same, so no UI code needs to change.
//
// Every function here is written as `async` even though the mock
// implementations are synchronous, so callers already treat them as
// potentially-remote calls.

import type {
  BenchmarkMetric,
  BenchmarkMetricDefinition,
  BenchmarkPosition,
  Destination,
  NicheScore,
  Segment,
} from "@/lib/types";
import {
  DESTINATIONS,
  findDestinationById,
  searchDestinations,
  suggestCompetitors as suggestCompetitorsForDestination,
} from "@/lib/mock-data/destinations";
import { getSegmentsForDestination } from "@/lib/mock-data/segments";
import { getKnownNicheSuggestions, getNicheScore as computeNicheScore } from "@/lib/mock-data/niche-scores";
import {
  BENCHMARK_METRIC_DEFINITIONS,
  getBenchmarkMetricsForDestination,
} from "@/lib/mock-data/benchmarks";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---- Destinations -----------------------------------------------------

export async function listDestinations(): Promise<Destination[]> {
  return DESTINATIONS;
}

export async function searchDestinationSuggestions(query: string): Promise<Destination[]> {
  return searchDestinations(query);
}

/**
 * Resolves a client-entered destination name to a `Destination`. Known
 * catalog entries are matched by id or name; anything else becomes a
 * synthetic "custom" destination so the tool never hardcodes a city list —
 * every generator below (segments, niche scores, benchmarks) works for any
 * destination id.
 */
export async function resolveDestination(input: string): Promise<Destination | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const byId = findDestinationById(trimmed);
  if (byId) return byId;

  const byName = DESTINATIONS.find((d) => d.name.toLowerCase() === trimmed.toLowerCase());
  if (byName) return byName;

  return {
    id: slugify(trimmed),
    name: trimmed,
    country: "Unspecified",
    region: "Middle East",
    blurb: "Custom destination — comparisons use generated market signals.",
    isCustom: true,
  };
}

export async function suggestCompetitors(
  destination: Destination,
  count = 3
): Promise<Destination[]> {
  return suggestCompetitorsForDestination(destination, count);
}

// ---- Trend Radar --------------------------------------------------------

export async function getTrendRadar(destination: Destination): Promise<Segment[]> {
  return getSegmentsForDestination(destination);
}

// ---- Opportunity Score ---------------------------------------------------

export async function getOpportunityScore(
  destination: Destination,
  niche: string
): Promise<NicheScore> {
  return computeNicheScore(destination, niche);
}

export async function getOpportunityScoreComparison(
  destination: Destination,
  competitors: Destination[],
  niche: string
): Promise<{ destination: NicheScore; competitors: NicheScore[] }> {
  return {
    destination: computeNicheScore(destination, niche),
    competitors: competitors.map((c) => computeNicheScore(c, niche)),
  };
}

export async function listKnownNiches(): Promise<string[]> {
  return getKnownNicheSuggestions();
}

// ---- Benchmarking ---------------------------------------------------------

export interface BenchmarkRow {
  definition: BenchmarkMetricDefinition;
  clientValue: number;
  competitorValues: { destination: Destination; value: number }[];
  position: BenchmarkPosition;
}

function positionFor(
  clientValue: number,
  competitorValues: number[],
  direction: BenchmarkMetricDefinition["direction"]
): BenchmarkPosition {
  if (competitorValues.length === 0) return "matches";
  const avg = competitorValues.reduce((a, b) => a + b, 0) / competitorValues.length;
  const delta = direction === "higher-is-better" ? clientValue - avg : avg - clientValue;
  const threshold = Math.max(1, Math.abs(avg) * 0.05);
  if (delta > threshold) return "leads";
  if (delta < -threshold) return "lags";
  return "matches";
}

export async function getBenchmarkComparison(
  destination: Destination,
  competitors: Destination[]
): Promise<BenchmarkRow[]> {
  const clientMetrics = getBenchmarkMetricsForDestination(destination);
  const competitorMetricSets = competitors.map((c) => ({
    destination: c,
    metrics: getBenchmarkMetricsForDestination(c),
  }));

  return BENCHMARK_METRIC_DEFINITIONS.map((definition) => {
    const clientValue =
      clientMetrics.find((m: BenchmarkMetric) => m.metricId === definition.id)?.value ?? 0;
    const competitorValues = competitorMetricSets.map((set) => ({
      destination: set.destination,
      value: set.metrics.find((m) => m.metricId === definition.id)?.value ?? 0,
    }));

    return {
      definition,
      clientValue,
      competitorValues,
      position: positionFor(
        clientValue,
        competitorValues.map((c) => c.value),
        definition.direction
      ),
    };
  });
}

export function buildBenchmarkTakeaway(
  destination: Destination,
  rows: BenchmarkRow[]
): string {
  const leads = rows.filter((r) => r.position === "leads");
  const lags = rows.filter((r) => r.position === "lags");

  if (leads.length === 0 && lags.length === 0) {
    return `${destination.name} tracks closely with its regional set across the benchmarked metrics — no single area stands out as a clear lead or gap.`;
  }

  const topLead = leads[0]?.definition.name;
  const topLag = lags[0]?.definition.name;

  if (leads.length > 0 && lags.length > 0) {
    return `${destination.name} leads its regional set on ${leads.length} of ${rows.length} metrics — most notably ${topLead} — but lags on ${topLag}, pointing to a clear focus area for the coming season.`;
  }

  if (leads.length > 0) {
    return `${destination.name} leads its regional set on ${leads.length} of ${rows.length} benchmarked metrics, most notably ${topLead}, with no significant gaps identified.`;
  }

  return `${destination.name} is behind its regional set on ${lags.length} of ${rows.length} benchmarked metrics, most notably ${topLag} — a priority area versus comparable destinations.`;
}
