# Tourism Market Intelligence — Dubai & Abu Dhabi

A self-serve market intelligence tool for tourism investment decisions in
Dubai and Abu Dhabi. Pick a destination and a product category — Events,
Attractions, Accommodation, or MICE — and every downstream module
(Trend Radar, Opportunity Score, Risk Radar, Benchmarking, Regulatory Pulse,
Scenario Simulator, Insight Report) reconfigures its metrics and scoring to
match that category. Nothing generic is shown.

**Build status:** Part C, steps 1–6 of the build brief. **Events** is built
end-to-end. Attractions, Accommodation, and MICE have their metric schemas
locked (`lib/types.ts`) but no data generator or dashboard yet — they show as
"Coming soon" on the compass. The Capital Allocation view (phase 2) needs all
four categories live first.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Select a destination on
the compass, turn to **Events** (the only live category), and enter the
dashboard.

## Screens

- **Home** (`/`) — the compass selector. A destination toggle (Dubai / Abu
  Dhabi) plus a radial compass with the four category positions; a brass
  needle rotates to the selection. Only Events is enterable right now.
- **Events dashboard** (`/events`) — one scrolling screen: **Trend Radar**
  (ranked list of mock Dubai/Abu Dhabi events by momentum), then the focused
  event's **Opportunity Score + Risk Radar** via the Radar Dial, then
  **Benchmarking** against comparable events, then **Regulatory Pulse** (a
  feed filtered to Events + the selected destination). Click any row in the
  Trend Radar list to focus that event — everything below updates.
- **Scenario Simulator** (`/events/scenario`) — adjust ticket price, event
  date, venue capacity, or toggle a competing-event announcement for the
  focused event; Opportunity/Risk recalculate live on the same Radar Dial,
  using the exact same scoring functions as the dashboard.
- **Insight Report** (`/events/report`) — an auto-generated briefing for the
  focused event: executive summary, key findings, Opportunity/Risk
  breakdown, benchmark position, risks & caveats, a one-line recommendation,
  and the standing disclaimer. `Export` triggers a print-optimized
  `window.print()` (save as PDF from the browser's print dialog).
- **Coming soon** (`/attractions`, `/accommodation`, `/mice`) — placeholder
  screens for the categories not yet built.

## Project structure

```
app/
  page.tsx                    Home / compass selector
  events/page.tsx              Events category dashboard
  events/scenario/page.tsx     Scenario Simulator
  events/report/page.tsx       Insight Report
  attractions/page.tsx         Coming soon
  accommodation/page.tsx       Coming soon
  mice/page.tsx                Coming soon
components/
  radar-dial.tsx               The signature Radar Dial element
  compass-selector.tsx         Home screen destination + category compass
  score-breakdown.tsx          Opportunity/Risk component bars
  benchmark-table.tsx          Comparable-events benchmark table
  regulatory-feed.tsx          Regulatory Pulse feed list
  trend-badge.tsx               Rising/Peaking/Declining badge
  require-destination.tsx       Guard shown when no destination is selected
  coming-soon.tsx                Shared "not built yet" screen
lib/
  types.ts                     Schema lock: all four category metric matrices
                                (Part A.3), Opportunity/Risk/Benchmark/
                                Regulatory/Scenario/Report shapes
  events-engine.ts             Pure computeOpportunity/computeRisk/
                                applyScenario/buildEventBenchmark functions —
                                the Scenario Simulator calls the same
                                functions the static dashboard does
  insight-report.ts            Insight Report template generator (see below)
  selection-context.tsx        Destination + focused-event store (localStorage)
  use-focused-event.ts         Shared "ranked events + focused event" hook
  mock-data/
    random.ts                   Deterministic seeded PRNG
    events.ts                    Mock Events catalog (16 events, 8/destination)
    regulatory.ts                 Mock Regulatory Pulse feed
```

## Design system

Tokens live in `app/globals.css` as CSS custom properties (`--bg-primary`,
`--bg-panel`, `--accent-brass`, `--signal-positive`, `--signal-risk`,
`--text-primary`, `--text-muted`), consumed via Tailwind v4's `@theme inline`
so every component uses semantic classes (`bg-bg-panel`, `text-brass`, …)
rather than hardcoded colors. Dark-only, deep navy + brass, no light mode.

`--signal-risk` is `#E67080`, not the brief's literal `#E2596B` — it's
lightened just enough to clear WCAG AA (4.5:1) against `--bg-panel`; every
other token clears AA with headroom. Re-run the contrast check in
`app/globals.css`'s comment if you change any of these.

Fonts: Space Grotesk (`font-display`, headings + the Radar Dial readout),
IBM Plex Sans (`font-sans`, body), IBM Plex Mono (`font-mono`, all numeric
data), loaded via `next/font/google` in `app/layout.tsx`.

**The Radar Dial** (`components/radar-dial.tsx`) is the signature element:
Opportunity and Risk are plotted as one blip on an x/y field (Opportunity =
horizontal, Risk = vertical) inside concentric brass-ticked rings — not
collapsed into a single number. It's reused on the dashboard, the Scenario
Simulator, and the Insight Report. Motion (the once-only sweep on mount, the
compass needle rotation, and the dial's live recalculation) is pure CSS and
respects `prefers-reduced-motion` throughout (see the keyframe blocks in
`app/globals.css`).

## How the mock data layer works

Every mock event metric is generated **deterministically** from a seed
string (`events::${eventId}`) via the seeded PRNG in `lib/mock-data/random.ts`
— the same event always produces the same numbers, so nothing reshuffles
between renders or on scenario reset.

`lib/events-engine.ts` is the important seam: `computeOpportunity` and
`computeRisk` are pure functions of an `EventRecord`, implementing the exact
weights from the build brief (Part A.3 §1):

- **Opportunity** — Demand Velocity 40%, Calendar White Space 25%, Capacity
  Headroom 20%, Sentiment 15%.
- **Risk** — Oversupply/Clash Risk 35%, Cannibalization Risk 25%, Regulatory
  Risk 20%, Sentiment Volatility 20% (risk sub-weights are this project's own
  design — the brief specifies the category but not exact risk weights).

`applyScenario(event, adjustments)` returns an adjusted `EventRecord`; the
Scenario Simulator runs that through the *same* `computeOpportunity` /
`computeRisk` the dashboard uses, per the brief's "no separate model, just an
interactive version of the same math."

## Insight Report generation

The brief calls for an LLM call here ("existing Claude integration ... one
prompt template per category"). `lib/insight-report.ts` is a deterministic,
data-driven template instead, so the report can never contradict the numbers
next to it. This is the swap point: replace `buildInsightReport` with a call
to the Claude API (Messages API, one system prompt per category), passing the
same event/opportunity/risk/benchmark/regulatory payload as context, and keep
the function's signature so `app/events/report/page.tsx` doesn't need to
change.

## Extending to the other categories

`lib/types.ts` already locks the metric matrix and Opportunity weights for
Attractions, Accommodation, and MICE (Part A.3 §2–4). To bring one online,
follow the Events pattern:

1. `lib/mock-data/<category>.ts` — a generator like `events.ts`.
2. `lib/<category>-engine.ts` — `computeOpportunity`/`computeRisk`/
   `applyScenario`/benchmark builder, like `events-engine.ts`.
3. `app/<category>/page.tsx`, `.../scenario/page.tsx`, `.../report/page.tsx`
   — copy the Events screens and swap the data-layer calls.
4. Flip `available: true` for that category in `CATEGORIES` (`lib/types.ts`).

Once all four are live, build the Capital Allocation view (phase 2): four
Radar Dials side by side, ranked, each category's Opportunity/Risk/Net and a
one-line rationale.

## Known gaps / next steps

- **Insight Report export** currently uses the browser's native
  `window.print()` (`Export` button); real PDF/DOCX generation (e.g. a
  headless-render or `docx` library) would be a cleaner next step.
- **Insight Report copy** is template-generated, not LLM-generated — see
  above.
- Attractions, Accommodation, MICE, and the Capital Allocation view are not
  built yet (see "Extending to the other categories").

## Deployment

Standard Next.js App Router project, no custom server — deploys to
[Vercel](https://vercel.com/new) with zero configuration:

```bash
npm run build
```

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- Custom SVG for the Radar Dial and compass (no charting library — full
  control over the signature elements)
