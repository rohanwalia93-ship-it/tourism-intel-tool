"use client";

import { Suspense, use, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { RequireDestination } from "@/components/require-destination";
import { TrendBadge } from "@/components/trend-badge";
import { BenchmarkPositionBadge } from "@/components/benchmark-position-badge";
import { getBenchmarkComparison, getTrendRadar, type BenchmarkRow } from "@/lib/data";
import type { Destination, Segment } from "@/lib/types";

const TREND_RANK: Record<Segment["trendDirection"], number> = { rising: 0, peaking: 1, declining: 2 };

function topSegments(segments: Segment[], count = 3): Segment[] {
  return [...segments]
    .sort(
      (a, b) =>
        TREND_RANK[a.trendDirection] - TREND_RANK[b.trendDirection] ||
        b.searchGrowthPct - a.searchGrowthPct
    )
    .slice(0, count);
}

function formatValue(value: number, unit: BenchmarkRow["definition"]["unit"]): string {
  if (unit === "%") return `${value}%`;
  if (unit === "$") return `$${value}`;
  return `${value}`;
}

async function loadDeepDive(destination: Destination, competitor: Destination) {
  const [destSegments, competitorSegments, rows] = await Promise.all([
    getTrendRadar(destination),
    getTrendRadar(competitor),
    getBenchmarkComparison(destination, [competitor]),
  ]);
  return { destSegments, competitorSegments, rows };
}

function SegmentColumn({ title, segments }: { title: string; segments: Segment[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-muted">{title}</h3>
      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{s.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tabular-nums">
                {s.searchGrowthPct > 0 ? "+" : ""}
                {s.searchGrowthPct}%
              </span>
              <TrendBadge direction={s.trendDirection} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeepDiveBody({
  destination,
  competitor,
  bundlePromise,
}: {
  destination: Destination;
  competitor: Destination;
  bundlePromise: ReturnType<typeof loadDeepDive>;
}) {
  const { destSegments, competitorSegments, rows } = use(bundlePromise);

  const leads = rows.filter((r) => r.position === "leads").length;
  const lags = rows.filter((r) => r.position === "lags").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-rising tabular-nums">{leads}</div>
          <div className="mt-1 text-xs text-muted">metrics {destination.name} leads on</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
          <div className="text-3xl font-bold tabular-nums text-muted">
            {rows.length - leads - lags}
          </div>
          <div className="mt-1 text-xs text-muted">metrics matched</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-declining tabular-nums">{lags}</div>
          <div className="mt-1 text-xs text-muted">metrics {competitor.name} leads on</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SegmentColumn title={`${destination.name} — top momentum`} segments={topSegments(destSegments)} />
        <SegmentColumn title={`${competitor.name} — top momentum`} segments={topSegments(competitorSegments)} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted">Metric</th>
              <th className="min-w-[140px] bg-accent/10 px-4 py-3 text-left font-semibold">
                {destination.name}
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left font-medium text-muted">
                {competitor.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.definition.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.definition.name}</div>
                  <div className="text-xs text-muted">{row.definition.description}</div>
                </td>
                <td className="bg-accent/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                      {formatValue(row.clientValue, row.definition.unit)}
                    </span>
                    <BenchmarkPositionBadge position={row.position} />
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {formatValue(row.competitorValues[0]?.value ?? 0, row.definition.unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompetitorDeepDiveContent({
  destination,
  competitors,
}: {
  destination: Destination;
  competitors: Destination[];
}) {
  const [selectedId, setSelectedId] = useState(competitors[0]?.id);
  const competitor = competitors.find((c) => c.id === selectedId) ?? competitors[0];

  const bundlePromise = useMemo(
    () => loadDeepDive(destination, competitor),
    [destination, competitor]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Competitor Deep-Dive
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {destination.name} vs. {competitor.name}
          </h1>
        </div>

        {competitors.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {competitors.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  c.id === competitor.id
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface text-muted hover:text-foreground"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={<div className="py-24 text-center text-sm text-muted">Loading comparison…</div>}>
        <DeepDiveBody
          destination={destination}
          competitor={competitor}
          bundlePromise={bundlePromise}
          key={`${destination.id}::${competitor.id}`}
        />
      </Suspense>
    </div>
  );
}

export default function CompetitorDeepDivePage() {
  return (
    <RequireDestination>
      {({ destination, competitors }) =>
        competitors.length === 0 ? (
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
              Add at least one competitor destination from the{" "}
              <Link href="/" className="text-accent hover:underline">
                landing page
              </Link>{" "}
              to unlock the deep-dive.
            </div>
          </div>
        ) : (
          <CompetitorDeepDiveContent destination={destination} competitors={competitors} />
        )
      }
    </RequireDestination>
  );
}
