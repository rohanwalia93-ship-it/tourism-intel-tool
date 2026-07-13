# Tourism Market Intelligence Tool

A destination-agnostic market intelligence dashboard for tourism clients —
DMOs, tour operators, and hospitality brands — to spot emerging trends in
their destination and benchmark against comparable regional competitors.

Built with Next.js (App Router) + TypeScript + Tailwind CSS. Currently backed
by a deterministic mock data layer; see [Swapping in real data](#swapping-in-real-data-sources)
below for how to wire up live sources.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pick a destination on the
landing page (any city — the app is not hardcoded to a fixed list), optionally
add 2–4 comparable competitor destinations, then explore:

- **Trend Radar** (`/trends`) — ranked tourism segments with trend direction,
  search-growth stats, sparklines, and a "why" explanation.
- **Opportunity Score** (`/opportunity`) — type any niche (e.g. "yacht
  tourism") to get a 0–100 opportunity score, a breakdown of what drives it,
  and a comparison against competitor destinations.
- **Destination Benchmarking** (`/benchmarking`) — a metric-by-metric table
  comparing the client destination against its competitors, with an
  auto-generated takeaway sentence.
- **Seasonality Calendar** (`/seasonality`) — a month-by-month heatmap of
  demand per segment, with peak/quiet month summary stats, for timing
  campaigns and launches.
- **Competitor Deep-Dive** (`/competitors`) — pick one selected competitor and
  see a focused head-to-head: top-momentum segments and a 1-vs-1 benchmark
  table, instead of the aggregate comparison.
- **Saved Reports** (`/reports`) — every destination you analyze is saved
  automatically (to `localStorage`) so you can reopen a past analysis without
  re-selecting a destination and competitors. Reachable from the nav bar even
  before picking a destination.

Destination + competitor selection is kept in a small client-side store
(`lib/selection-context.tsx`, persisted to `localStorage`) so it carries over
between pages without a backend. A separate store (`lib/reports-store.ts`)
keeps the Saved Reports history the same way.

## Project structure

```
app/
  page.tsx                 Landing / destination selector
  trends/page.tsx           Trend Radar dashboard
  opportunity/page.tsx      Opportunity Score tool
  benchmarking/page.tsx     Destination Benchmarking table
  seasonality/page.tsx      Seasonality Calendar heatmap
  competitors/page.tsx      Competitor Deep-Dive (1-vs-1)
  reports/page.tsx          Saved Reports history
components/                 Presentational UI components
lib/
  types.ts                  Shared domain types (Destination, Segment, NicheScore, BenchmarkMetric, SeasonalitySeries, SavedReport, ...)
  data.ts                   Public data-layer API — UI code only imports from here
  selection-context.tsx     Client-side destination/competitor selection store
  reports-store.ts          Client-side saved-reports history store
  mock-data/                Mock data generators (the part that gets replaced with real APIs)
    random.ts                Deterministic seeded PRNG so mock output is stable across renders
    destinations.ts          Curated destination catalog + region-based competitor suggestions
    segments.ts               Trend Radar segment generator (also the shared segment catalog)
    niche-scores.ts           Opportunity Score generator
    benchmarks.ts              Benchmark metric generator
    seasonality.ts             Seasonality Calendar generator
```

## How the mock data layer works

Every mock value is generated **deterministically** from a seed string (e.g.
`${destinationId}::segment::${segmentKey}`) via a small seeded PRNG in
`lib/mock-data/random.ts`. That means:

- The same destination + niche + segment always produces the same numbers —
  no flicker between server and client renders, and no reshuffling on
  navigation.
- Data works for **any** destination string a client types, not just the
  curated catalog in `lib/mock-data/destinations.ts`. Free-typed destinations
  become a "custom" `Destination` (see `resolveDestination` in `lib/data.ts`)
  and flow through the exact same generators.

The typed shapes in `lib/types.ts` are the contract:

- `Segment` — a tourism segment (Heritage & Culture, Desert & Eco, etc.) for
  one destination, with trend direction, search growth, a booking-volume
  sparkline series, social mention volume, and a short narrative.
- `NicheScore` — a 0–100 opportunity score for a (destination, niche) pair,
  with a `demandGrowth` / `competitiveSaturation` / `sentiment` breakdown and
  a "why now" narrative.
- `BenchmarkMetric` — a single metric value (visitor growth, sentiment,
  pricing index, etc.) for one destination, combined across destinations into
  a `BenchmarkRow` for the comparison table.

## Swapping in real data sources

All UI components import from `lib/data.ts`, never from `lib/mock-data/`
directly — that's the seam. Every function in `lib/data.ts` is already
`async`, so replacing an implementation with a real fetch doesn't change any
call sites. For example:

```ts
// lib/data.ts — before (mock)
export async function getTrendRadar(destination: Destination): Promise<Segment[]> {
  return getSegmentsForDestination(destination);
}

// after (real Google Trends integration)
export async function getTrendRadar(destination: Destination): Promise<Segment[]> {
  const raw = await googleTrends.interestByCategory(destination.name, SEGMENT_CATEGORIES);
  return mapGoogleTrendsToSegments(raw);
}
```

Suggested mapping of real sources to swap points:

| Data layer function | Real source candidates |
| --- | --- |
| `getTrendRadar` | Google Trends categories, booking-platform search volume |
| `getOpportunityScore(Comparison)` | Search APIs (demand growth), booking/OTA supply data (competitive saturation), social listening / review APIs (sentiment) |
| `getBenchmarkComparison` | Tourism board statistics (visitor growth, repeat visitor rate), OTA pricing data (price positioning), review platforms (sentiment) |
| `suggestCompetitors` | A proper geo/market-similarity model instead of the current region-based heuristic |

Since `lib/types.ts` doesn't change, no component in `app/` or `components/`
needs to change either — only the implementations inside `lib/data.ts` and
`lib/mock-data/`.

## Deployment

This is a standard Next.js App Router project with no custom server, so it
deploys to [Vercel](https://vercel.com/new) with zero configuration:

```bash
npm run build
```

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org) for sparklines and the opportunity radar chart
