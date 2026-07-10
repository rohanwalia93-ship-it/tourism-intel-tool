// Core domain types for the Tourism Market Intelligence Tool.
//
// These types are the contract between the data layer (currently backed by
// deterministic mock generators in `lib/mock-data/`) and the UI. When real
// data sources (Google Trends, booking APIs, social listening, tourism board
// stats) are wired in, only the functions in `lib/data.ts` need to change —
// every type below, and every component that consumes it, stays the same.

export type Region =
  | "Middle East"
  | "Southeast Asia"
  | "Mediterranean"
  | "North Africa"
  | "Caribbean & Americas";

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: Region;
  blurb: string;
  /** True for destinations typed in free-form by a client, not in the curated catalog. */
  isCustom?: boolean;
}

export type TrendDirection = "rising" | "peaking" | "declining";

export interface Segment {
  id: string;
  destinationId: string;
  segmentKey: string;
  name: string;
  trendDirection: TrendDirection;
  /** Year-over-year search interest growth, percent. */
  searchGrowthPct: number;
  /** Relative booking-volume index over the last 8 periods, for sparklines. */
  bookingVolumeTrend: number[];
  /** Social mention volume over the last 30 days (count). */
  socialMentionVolume: number;
  whySummary: string;
}

export interface NicheScoreBreakdown {
  /** 0-100, growth in demand signals (search, bookings, mentions). */
  demandGrowth: number;
  /** 0-100, how crowded the competitive supply is (higher = more saturated). */
  competitiveSaturation: number;
  /** 0-100, net sentiment of traveler/press conversation. */
  sentiment: number;
}

export interface NicheScore {
  destinationId: string;
  destinationName: string;
  /** Display-cased version of the niche the client searched for. */
  niche: string;
  /** Composite 0-100 opportunity score. */
  score: number;
  breakdown: NicheScoreBreakdown;
  whyNow: string;
}

export type MetricDirection = "higher-is-better" | "lower-is-better";

export interface BenchmarkMetricDefinition {
  id: string;
  name: string;
  unit: "%" | "index" | "$";
  direction: MetricDirection;
  description: string;
}

export interface BenchmarkMetric {
  destinationId: string;
  metricId: string;
  value: number;
}

export type BenchmarkPosition = "leads" | "lags" | "matches";
