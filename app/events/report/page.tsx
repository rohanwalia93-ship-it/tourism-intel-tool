"use client";

import { useMemo } from "react";
import { RequireDestination } from "@/components/require-destination";
import { RadarDial } from "@/components/radar-dial";
import { useFocusedEvent } from "@/lib/use-focused-event";
import { getComparableEvents } from "@/lib/mock-data/events";
import { getRegulatoryFeed } from "@/lib/mock-data/regulatory";
import { buildBenchmarkTakeaway, buildEventBenchmark, computeOpportunity, computeRisk } from "@/lib/events-engine";
import { buildInsightReport } from "@/lib/insight-report";
import type { DestinationId } from "@/lib/types";

const DESTINATION_NAMES: Record<DestinationId, string> = { dubai: "Dubai", "abu-dhabi": "Abu Dhabi" };

function BrassRule() {
  return <hr className="my-8 border-t border-brass/30" />;
}

function ReportContent({ destination }: { destination: DestinationId }) {
  const { focusedEvent } = useFocusedEvent(destination);
  const opportunity = useMemo(() => computeOpportunity(focusedEvent), [focusedEvent]);
  const risk = useMemo(() => computeRisk(focusedEvent), [focusedEvent]);
  const comparables = useMemo(() => getComparableEvents(focusedEvent), [focusedEvent]);
  const benchmarkRows = useMemo(() => buildEventBenchmark(focusedEvent, comparables), [focusedEvent, comparables]);
  const takeaway = useMemo(() => buildBenchmarkTakeaway(focusedEvent, benchmarkRows), [focusedEvent, benchmarkRows]);
  const regulatoryItems = useMemo(() => getRegulatoryFeed(destination, "events"), [destination]);

  const report = useMemo(
    () =>
      buildInsightReport(
        DESTINATION_NAMES[destination],
        focusedEvent,
        opportunity,
        risk,
        benchmarkRows,
        takeaway,
        regulatoryItems
      ),
    [destination, focusedEvent, opportunity, risk, benchmarkRows, takeaway, regulatoryItems]
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">Insight Report</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">{focusedEvent.name}</h1>
          <p className="text-sm text-text-muted">
            {DESTINATION_NAMES[destination]} · {focusedEvent.segment} · {focusedEvent.dateLabel}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print shrink-0 rounded-md border border-brass px-3 py-1.5 text-sm font-medium text-brass hover:bg-brass/10"
        >
          Export
        </button>
      </div>

      <div className="rounded-lg border border-border bg-bg-panel p-8">
        <div className="flex flex-col items-center gap-2 pb-2">
          <RadarDial opportunity={opportunity.score} risk={risk.score} size={180} />
        </div>

        <BrassRule />

        <section>
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed">{report.executiveSummary}</p>
        </section>

        <BrassRule />

        <section>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Key Findings
          </h2>
          <ul className="space-y-2">
            {report.keyFindings.map((finding, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span className="text-brass">—</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </section>

        <BrassRule />

        <section>
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Opportunity / Risk
          </h2>
          <p className="mb-3 font-mono text-sm">
            <span style={{ color: "var(--signal-positive)" }}>Opportunity {opportunity.score}</span>
            <span className="mx-2 text-text-muted">·</span>
            <span style={{ color: "var(--signal-risk)" }}>Risk {risk.score}</span>
          </p>
          <p className="text-sm leading-relaxed text-text-muted">{report.opportunityRiskNote}</p>
        </section>

        <BrassRule />

        <section>
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Benchmark Position
          </h2>
          <p className="text-sm leading-relaxed text-text-muted">{report.benchmarkPosition}</p>
        </section>

        <BrassRule />

        <section>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Risks &amp; Caveats
          </h2>
          <ul className="space-y-2">
            {report.risksAndCaveats.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-text-muted">
                <span style={{ color: "var(--signal-risk)" }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <BrassRule />

        <section>
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Recommendation
          </h2>
          <p className="text-sm font-medium leading-relaxed">{report.recommendation}</p>
        </section>

        <div className="mt-8 border-t border-border pt-4">
          <p className="font-mono text-xs italic text-text-muted">{report.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

export default function InsightReportPage() {
  return <RequireDestination>{(destination) => <ReportContent destination={destination} />}</RequireDestination>;
}
