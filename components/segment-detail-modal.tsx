"use client";

import { useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { Segment } from "@/lib/types";
import { TrendBadge } from "@/components/trend-badge";

const STROKE: Record<Segment["trendDirection"], string> = {
  rising: "var(--rising)",
  peaking: "var(--peaking)",
  declining: "var(--declining)",
};

function weekLabel(index: number, total: number): string {
  const weeksAgo = total - 1 - index;
  return weeksAgo === 0 ? "Now" : `-${weeksAgo}w`;
}

export function SegmentDetailModal({
  segment,
  onClose,
}: {
  segment: Segment;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const history = segment.bookingVolumeTrend;
  const chartData = history.map((value, index) => ({
    label: weekLabel(index, history.length),
    value,
  }));
  const peakValue = Math.max(...history);
  const latestValue = history[history.length - 1];
  const firstValue = history[0];
  const periodChangePct = Math.round(((latestValue - firstValue) / Math.max(1, firstValue)) * 100);
  const color = STROKE[segment.trendDirection];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5">
              <TrendBadge direction={segment.trendDirection} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{segment.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted hover:bg-background hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <div className="text-lg font-bold tabular-nums">
              {segment.searchGrowthPct > 0 ? "+" : ""}
              {segment.searchGrowthPct}%
            </div>
            <div className="text-xs text-muted">search growth YoY</div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{latestValue}</div>
            <div className="text-xs text-muted">current index</div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{peakValue}</div>
            <div className="text-xs text-muted">12-week peak</div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <div className="text-lg font-bold tabular-nums">
              {periodChangePct > 0 ? "+" : ""}
              {periodChangePct}%
            </div>
            <div className="text-xs text-muted">vs. 12 weeks ago</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-muted">12-week booking volume trend</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 12 }}>
                <defs>
                  <linearGradient id="segmentDetailFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  interval={2}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                  labelStyle={{ color: "var(--muted)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill="url(#segmentDetailFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted">Why this is happening</h3>
          <p className="text-sm leading-relaxed">{segment.whySummary}</p>
        </div>

        <div className="mt-4 border-t border-border pt-3 text-xs text-muted">
          {segment.socialMentionVolume.toLocaleString()} social mentions / 30d
        </div>
      </div>
    </div>
  );
}
