"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { RequireDestination } from "@/components/require-destination";
import { TrendBadge } from "@/components/trend-badge";
import { RadarDial } from "@/components/radar-dial";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { BenchmarkTable } from "@/components/benchmark-table";
import { RegulatoryFeed } from "@/components/regulatory-feed";
import { setFocusedEvent } from "@/lib/selection-context";
import { getComparableEvents } from "@/lib/mock-data/events";
import { getRegulatoryFeed } from "@/lib/mock-data/regulatory";
import { buildBenchmarkTakeaway, buildEventBenchmark, computeOpportunity, computeRisk } from "@/lib/events-engine";
import { useFocusedEvent } from "@/lib/use-focused-event";
import type { DestinationId } from "@/lib/types";

const DESTINATION_NAMES: Record<DestinationId, string> = { dubai: "Dubai", "abu-dhabi": "Abu Dhabi" };

function EventsDashboardContent({ destination }: { destination: DestinationId }) {
  const { focusedEvent, rankedEvents } = useFocusedEvent(destination);

  const opportunity = useMemo(() => computeOpportunity(focusedEvent), [focusedEvent]);
  const risk = useMemo(() => computeRisk(focusedEvent), [focusedEvent]);
  const comparables = useMemo(() => getComparableEvents(focusedEvent), [focusedEvent]);
  const benchmarkRows = useMemo(() => buildEventBenchmark(focusedEvent, comparables), [focusedEvent, comparables]);
  const takeaway = useMemo(() => buildBenchmarkTakeaway(focusedEvent, benchmarkRows), [focusedEvent, benchmarkRows]);
  const regulatoryItems = useMemo(() => getRegulatoryFeed(destination, "events"), [destination]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Events · {DESTINATION_NAMES[destination]}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Events Intelligence</h1>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Trend Radar</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          {rankedEvents.map((event, i) => {
            const isFocused = event.id === focusedEvent.id;
            return (
              <button
                key={event.id}
                onClick={() => setFocusedEvent(event.id)}
                className={clsx(
                  "flex w-full items-center gap-4 border-b border-border px-4 py-3 text-left transition-colors last:border-0",
                  isFocused ? "bg-bg-panel-raised" : "bg-bg-panel hover:bg-bg-panel-raised"
                )}
              >
                <span className="w-5 shrink-0 font-mono text-xs text-text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{event.name}</span>
                    <span className="hidden shrink-0 text-xs text-text-muted sm:inline">{event.segment}</span>
                  </div>
                  <p className="mt-0.5 hidden truncate text-xs text-text-muted sm:block">{event.whySummary}</p>
                </div>
                <div className="hidden shrink-0 text-right font-mono text-xs text-text-muted sm:block">
                  <div className="font-semibold text-text-primary">{event.buzzVelocity}</div>
                  <div>buzz</div>
                </div>
                <span className="shrink-0">
                  <TrendBadge direction={event.trendDirection} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold">{focusedEvent.name}</h2>
          <p className="text-sm text-text-muted">
            {focusedEvent.segment} · {focusedEvent.dateLabel}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-bg-panel p-6 lg:col-span-2">
            <RadarDial opportunity={opportunity.score} risk={risk.score} size={200} animateSweep showAxisLabels />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-bg-panel p-6 sm:grid-cols-2 lg:col-span-3">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Opportunity — {opportunity.score}
              </h3>
              <ScoreBreakdown breakdown={opportunity.breakdown} tone="positive" />
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Risk — {risk.score}
              </h3>
              <ScoreBreakdown breakdown={risk.breakdown} tone="risk" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-text-muted">{focusedEvent.whySummary}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Benchmarking vs. comparable events</h2>
        <BenchmarkTable focusLabel={focusedEvent.name} rows={benchmarkRows} />
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{takeaway}</p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Regulatory Pulse</h2>
        <RegulatoryFeed items={regulatoryItems} />
      </section>
    </div>
  );
}

export default function EventsDashboardPage() {
  return (
    <RequireDestination>
      {(destination) => <EventsDashboardContent destination={destination} />}
    </RequireDestination>
  );
}
