// Core domain types for the Tourism Market Intelligence tool.
//
// This is the schema locked in Part C, step 1 of the build brief: the four
// product-category metric matrices (Part A.3) plus the shared Opportunity /
// Risk / Benchmark / Regulatory shapes every category's UI renders against.
// Only Events (A.3 §1) is fully implemented end-to-end in this pass — the
// other three categories' metric interfaces are defined here so the schema
// is ready, but have no mock generator or dashboard yet (see CATEGORIES
// below, `available: false`).

export type DestinationId = "dubai" | "abu-dhabi";

export interface DestinationInfo {
  id: DestinationId;
  name: string;
}

export const DESTINATIONS: DestinationInfo[] = [
  { id: "dubai", name: "Dubai" },
  { id: "abu-dhabi", name: "Abu Dhabi" },
];

export type CategoryId = "events" | "attractions" | "accommodation" | "mice";

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  tagline: string;
  available: boolean;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "events", name: "Events", tagline: "Festivals, sport, culture, trade", available: true },
  { id: "attractions", name: "Attractions", tagline: "Footfall, dwell, repeat visitation", available: false },
  { id: "accommodation", name: "Accommodation", tagline: "ADR, RevPAR, supply pipeline", available: false },
  { id: "mice", name: "MICE", tagline: "Meetings, incentives, conferences", available: false },
];

export type TrendDirection = "rising" | "peaking" | "declining";

// ---- Opportunity / Risk (shared shape across all categories) -------------

export interface ScoreComponent {
  label: string;
  weightPct: number;
  /** 0-100 component score, already in the direction where higher = more of this factor. */
  score: number;
}

export interface OpportunityResult {
  score: number;
  breakdown: ScoreComponent[];
}

export interface RiskResult {
  score: number;
  breakdown: ScoreComponent[];
}

// ---- Events (A.3 §1 — fully implemented) ----------------------------------

export interface EventRecord {
  id: string;
  destination: DestinationId;
  name: string;
  segment: string;
  dateLabel: string;
  trendDirection: TrendDirection;

  // Demand / opportunity-driving signals
  buzzVelocity: number;
  ticketSellThroughRate: number;
  bookingLeadTimeDays: number;
  calendarWhiteSpace: number;
  venueCapacityUtilization: number;
  sentimentScore: number;
  hotelOccupancyLiftPct: number;
  repeatAttendeeRatio: number;
  sponsorshipSignal: number;

  // Risk-driving signals
  cannibalizationExposure: number;
  regulatoryExposure: number;
  sentimentVolatility: number;

  buzzHistory: number[];
  whySummary: string;
}

export const EVENTS_OPPORTUNITY_WEIGHTS = {
  demandVelocity: 40,
  calendarWhiteSpace: 25,
  capacityHeadroom: 20,
  sentiment: 15,
} as const;

export const EVENTS_RISK_WEIGHTS = {
  oversupplyClash: 35,
  cannibalization: 25,
  regulatory: 20,
  sentimentVolatility: 20,
} as const;

// ---- Attractions (A.3 §2 — schema locked, not yet implemented) -----------

export interface AttractionMetrics {
  id: string;
  destination: DestinationId;
  name: string;
  footfallTrendPct: number;
  averageDwellTimeMinutes: number;
  reviewSentimentTrend: number;
  repeatVisitationRate: number;
  pricePositioningIndex: number;
  capacityUtilization: number;
  assetAgeYears: number;
  crossSellRate: number;
}

export const ATTRACTIONS_OPPORTUNITY_WEIGHTS = {
  footfallTrend: 35,
  sentiment: 25,
  capacityHeadroom: 20,
  pricingHeadroom: 20,
} as const;

// ---- Accommodation (A.3 §3 — schema locked, not yet implemented) --------

export interface AccommodationMetrics {
  id: string;
  destination: DestinationId;
  name: string;
  adrTrendPct: number;
  occupancyTrendPct: number;
  revPAR: number;
  newSupplyPipelineRooms: number;
  segmentGapIndex: number;
  bookingWindowDays: number;
  channelMixDirectPct: number;
  guestSentimentTrend: number;
}

export const ACCOMMODATION_OPPORTUNITY_WEIGHTS = {
  supplyDemandGap: 35,
  revPARTrend: 30,
  pipelineSaturationRiskInverse: 20,
  sentiment: 15,
} as const;

// ---- MICE (A.3 §4 — schema locked, not yet implemented) ------------------

export interface MiceMetrics {
  id: string;
  destination: DestinationId;
  name: string;
  venueUtilizationRate: number;
  confirmedPipelineValue: number;
  prospectivePipelineValue: number;
  bookingLeadTimeDays: number;
  delegateSpendPerEvent: number;
  repeatClientRotationRate: number;
  competitiveWinRatePct: number;
  incentiveTravelVolume: number;
}

export const MICE_OPPORTUNITY_WEIGHTS = {
  pipelineGrowth: 35,
  capacityHeadroom: 25,
  competitiveWinRate: 25,
  delegateSpendTrend: 15,
} as const;

// ---- Benchmarking -----------------------------------------------------

export type BenchmarkPosition = "leads" | "lags" | "matches";

export interface BenchmarkMetricRow {
  label: string;
  unit: "%" | "index" | "days" | "count";
  focusValue: number;
  comparableValues: { name: string; value: number }[];
  position: BenchmarkPosition;
}

// ---- Regulatory Pulse ---------------------------------------------------

export type RegulatoryImpact = "positive" | "neutral" | "negative";

export interface RegulatoryItem {
  id: string;
  destination: DestinationId;
  categories: CategoryId[];
  title: string;
  summary: string;
  dateLabel: string;
  impact: RegulatoryImpact;
}

// ---- Scenario Simulator ---------------------------------------------------

export interface EventScenarioAdjustments {
  ticketPriceChangePct: number;
  dateShiftWeeks: number;
  capacityChangePct: number;
  competingEventAnnounced: boolean;
}

export const DEFAULT_SCENARIO_ADJUSTMENTS: EventScenarioAdjustments = {
  ticketPriceChangePct: 0,
  dateShiftWeeks: 0,
  capacityChangePct: 0,
  competingEventAnnounced: false,
};

// ---- Insight Report ---------------------------------------------------

export interface InsightReport {
  executiveSummary: string;
  keyFindings: string[];
  opportunityRiskNote: string;
  benchmarkPosition: string;
  risksAndCaveats: string[];
  recommendation: string;
  disclaimer: string;
}
