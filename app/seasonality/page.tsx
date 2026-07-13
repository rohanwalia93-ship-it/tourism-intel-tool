"use client";

import { Suspense, use, useMemo } from "react";
import { RequireDestination } from "@/components/require-destination";
import { SeasonalityHeatmap } from "@/components/seasonality-heatmap";
import { getSeasonality } from "@/lib/data";
import { MONTH_LABELS } from "@/lib/mock-data/seasonality";
import type { Destination, SeasonalitySeries } from "@/lib/types";

function SeasonalityBody({ seriesPromise }: { seriesPromise: Promise<SeasonalitySeries[]> }) {
  const series = use(seriesPromise);

  const monthlyAverages = useMemo(() => {
    return MONTH_LABELS.map((label, monthIndex) => {
      const avg =
        series.reduce((sum, s) => sum + s.months[monthIndex], 0) / Math.max(1, series.length);
      return { label, avg: Math.round(avg) };
    });
  }, [series]);

  const peak = useMemo(
    () => monthlyAverages.reduce((best, m) => (m.avg > best.avg ? m : best), monthlyAverages[0]),
    [monthlyAverages]
  );
  const quiet = useMemo(
    () => monthlyAverages.reduce((worst, m) => (m.avg < worst.avg ? m : worst), monthlyAverages[0]),
    [monthlyAverages]
  );
  const segmentsPeakingInPeakMonth = useMemo(() => {
    const peakIndex = MONTH_LABELS.indexOf(peak.label as (typeof MONTH_LABELS)[number]);
    return series.filter((s) => {
      const rowPeak = s.months.reduce(
        (best, value, index) => (value > s.months[best] ? index : best),
        0
      );
      return rowPeak === peakIndex;
    }).length;
  }, [series, peak]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-rising">{peak.label}</div>
          <div className="mt-1 text-xs text-muted">Peak month, {peak.avg}/100 avg demand</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-declining">{quiet.label}</div>
          <div className="mt-1 text-xs text-muted">Quietest month, {quiet.avg}/100 avg demand</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-accent">{segmentsPeakingInPeakMonth}</div>
          <div className="mt-1 text-xs text-muted">of {series.length} segments peak in {peak.label}</div>
        </div>
      </div>

      <SeasonalityHeatmap series={series} />
    </div>
  );
}

function SeasonalityContent({ destination }: { destination: Destination }) {
  const seriesPromise = useMemo(() => getSeasonality(destination), [destination]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Seasonality Calendar
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          When demand peaks in {destination.name}
        </h1>
      </div>

      <Suspense fallback={<div className="py-24 text-center text-sm text-muted">Loading calendar…</div>}>
        <SeasonalityBody seriesPromise={seriesPromise} key={destination.id} />
      </Suspense>
    </div>
  );
}

export default function SeasonalityPage() {
  return (
    <RequireDestination>
      {({ destination }) => <SeasonalityContent destination={destination} />}
    </RequireDestination>
  );
}
