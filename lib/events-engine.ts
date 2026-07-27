// Pure Opportunity/Risk math for the Events category (Part A.3 §1 weights).
// The Scenario Simulator calls the exact same functions as the static
// dashboard — it only produces an adjusted EventRecord first, per the
// brief: "no separate model, just an interactive version of the same math."

import {
  EVENTS_OPPORTUNITY_WEIGHTS,
  EVENTS_RISK_WEIGHTS,
  type BenchmarkMetricRow,
  type BenchmarkPosition,
  type EventRecord,
  type EventScenarioAdjustments,
  type OpportunityResult,
  type RiskResult,
} from "@/lib/types";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function computeOpportunity(event: EventRecord): OpportunityResult {
  const demandVelocity = clamp(event.buzzVelocity * 0.5 + event.ticketSellThroughRate * 0.5);
  const calendarWhiteSpace = clamp(event.calendarWhiteSpace);
  const capacityHeadroom = clamp(100 - event.venueCapacityUtilization);
  const sentiment = clamp(event.sentimentScore);

  const w = EVENTS_OPPORTUNITY_WEIGHTS;
  const score = Math.round(
    (demandVelocity * w.demandVelocity +
      calendarWhiteSpace * w.calendarWhiteSpace +
      capacityHeadroom * w.capacityHeadroom +
      sentiment * w.sentiment) /
      100
  );

  return {
    score: clamp(score),
    breakdown: [
      { label: "Demand Velocity", weightPct: w.demandVelocity, score: Math.round(demandVelocity) },
      { label: "Calendar White Space", weightPct: w.calendarWhiteSpace, score: Math.round(calendarWhiteSpace) },
      { label: "Capacity Headroom", weightPct: w.capacityHeadroom, score: Math.round(capacityHeadroom) },
      { label: "Sentiment", weightPct: w.sentiment, score: Math.round(sentiment) },
    ],
  };
}

export function computeRisk(event: EventRecord): RiskResult {
  const oversupplyClash = clamp(100 - event.calendarWhiteSpace);
  const cannibalization = clamp(event.cannibalizationExposure);
  const regulatory = clamp(event.regulatoryExposure);
  const sentimentVolatility = clamp(event.sentimentVolatility);

  const w = EVENTS_RISK_WEIGHTS;
  const score = Math.round(
    (oversupplyClash * w.oversupplyClash +
      cannibalization * w.cannibalization +
      regulatory * w.regulatory +
      sentimentVolatility * w.sentimentVolatility) /
      100
  );

  return {
    score: clamp(score),
    breakdown: [
      { label: "Oversupply / Clash Risk", weightPct: w.oversupplyClash, score: Math.round(oversupplyClash) },
      { label: "Cannibalization Risk", weightPct: w.cannibalization, score: Math.round(cannibalization) },
      { label: "Regulatory Risk", weightPct: w.regulatory, score: Math.round(regulatory) },
      { label: "Sentiment Volatility", weightPct: w.sentimentVolatility, score: Math.round(sentimentVolatility) },
    ],
  };
}

/**
 * Applies Scenario Simulator adjustments to a base event, returning a new
 * EventRecord. Callers then run this through computeOpportunity/computeRisk
 * above — the same functions the static dashboard uses.
 */
export function applyScenario(event: EventRecord, adjustments: EventScenarioAdjustments): EventRecord {
  const { ticketPriceChangePct, dateShiftWeeks, capacityChangePct, competingEventAnnounced } = adjustments;

  const ticketSellThroughRate = clamp(event.ticketSellThroughRate - ticketPriceChangePct * 0.6);
  const sentimentScore = clamp(event.sentimentScore - Math.max(0, ticketPriceChangePct) * 0.2);
  const calendarWhiteSpace = clamp(
    event.calendarWhiteSpace - Math.abs(dateShiftWeeks) * 4 - (competingEventAnnounced ? 15 : 0)
  );
  const venueCapacityUtilization = clamp(event.venueCapacityUtilization - capacityChangePct * 0.5);
  const cannibalizationExposure = clamp(event.cannibalizationExposure + (competingEventAnnounced ? 25 : 0));

  return {
    ...event,
    ticketSellThroughRate,
    sentimentScore,
    calendarWhiteSpace,
    venueCapacityUtilization,
    cannibalizationExposure,
  };
}

interface BenchmarkMetricDef {
  label: string;
  unit: BenchmarkMetricRow["unit"];
  get: (e: EventRecord) => number;
}

const BENCHMARK_METRICS: BenchmarkMetricDef[] = [
  { label: "Buzz Velocity", unit: "index", get: (e) => e.buzzVelocity },
  { label: "Ticket Sell-Through Rate", unit: "%", get: (e) => e.ticketSellThroughRate },
  { label: "Venue Capacity Utilization", unit: "%", get: (e) => e.venueCapacityUtilization },
  { label: "Sentiment", unit: "index", get: (e) => e.sentimentScore },
  { label: "Hotel Occupancy Lift", unit: "%", get: (e) => e.hotelOccupancyLiftPct },
];

function positionFor(focusValue: number, comparableValues: number[]): BenchmarkPosition {
  if (comparableValues.length === 0) return "matches";
  const avg = comparableValues.reduce((a, b) => a + b, 0) / comparableValues.length;
  const delta = focusValue - avg;
  const threshold = Math.max(1, Math.abs(avg) * 0.05);
  if (delta > threshold) return "leads";
  if (delta < -threshold) return "lags";
  return "matches";
}

export function buildEventBenchmark(event: EventRecord, comparables: EventRecord[]): BenchmarkMetricRow[] {
  return BENCHMARK_METRICS.map((metric) => {
    const focusValue = Math.round(metric.get(event));
    const comparableValues = comparables.map((c) => ({
      name: c.name,
      value: Math.round(metric.get(c)),
    }));
    return {
      label: metric.label,
      unit: metric.unit,
      focusValue,
      comparableValues,
      position: positionFor(
        focusValue,
        comparableValues.map((c) => c.value)
      ),
    };
  });
}

export function buildBenchmarkTakeaway(event: EventRecord, rows: BenchmarkMetricRow[]): string {
  const leads = rows.filter((r) => r.position === "leads");
  const lags = rows.filter((r) => r.position === "lags");

  if (leads.length === 0 && lags.length === 0) {
    return `${event.name} tracks closely with comparable events across the benchmarked metrics — no standout lead or gap.`;
  }
  if (leads.length > 0 && lags.length > 0) {
    return `${event.name} leads comparable events on ${leads.length} of ${rows.length} metrics — most notably ${leads[0].label} — but lags on ${lags[0].label}.`;
  }
  if (leads.length > 0) {
    return `${event.name} leads comparable events on ${leads.length} of ${rows.length} benchmarked metrics, most notably ${leads[0].label}, with no significant gaps.`;
  }
  return `${event.name} is behind comparable events on ${lags.length} of ${rows.length} benchmarked metrics, most notably ${lags[0].label}.`;
}
