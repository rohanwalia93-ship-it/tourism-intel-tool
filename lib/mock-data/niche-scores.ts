import type { Destination, NicheScore } from "@/lib/types";
import { randRange, seededRandom } from "@/lib/mock-data/random";

interface NicheDefinition {
  key: string;
  label: string;
  whyTemplate: (destinationName: string) => string;
}

// Curated "well-known" niches with hand-written narratives. Any niche the
// client types that doesn't match one of these still gets a scored result —
// see `GENERIC_WHY_TEMPLATE` below — so the tool never dead-ends on
// free-text input.
const NICHE_CATALOG: NicheDefinition[] = [
  {
    key: "adventure tourism",
    label: "Adventure Tourism",
    whyTemplate: (name) =>
      `Search interest in adventure itineraries around ${name} is climbing faster than traditional leisure packages, and specialist operators are still thin on the ground — a window for early positioning before larger brands move in.`,
  },
  {
    key: "yacht tourism",
    label: "Yacht Tourism",
    whyTemplate: (name) =>
      `High-net-worth travel is consolidating around a small number of marina-ready destinations, and ${name} has the infrastructure to compete — but marketing spend in this niche is still low relative to demand signals.`,
  },
  {
    key: "wellness tourism",
    label: "Wellness Tourism",
    whyTemplate: (name) =>
      `Post-pandemic travel priorities keep favoring restorative trips, and ${name}'s wellness offer is gaining organic search visibility faster than paid campaigns can currently capture.`,
  },
  {
    key: "culinary tourism",
    label: "Culinary Tourism",
    whyTemplate: (name) =>
      `Food-led content is driving discovery of ${name} on social platforms well ahead of traditional travel marketing, suggesting an underpriced opportunity in culinary-led packaging.`,
  },
  {
    key: "eco tourism",
    label: "Eco Tourism",
    whyTemplate: (name) =>
      `Sustainability-minded travelers are actively searching for verified eco experiences near ${name}, but few operators currently carry credible certification — a gap new entrants can close quickly.`,
  },
  {
    key: "heritage tourism",
    label: "Heritage Tourism",
    whyTemplate: (name) =>
      `Cultural-heritage search volume around ${name} has outpaced generic "things to do" queries this year, a sign travelers are researching more deeply before booking.`,
  },
  {
    key: "desert safari tourism",
    label: "Desert Safari Tourism",
    whyTemplate: (name) =>
      `Desert-based excursions remain one of the stickiest add-on purchases for visitors to ${name}, with booking volumes holding up even as broader leisure demand fluctuates.`,
  },
  {
    key: "mice tourism",
    label: "MICE Tourism",
    whyTemplate: (name) =>
      `${name}'s meetings-and-events pipeline is filling out further in advance than last year, a leading indicator that corporate travel budgets are returning to the region.`,
  },
  {
    key: "cruise tourism",
    label: "Cruise Tourism",
    whyTemplate: (name) =>
      `Cruise-line itinerary additions near ${name} are running ahead of shore-side capacity planning, creating near-term pricing power for well-positioned local operators.`,
  },
  {
    key: "film tourism",
    label: "Film & Screen Tourism",
    whyTemplate: (name) =>
      `Recent screen placements have put ${name} in front of new international audiences, and search interest tied to those releases hasn't yet been matched by dedicated itineraries.`,
  },
  {
    key: "dark sky tourism",
    label: "Dark Sky Tourism",
    whyTemplate: (name) =>
      `Stargazing and dark-sky experiences near ${name} are a niche but fast-growing search category, currently served by very few dedicated operators.`,
  },
  {
    key: "sports tourism",
    label: "Sports Tourism",
    whyTemplate: (name) =>
      `Participation and spectator sports travel tied to ${name} is growing faster than the destination's overall visitor numbers, pointing to an underserved segment.`,
  },
];

function genericWhyNow(destinationName: string, nicheLabel: string): string {
  return `${destinationName}'s ${nicheLabel.toLowerCase()} segment is still emerging: search interest, operator supply, and social conversation are all trending upward, but formal packaging and marketing spend haven't caught up yet — a window for early movers.`;
}

function normalizeNiche(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

function toDisplayLabel(raw: string): string {
  const normalized = normalizeNiche(raw);
  const known = NICHE_CATALOG.find((n) => n.key === normalized);
  if (known) return known.label;
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function getNicheScore(destination: Destination, rawNiche: string): NicheScore {
  const normalized = normalizeNiche(rawNiche);
  const label = toDisplayLabel(rawNiche);
  const definition = NICHE_CATALOG.find((n) => n.key === normalized);

  const rng = seededRandom(`${destination.id}::niche::${normalized}`);
  const demandGrowth = Math.round(randRange(rng, 20, 95));
  const competitiveSaturation = Math.round(randRange(rng, 15, 90));
  const sentiment = Math.round(randRange(rng, 35, 95));

  const score = Math.round(
    demandGrowth * 0.42 + (100 - competitiveSaturation) * 0.33 + sentiment * 0.25
  );

  return {
    destinationId: destination.id,
    destinationName: destination.name,
    niche: label,
    score: Math.max(0, Math.min(100, score)),
    breakdown: { demandGrowth, competitiveSaturation, sentiment },
    whyNow: definition ? definition.whyTemplate(destination.name) : genericWhyNow(destination.name, label),
  };
}

export function getKnownNicheSuggestions(): string[] {
  return NICHE_CATALOG.map((n) => n.label);
}
