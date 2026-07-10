import type { Destination, Region } from "@/lib/types";

// Curated catalog of destinations used to power autocomplete suggestions and
// "auto-suggest comparable destinations." Clients are never limited to this
// list — see `resolveDestination` in `lib/data.ts` — but these entries carry
// hand-picked regions and blurbs so the auto-suggest logic can group sensible
// regional peer sets.
export const DESTINATIONS: Destination[] = [
  {
    id: "dubai-ae",
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    blurb: "Global hub blending luxury retail, major events, and desert experiences.",
  },
  {
    id: "abu-dhabi-ae",
    name: "Abu Dhabi",
    country: "United Arab Emirates",
    region: "Middle East",
    blurb: "Culture-led capital investing heavily in heritage and major-event tourism.",
  },
  {
    id: "doha-qa",
    name: "Doha",
    country: "Qatar",
    region: "Middle East",
    blurb: "Post-World Cup destination pivoting toward MICE and luxury positioning.",
  },
  {
    id: "riyadh-sa",
    name: "Riyadh",
    country: "Saudi Arabia",
    region: "Middle East",
    blurb: "Fast-scaling giga-project destination with aggressive event calendars.",
  },
  {
    id: "muscat-om",
    name: "Muscat",
    country: "Oman",
    region: "Middle East",
    blurb: "Understated coastal capital known for eco and heritage tourism.",
  },
  {
    id: "bali-id",
    name: "Bali",
    country: "Indonesia",
    region: "Southeast Asia",
    blurb: "Wellness and nature-driven island destination with a mature digital-nomad base.",
  },
  {
    id: "phuket-th",
    name: "Phuket",
    country: "Thailand",
    region: "Southeast Asia",
    blurb: "Beach and resort hub recovering share against emerging Southeast Asian coasts.",
  },
  {
    id: "da-nang-vn",
    name: "Da Nang",
    country: "Vietnam",
    region: "Southeast Asia",
    blurb: "Rapidly rising coastal city with new luxury supply and family resorts.",
  },
  {
    id: "santorini-gr",
    name: "Santorini",
    country: "Greece",
    region: "Mediterranean",
    blurb: "Iconic island destination facing overtourism pressure on peak-season demand.",
  },
  {
    id: "mallorca-es",
    name: "Mallorca",
    country: "Spain",
    region: "Mediterranean",
    blurb: "High-volume Mediterranean island balancing mass and premium tourism.",
  },
  {
    id: "dubrovnik-hr",
    name: "Dubrovnik",
    country: "Croatia",
    region: "Mediterranean",
    blurb: "Heritage-driven coastal city with strong cruise and screen-tourism pull.",
  },
  {
    id: "marrakech-ma",
    name: "Marrakech",
    country: "Morocco",
    region: "North Africa",
    blurb: "Culture and desert-gateway city with fast-growing boutique hospitality.",
  },
  {
    id: "cancun-mx",
    name: "Cancún",
    country: "Mexico",
    region: "Caribbean & Americas",
    blurb: "All-inclusive resort powerhouse with deep US feeder-market demand.",
  },
  {
    id: "punta-cana-do",
    name: "Punta Cana",
    country: "Dominican Republic",
    region: "Caribbean & Americas",
    blurb: "Resort-led Caribbean destination competing hard on family and wellness travel.",
  },
];

export function getAllDestinations(): Destination[] {
  return DESTINATIONS;
}

export function findDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

export function searchDestinations(query: string, limit = 8): Destination[] {
  const q = query.trim().toLowerCase();
  if (!q) return DESTINATIONS.slice(0, limit);
  return DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
  ).slice(0, limit);
}

const FALLBACK_REGION_ORDER: Region[] = [
  "Middle East",
  "Mediterranean",
  "Southeast Asia",
  "North Africa",
  "Caribbean & Americas",
];

/**
 * Suggests comparable regional competitor destinations. For known catalog
 * destinations this prefers same-region peers; for custom (free-typed)
 * destinations it falls back to a well-rounded default set.
 */
export function suggestCompetitors(
  destination: Destination,
  count = 3
): Destination[] {
  const regionPeers = DESTINATIONS.filter(
    (d) => d.id !== destination.id && d.region === destination.region
  );

  if (regionPeers.length >= count) {
    return regionPeers.slice(0, count);
  }

  const fill = DESTINATIONS.filter(
    (d) =>
      d.id !== destination.id &&
      !regionPeers.includes(d) &&
      FALLBACK_REGION_ORDER.includes(d.region)
  );

  return [...regionPeers, ...fill].slice(0, count);
}
