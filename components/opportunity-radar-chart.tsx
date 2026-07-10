"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { NicheScoreBreakdown } from "@/lib/types";

export function OpportunityRadarChart({ breakdown }: { breakdown: NicheScoreBreakdown }) {
  const data = [
    { metric: "Demand Growth", value: breakdown.demandGrowth },
    { metric: "Competitive", value: breakdown.competitiveSaturation },
    { metric: "Sentiment", value: breakdown.sentiment },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="58%" margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <Radar
            dataKey="value"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.25}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
