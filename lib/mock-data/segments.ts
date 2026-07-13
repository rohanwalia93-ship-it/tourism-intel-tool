import type { Destination, Segment, TrendDirection } from "@/lib/types";
import { randInt, randRange, seededRandom } from "@/lib/mock-data/random";

interface SegmentDefinition {
  key: string;
  name: string;
  whyTemplate: (destinationName: string) => string;
}

// Fixed catalog of tourism segments tracked for every destination. Real
// integrations (Google Trends categories, booking-platform taxonomies,
// social-listening topics) would map onto these same segment keys.
export const SEGMENT_CATALOG: SegmentDefinition[] = [
  {
    key: "heritage-culture",
    name: "Heritage & Culture",
    whyTemplate: (name) =>
      `${name}'s heritage sites are seeing renewed interest as travelers trade generic sightseeing for authentic cultural immersion.`,
  },
  {
    key: "desert-eco",
    name: "Desert & Eco Experiences",
    whyTemplate: (name) =>
      `Eco-conscious travelers are driving demand for desert and nature-based experiences around ${name}, helped by new sustainable operators.`,
  },
  {
    key: "major-events",
    name: "Major-Event Tourism",
    whyTemplate: (name) =>
      `A packed calendar of major events is pulling visitor spikes into ${name}, with search interest surging around announced dates.`,
  },
  {
    key: "luxury-wellness",
    name: "Luxury & Wellness",
    whyTemplate: (name) =>
      `High-net-worth travelers are prioritizing wellness retreats and spa-led stays when choosing ${name} over competing destinations.`,
  },
  {
    key: "family-waterpark",
    name: "Family & Waterpark",
    whyTemplate: (name) =>
      `Family travel budgets are shifting toward all-in-one resort and waterpark experiences in ${name}.`,
  },
  {
    key: "adventure-outdoor",
    name: "Adventure & Outdoor",
    whyTemplate: (name) =>
      `Adventure tourism is accelerating in ${name} as operators expand outdoor and adrenaline-driven itineraries.`,
  },
  {
    key: "culinary",
    name: "Culinary & Gastronomy",
    whyTemplate: (name) =>
      `Food-led travel is on the rise, with ${name}'s culinary scene gaining traction across social and search platforms.`,
  },
  {
    key: "coastal-marine",
    name: "Coastal & Marine",
    whyTemplate: (name) =>
      `Coastal and marine experiences remain a core draw for ${name}, though demand growth is maturing as supply catches up.`,
  },
];

function classifyTrend(growthPct: number): TrendDirection {
  if (growthPct > 16) return "rising";
  // "Peaking" segments still read flat-to-positive but are closer to plateau.
  if (growthPct >= -3) return "peaking";
  return "declining";
}

function buildSparkline(rng: () => number, direction: TrendDirection): number[] {
  const points = 8;
  const base = randRange(rng, 40, 60);
  const drift =
    direction === "rising" ? randRange(rng, 4, 9) : direction === "peaking" ? randRange(rng, 0, 2) : randRange(rng, -8, -3);

  const series: number[] = [];
  let value = base;
  for (let i = 0; i < points; i++) {
    value = Math.max(5, value + drift + randRange(rng, -4, 4));
    series.push(Math.round(value));
  }
  return series;
}

function buildSegment(destination: Destination, def: SegmentDefinition): Segment {
  const rng = seededRandom(`${destination.id}::segment::${def.key}`);
  const searchGrowthPct = Math.round(randRange(rng, -18, 42) * 10) / 10;
  const trendDirection = classifyTrend(searchGrowthPct);
  const bookingVolumeTrend = buildSparkline(rng, trendDirection);
  const socialMentionVolume = randInt(rng, 2500, 48000);

  return {
    id: `${destination.id}__${def.key}`,
    destinationId: destination.id,
    segmentKey: def.key,
    name: def.name,
    trendDirection,
    searchGrowthPct,
    bookingVolumeTrend,
    socialMentionVolume,
    whySummary: def.whyTemplate(destination.name),
  };
}

export function getSegmentsForDestination(destination: Destination): Segment[] {
  return SEGMENT_CATALOG.map((def) => buildSegment(destination, def));
}
