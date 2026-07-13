"use client";

import { Suspense, use, useMemo, useState } from "react";
import clsx from "clsx";
import { RequireDestination } from "@/components/require-destination";
import { SegmentCard } from "@/components/segment-card";
import { getTrendRadar } from "@/lib/data";
import type { Destination, Segment, TrendDirection } from "@/lib/types";

type FilterOption = "all" | TrendDirection;
type SortOption = "ranked" | "growth" | "name";

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "rising", label: "Rising" },
  { value: "peaking", label: "Peaking" },
  { value: "declining", label: "Declining" },
];

const TREND_RANK: Record<TrendDirection, number> = { rising: 0, peaking: 1, declining: 2 };

function SegmentGrid({ segmentsPromise }: { segmentsPromise: Promise<Segment[]> }) {
  const segments = use(segmentsPromise);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("ranked");

  const visibleSegments = useMemo(() => {
    const filtered = filter === "all" ? segments : segments.filter((s) => s.trendDirection === filter);

    const sorted = [...filtered];
    if (sort === "ranked") {
      sorted.sort(
        (a, b) =>
          TREND_RANK[a.trendDirection] - TREND_RANK[b.trendDirection] ||
          b.searchGrowthPct - a.searchGrowthPct
      );
    } else if (sort === "growth") {
      sorted.sort((a, b) => b.searchGrowthPct - a.searchGrowthPct);
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [segments, filter, sort]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none"
          >
            <option value="ranked">Trend ranking</option>
            <option value="growth">Search growth</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </label>
      </div>

      {visibleSegments.length === 0 ? (
        <div className="py-24 text-center text-sm text-muted">No segments match this filter.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSegments.map((segment) => (
            <SegmentCard key={segment.id} segment={segment} />
          ))}
        </div>
      )}
    </>
  );
}

function TrendRadarContent({ destination }: { destination: Destination }) {
  const segmentsPromise = useMemo(() => getTrendRadar(destination), [destination]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Trend Radar</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Tourism segments for {destination.name}
        </h1>
        <p className="mt-1 text-sm text-muted">Ranked by momentum, highest first.</p>
      </div>

      <Suspense fallback={<div className="py-24 text-center text-sm text-muted">Loading segments…</div>}>
        <SegmentGrid segmentsPromise={segmentsPromise} key={destination.id} />
      </Suspense>
    </div>
  );
}

export default function TrendRadarPage() {
  return (
    <RequireDestination>
      {({ destination }) => <TrendRadarContent destination={destination} />}
    </RequireDestination>
  );
}
