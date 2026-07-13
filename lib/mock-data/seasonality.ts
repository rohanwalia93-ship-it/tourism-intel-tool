import type { Destination, SeasonalitySeries } from "@/lib/types";
import { randInt, randRange, seededRandom, type Rng } from "@/lib/mock-data/random";
import { SEGMENT_CATALOG } from "@/lib/mock-data/segments";

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

// Single-peak seasonal curve (cosine wave around a random peak month) rather
// than pure noise, so the calendar reads like a plausible booking season
// instead of a random heatmap.
function buildMonthlyCurve(rng: Rng): number[] {
  const peakMonth = randInt(rng, 0, 11);
  const amplitude = randRange(rng, 24, 40);
  const baseline = randRange(rng, 36, 54);

  const months: number[] = [];
  for (let month = 0; month < 12; month++) {
    const angle = (2 * Math.PI * (month - peakMonth)) / 12;
    const value = baseline + amplitude * Math.cos(angle) + randRange(rng, -5, 5);
    months.push(Math.round(Math.max(5, Math.min(100, value))));
  }
  return months;
}

export function getSeasonalityForDestination(destination: Destination): SeasonalitySeries[] {
  return SEGMENT_CATALOG.map((def) => {
    const rng = seededRandom(`${destination.id}::seasonality::${def.key}`);
    return {
      destinationId: destination.id,
      segmentKey: def.key,
      segmentName: def.name,
      months: buildMonthlyCurve(rng),
    };
  });
}
