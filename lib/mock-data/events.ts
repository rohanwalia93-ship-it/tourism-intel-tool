import type { DestinationId, EventRecord, TrendDirection } from "@/lib/types";
import { randInt, randRange, seededRandom, type Rng } from "@/lib/mock-data/random";

interface EventDefinition {
  id: string;
  destination: DestinationId;
  name: string;
  segment: string;
  dateLabel: string;
  whyTemplate: (destinationName: string) => string;
}

const DESTINATION_NAMES: Record<DestinationId, string> = {
  dubai: "Dubai",
  "abu-dhabi": "Abu Dhabi",
};

// Mock event catalog — illustrative, not a live listing. Real integrations
// (ticketing platforms, DMO calendars, venue booking systems) would replace
// this with a live feed keyed the same way (id, destination, segment).
const EVENT_CATALOG: EventDefinition[] = [
  {
    id: "dubai-shopping-festival",
    destination: "dubai",
    name: "Dubai Shopping Festival",
    segment: "Retail & Lifestyle",
    dateLabel: "Dec – Jan",
    whyTemplate: (d) => `Retail footfall around ${d} spikes hard during this window, and hotel booking curves consistently lead the announcement by several weeks.`,
  },
  {
    id: "dubai-world-cup",
    destination: "dubai",
    name: "Dubai World Cup",
    segment: "Sporting",
    dateLabel: "March",
    whyTemplate: (d) => `Global broadcast reach keeps this one of ${d}'s highest-sentiment marquee events, with premium hospitality demand outpacing general admission.`,
  },
  {
    id: "gitex-global",
    destination: "dubai",
    name: "GITEX Global",
    segment: "Trade Show",
    dateLabel: "October",
    whyTemplate: (d) => `Exhibitor demand for floor space in ${d} is running ahead of prior editions, pulling a long tail of side events into the same week.`,
  },
  {
    id: "dubai-food-festival",
    destination: "dubai",
    name: "Dubai Food Festival",
    segment: "Culinary",
    dateLabel: "February",
    whyTemplate: () => `Restaurant-week style programming keeps repeat attendance high, though the format is starting to show its age against newer culinary formats.`,
  },
  {
    id: "dubai-film-festival",
    destination: "dubai",
    name: "Dubai International Film Festival",
    segment: "Culture & Screen",
    dateLabel: "December",
    whyTemplate: () => `Regional programming strength keeps industry attendance stable, but public ticket sell-through has been the softer half of this event.`,
  },
  {
    id: "dubai-marathon",
    destination: "dubai",
    name: "Dubai Marathon",
    segment: "Sporting",
    dateLabel: "January",
    whyTemplate: () => `Participation numbers keep climbing year over year, with international entrants now a majority of the field.`,
  },
  {
    id: "art-dubai",
    destination: "dubai",
    name: "Art Dubai",
    segment: "Culture",
    dateLabel: "April",
    whyTemplate: () => `Gallery participation from outside the region has widened, and secondary programming around the fair is growing faster than the fair itself.`,
  },
  {
    id: "dubai-airshow",
    destination: "dubai",
    name: "Dubai Airshow",
    segment: "Trade Show",
    dateLabel: "November (biennial)",
    whyTemplate: () => `Order-announcement season drives outsized trade press attention, with delegate hotel demand concentrated in a tight radius around the venue.`,
  },
  {
    id: "abu-dhabi-grand-prix",
    destination: "abu-dhabi",
    name: "Abu Dhabi Grand Prix",
    segment: "Sporting",
    dateLabel: "November",
    whyTemplate: () => `The season-closing slot keeps global attention high, and the concert program layered on top now drives its own independent ticket demand.`,
  },
  {
    id: "abu-dhabi-art",
    destination: "abu-dhabi",
    name: "Abu Dhabi Art",
    segment: "Culture",
    dateLabel: "November",
    whyTemplate: () => `Institutional buyer attendance has grown steadily, positioning this as a collector-first fair rather than a general-public draw.`,
  },
  {
    id: "idex",
    destination: "abu-dhabi",
    name: "IDEX Defence Exhibition",
    segment: "Trade Show",
    dateLabel: "February (biennial)",
    whyTemplate: () => `Delegation-level attendance keeps average spend per visitor unusually high for a trade show, concentrated in a short, intense window.`,
  },
  {
    id: "abu-dhabi-food-festival",
    destination: "abu-dhabi",
    name: "Abu Dhabi Food Festival",
    segment: "Culinary",
    dateLabel: "February",
    whyTemplate: () => `Family-oriented programming keeps repeat attendance strong, though the event still competes directly with Dubai's culinary calendar.`,
  },
  {
    id: "abu-dhabi-festival",
    destination: "abu-dhabi",
    name: "Abu Dhabi Festival",
    segment: "Culture",
    dateLabel: "March",
    whyTemplate: () => `A performing-arts programme built around international headliners keeps sentiment high among a smaller, high-intent audience.`,
  },
  {
    id: "yas-island-nye",
    destination: "abu-dhabi",
    name: "Yas Island New Year Event",
    segment: "Entertainment",
    dateLabel: "December 31",
    whyTemplate: () => `Single-night demand concentration makes this one of the sharpest hotel-occupancy spikes on the calendar, with pricing power to match.`,
  },
  {
    id: "world-future-energy-summit",
    destination: "abu-dhabi",
    name: "World Future Energy Summit",
    segment: "Trade Show",
    dateLabel: "January",
    whyTemplate: () => `Policy-adjacent programming keeps delegate quality high even as general attendance growth has flattened.`,
  },
  {
    id: "abu-dhabi-book-fair",
    destination: "abu-dhabi",
    name: "Abu Dhabi International Book Fair",
    segment: "Culture",
    dateLabel: "April",
    whyTemplate: () => `Publisher participation keeps growing, but public-day footfall growth has slowed relative to the trade-day program.`,
  },
];

function classifyTrend(momentumPct: number): TrendDirection {
  if (momentumPct > 16) return "rising";
  if (momentumPct >= -4) return "peaking";
  return "declining";
}

function buildBuzzHistory(rng: Rng, direction: TrendDirection): number[] {
  const points = 12;
  const base = randRange(rng, 35, 55);
  const drift =
    direction === "rising"
      ? randRange(rng, 4, 8)
      : direction === "peaking"
        ? randRange(rng, 0, 2)
        : randRange(rng, -7, -3);

  const series: number[] = [];
  let value = base;
  for (let i = 0; i < points; i++) {
    value = Math.max(5, Math.min(100, value + drift + randRange(rng, -4, 4)));
    series.push(Math.round(value));
  }
  return series;
}

function buildEvent(def: EventDefinition): EventRecord {
  const rng = seededRandom(`events::${def.id}`);
  const momentumPct = Math.round(randRange(rng, -20, 45) * 10) / 10;
  const trendDirection = classifyTrend(momentumPct);
  const buzzVelocity = Math.max(5, Math.min(100, Math.round(52 + momentumPct * 0.8 + randRange(rng, -6, 6))));

  return {
    id: def.id,
    destination: def.destination,
    name: def.name,
    segment: def.segment,
    dateLabel: def.dateLabel,
    trendDirection,
    buzzVelocity,
    ticketSellThroughRate: Math.round(randRange(rng, 30, 98)),
    bookingLeadTimeDays: randInt(rng, 10, 180),
    calendarWhiteSpace: Math.round(randRange(rng, 20, 95)),
    venueCapacityUtilization: Math.round(randRange(rng, 35, 95)),
    sentimentScore: Math.round(randRange(rng, 40, 95)),
    hotelOccupancyLiftPct: Math.round(randRange(rng, 2, 35)),
    repeatAttendeeRatio: Math.round(randRange(rng, 15, 70)),
    sponsorshipSignal: Math.round(randRange(rng, 20, 90)),
    cannibalizationExposure: Math.round(randRange(rng, 10, 80)),
    regulatoryExposure: Math.round(randRange(rng, 5, 60)),
    sentimentVolatility: Math.round(randRange(rng, 10, 70)),
    buzzHistory: buildBuzzHistory(rng, trendDirection),
    whySummary: def.whyTemplate(DESTINATION_NAMES[def.destination]),
  };
}

const ALL_EVENTS: EventRecord[] = EVENT_CATALOG.map(buildEvent);

export function getEventsForDestination(destination: DestinationId): EventRecord[] {
  return ALL_EVENTS.filter((e) => e.destination === destination);
}

export function findEventById(id: string): EventRecord | undefined {
  return ALL_EVENTS.find((e) => e.id === id);
}

export function getComparableEvents(event: EventRecord, count = 3): EventRecord[] {
  return ALL_EVENTS.filter((e) => e.id !== event.id && e.segment === event.segment)
    .slice(0, count)
    .concat(
      ALL_EVENTS.filter((e) => e.id !== event.id && e.segment !== event.segment).slice(
        0,
        Math.max(0, count - ALL_EVENTS.filter((e) => e.id !== event.id && e.segment === event.segment).length)
      )
    )
    .slice(0, count);
}
