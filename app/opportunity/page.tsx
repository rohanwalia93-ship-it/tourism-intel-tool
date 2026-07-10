"use client";

import { Suspense, use, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { RequireDestination } from "@/components/require-destination";
import { OpportunityRadarChart } from "@/components/opportunity-radar-chart";
import { BreakdownBars } from "@/components/breakdown-bars";
import { getOpportunityScoreComparison, listKnownNiches } from "@/lib/data";
import type { Destination, NicheScore } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 70) return "text-rising";
  if (score >= 45) return "text-peaking";
  return "text-declining";
}

function ScoreResult({
  resultPromise,
}: {
  resultPromise: Promise<{ destination: NicheScore; competitors: NicheScore[] }>;
}) {
  const result = use(resultPromise);

  const comparisonRows = useMemo(
    () =>
      [
        { destination: result.destination.destinationName, score: result.destination.score, isClient: true },
        ...result.competitors.map((c) => ({
          destination: c.destinationName,
          score: c.score,
          isClient: false,
        })),
      ].sort((a, b) => b.score - a.score),
    [result]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 text-center shadow-sm lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            {result.destination.niche} in {result.destination.destinationName}
          </div>
          <div className={clsx("mt-2 text-6xl font-bold tabular-nums", scoreColor(result.destination.score))}>
            {result.destination.score}
          </div>
          <div className="mt-1 text-sm text-muted">out of 100</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold">What&apos;s driving the score</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <OpportunityRadarChart breakdown={result.destination.breakdown} />
            <div className="flex flex-col justify-center">
              <BreakdownBars breakdown={result.destination.breakdown} />
            </div>
          </div>
        </div>
      </div>

      {comparisonRows.length > 1 && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">
            {result.destination.niche} — regional comparison
          </h2>
          <div className="space-y-3">
            {comparisonRows.map((row) => (
              <div key={row.destination} className="flex items-center gap-4">
                <div
                  className={clsx(
                    "w-32 shrink-0 truncate text-sm",
                    row.isClient ? "font-semibold" : "text-muted"
                  )}
                >
                  {row.destination}
                </div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className={clsx("h-full rounded-full", row.isClient ? "bg-accent" : "bg-muted")}
                    style={{ width: `${row.score}%` }}
                  />
                </div>
                <div className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {row.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold">Why now</h2>
        <p className="text-sm leading-relaxed text-muted">{result.destination.whyNow}</p>
      </div>
    </div>
  );
}

function OpportunityScoreContent({
  destination,
  competitors,
}: {
  destination: Destination;
  competitors: Destination[];
}) {
  const [nicheInput, setNicheInput] = useState("adventure tourism");
  const [activeNiche, setActiveNiche] = useState("adventure tourism");
  const [knownNiches, setKnownNiches] = useState<string[]>([]);

  useEffect(() => {
    listKnownNiches().then(setKnownNiches);
  }, []);

  const resultPromise = useMemo(
    () => getOpportunityScoreComparison(destination, competitors, activeNiche),
    [destination, competitors, activeNiche]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nicheInput.trim()) return;
    setActiveNiche(nicheInput.trim());
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Opportunity Score
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Score any niche for {destination.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Enter a tourism niche to see a 0–100 opportunity score, what&apos;s driving it, and how
          it compares against {competitors.length > 0 ? "your selected competitors" : "comparable destinations"}.
        </p>
      </div>

      <form onSubmit={submit} className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={nicheInput}
          onChange={(e) => setNicheInput(e.target.value)}
          list="known-niches"
          placeholder="e.g. yacht tourism, culinary tourism, dark sky tourism…"
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none ring-accent/30 placeholder:text-muted focus:ring-2"
        />
        <datalist id="known-niches">
          {knownNiches.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Score this niche
        </button>
      </form>

      <Suspense fallback={<div className="py-24 text-center text-sm text-muted">Scoring…</div>}>
        <ScoreResult resultPromise={resultPromise} key={`${destination.id}::${activeNiche}`} />
      </Suspense>
    </div>
  );
}

export default function OpportunityScorePage() {
  return (
    <RequireDestination>
      {({ destination, competitors }) => (
        <OpportunityScoreContent destination={destination} competitors={competitors} />
      )}
    </RequireDestination>
  );
}
