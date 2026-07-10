"use client";

import { Suspense, use, useMemo } from "react";
import clsx from "clsx";
import { RequireDestination } from "@/components/require-destination";
import { BenchmarkPositionBadge } from "@/components/benchmark-position-badge";
import { buildBenchmarkTakeaway, getBenchmarkComparison, type BenchmarkRow } from "@/lib/data";
import type { Destination } from "@/lib/types";

function formatValue(value: number, unit: BenchmarkRow["definition"]["unit"]): string {
  if (unit === "%") return `${value}%`;
  if (unit === "$") return `$${value}`;
  return `${value}`;
}

function BenchmarkTable({
  destination,
  competitors,
  rowsPromise,
}: {
  destination: Destination;
  competitors: Destination[];
  rowsPromise: Promise<BenchmarkRow[]>;
}) {
  const rows = use(rowsPromise);

  return (
    <>
      <div className="mb-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted">Metric</th>
              <th className="min-w-[140px] bg-accent/5 px-4 py-3 text-left font-semibold">
                {destination.name}
              </th>
              {competitors.map((c) => (
                <th key={c.id} className="min-w-[120px] px-4 py-3 text-left font-medium text-muted">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.definition.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.definition.name}</div>
                  <div className="text-xs text-muted">{row.definition.description}</div>
                </td>
                <td className="bg-accent/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                      {formatValue(row.clientValue, row.definition.unit)}
                    </span>
                    <BenchmarkPositionBadge position={row.position} />
                  </div>
                </td>
                {row.competitorValues.map((cv) => (
                  <td key={cv.destination.id} className="px-4 py-3 tabular-nums text-muted">
                    {formatValue(cv.value, row.definition.unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["leads", "matches", "lags"] as const).map((position) => {
          const count = rows.filter((r) => r.position === position).length;
          return (
            <div key={position} className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
              <div
                className={clsx(
                  "text-2xl font-bold tabular-nums",
                  position === "leads" && "text-rising",
                  position === "lags" && "text-declining",
                  position === "matches" && "text-muted"
                )}
              >
                {count}
              </div>
              <div className="text-xs capitalize text-muted">metrics {position}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold">Takeaway</h2>
        <p className="text-sm leading-relaxed text-muted">{buildBenchmarkTakeaway(destination, rows)}</p>
      </div>
    </>
  );
}

function BenchmarkingContent({
  destination,
  competitors,
}: {
  destination: Destination;
  competitors: Destination[];
}) {
  const rowsPromise = useMemo(
    () => getBenchmarkComparison(destination, competitors),
    [destination, competitors]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Destination Benchmarking
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {destination.name} vs. {competitors.length > 0 ? "regional competitors" : "no competitors selected"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Positioning across the metrics that matter most for destination strategy: growth,
          segment strength, pricing power, sentiment, demand, and loyalty.
        </p>
      </div>

      {competitors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          Add 2–4 competitor destinations from the landing page to unlock benchmarking.
        </div>
      ) : (
        <Suspense fallback={<div className="py-24 text-center text-sm text-muted">Loading benchmarks…</div>}>
          <BenchmarkTable
            destination={destination}
            competitors={competitors}
            rowsPromise={rowsPromise}
            key={destination.id}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function BenchmarkingPage() {
  return (
    <RequireDestination>
      {({ destination, competitors }) => (
        <BenchmarkingContent destination={destination} competitors={competitors} />
      )}
    </RequireDestination>
  );
}
