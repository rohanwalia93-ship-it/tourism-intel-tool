import type { DestinationId, RegulatoryItem } from "@/lib/types";

// Mock regulatory/policy feed, filtered by category and destination in the
// UI. Real integrations (DMO/government bulletins, licensing portals) would
// replace this static list with a live feed of the same shape.
const REGULATORY_ITEMS: RegulatoryItem[] = [
  {
    id: "reg-events-permit-1",
    destination: "dubai",
    categories: ["events"],
    title: "Events permit turnaround shortened to 10 working days",
    summary:
      "Dubai's events licensing authority has cut standard permit processing from 20 to 10 working days for venues with existing safety certification on file.",
    dateLabel: "2 weeks ago",
    impact: "positive",
  },
  {
    id: "reg-events-capacity-1",
    destination: "dubai",
    categories: ["events"],
    title: "Updated public-gathering capacity guidelines",
    summary:
      "Revised guidance caps standing-room density at outdoor venues, which may reduce effective capacity at high-attendance events by up to 8%.",
    dateLabel: "5 weeks ago",
    impact: "negative",
  },
  {
    id: "reg-events-tax-1",
    destination: "dubai",
    categories: ["events"],
    title: "Ticketing service-fee disclosure rule takes effect",
    summary:
      "All-in pricing is now mandatory at checkout for ticketed events; early operator data shows a modest, short-lived dip in completed purchases.",
    dateLabel: "This week",
    impact: "neutral",
  },
  {
    id: "reg-events-visa-1",
    destination: "abu-dhabi",
    categories: ["events"],
    title: "Multi-entry event-visa pilot extended",
    summary:
      "The short-stay multi-entry visa pilot for confirmed ticket holders of major events has been extended through next year, easing international attendance friction.",
    dateLabel: "3 weeks ago",
    impact: "positive",
  },
  {
    id: "reg-events-noise-1",
    destination: "abu-dhabi",
    categories: ["events"],
    title: "Extended-hours noise variance now requires community notice",
    summary:
      "Events running past standard hours must now file a 14-day community notice before applying for a noise variance, adding lead time to late-program events.",
    dateLabel: "1 month ago",
    impact: "negative",
  },
  {
    id: "reg-events-sponsorship-1",
    destination: "abu-dhabi",
    categories: ["events"],
    title: "Clarified rules for international sponsorship remittance",
    summary:
      "Updated guidance simplifies how international sponsorship payments are processed for locally licensed event organizers, reducing settlement time.",
    dateLabel: "6 weeks ago",
    impact: "positive",
  },
];

export function getRegulatoryFeed(destination: DestinationId, category: "events"): RegulatoryItem[] {
  return REGULATORY_ITEMS.filter(
    (item) => item.destination === destination && item.categories.includes(category)
  );
}
