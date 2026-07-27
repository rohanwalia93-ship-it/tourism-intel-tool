// Insight Report generator.
//
// The build brief calls for an LLM call here ("existing Claude integration
// ... one prompt template per category"). This implementation is a
// deterministic, data-driven template instead — every sentence is composed
// directly from the same Opportunity/Risk/Benchmark data the dashboard
// renders, so the report never contradicts the numbers next to it. This is
// the swap point: replace `buildInsightReport` with a call to the Claude API
// (Messages API, one system prompt per category) passing the same
// event/opportunity/risk/benchmark/regulatory payload as context, and keep
// this function's signature so the report page doesn't need to change.

import type {
  BenchmarkMetricRow,
  EventRecord,
  InsightReport,
  OpportunityResult,
  RegulatoryItem,
  RiskResult,
} from "@/lib/types";

const STANDING_DISCLAIMER = "For strategic planning purposes — validate before investment decisions.";

type Quadrant = "high-opp-low-risk" | "high-opp-high-risk" | "low-opp-low-risk" | "low-opp-high-risk";

function classifyQuadrant(opportunity: number, risk: number): Quadrant {
  const highOpp = opportunity >= 50;
  const highRisk = risk >= 50;
  if (highOpp && !highRisk) return "high-opp-low-risk";
  if (highOpp && highRisk) return "high-opp-high-risk";
  if (!highOpp && highRisk) return "low-opp-high-risk";
  return "low-opp-low-risk";
}

const QUADRANT_COPY: Record<Quadrant, { note: string; recommendation: string }> = {
  "high-opp-low-risk": {
    note: "This sits in the strongest quadrant on the dial: demand and positioning signals are favorable, and downside exposure is currently limited.",
    recommendation: "Recommend prioritizing this opportunity, pending validation of live demand data.",
  },
  "high-opp-high-risk": {
    note: "Demand signals are strong, but so is downside exposure — this is a high-conviction, high-variance position on the dial.",
    recommendation: "Recommend a phased or hedged approach that captures upside while limiting exposure to the specific risk drivers below.",
  },
  "low-opp-high-risk": {
    note: "Demand signals are soft while downside exposure is elevated — the weakest quadrant on the dial.",
    recommendation: "Recommend deprioritizing versus higher-scoring opportunities in the current set.",
  },
  "low-opp-low-risk": {
    note: "Demand signals are modest but downside exposure is contained — a lower-conviction, lower-variance position.",
    recommendation: "Recommend monitoring rather than committing capital until demand signals strengthen.",
  },
};

function topComponent(components: OpportunityResult["breakdown"]) {
  return [...components].sort((a, b) => b.score - a.score)[0];
}

export function buildInsightReport(
  destinationName: string,
  event: EventRecord,
  opportunity: OpportunityResult,
  risk: RiskResult,
  benchmarkRows: BenchmarkMetricRow[],
  benchmarkTakeaway: string,
  regulatoryItems: RegulatoryItem[]
): InsightReport {
  const quadrant = classifyQuadrant(opportunity.score, risk.score);
  const quadrantCopy = QUADRANT_COPY[quadrant];
  const topOpportunityDriver = topComponent(opportunity.breakdown);
  const topRiskDriver = topComponent(risk.breakdown);

  const executiveSummary = `${event.name} in ${destinationName} scores ${opportunity.score} on Opportunity and ${risk.score} on Risk. ${quadrantCopy.note}`;

  const keyFindings: string[] = [
    `${topOpportunityDriver.label} is the strongest opportunity driver at ${topOpportunityDriver.score}/100.`,
    `${topRiskDriver.label} is the largest risk driver at ${topRiskDriver.score}/100.`,
    `Buzz velocity currently reads ${event.buzzVelocity}/100 with a ${event.trendDirection} trend.`,
    `Hotel occupancy lift during the event window is estimated at +${event.hotelOccupancyLiftPct} percentage points.`,
  ];

  const risksAndCaveats: string[] = risk.breakdown
    .filter((r) => r.score >= 45)
    .map((r) => `${r.label} is elevated (${r.score}/100) and should be monitored.`);
  risksAndCaveats.push("All figures are illustrative mock data pending connection to live sources — validate before acting.");

  const regulatoryHeadwinds = regulatoryItems.filter((r) => r.impact === "negative");
  if (regulatoryHeadwinds.length > 0) {
    risksAndCaveats.push(`Regulatory headwind on file: ${regulatoryHeadwinds[0].title}.`);
  }

  return {
    executiveSummary,
    keyFindings,
    opportunityRiskNote: quadrantCopy.note,
    benchmarkPosition: benchmarkTakeaway,
    risksAndCaveats,
    recommendation: quadrantCopy.recommendation,
    disclaimer: STANDING_DISCLAIMER,
  };
}
