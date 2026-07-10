"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { TrendDirection } from "@/lib/types";

const STROKE: Record<TrendDirection, string> = {
  rising: "var(--rising)",
  peaking: "var(--peaking)",
  declining: "var(--declining)",
};

export function Sparkline({
  data,
  direction,
}: {
  data: number[];
  direction: TrendDirection;
}) {
  const points = data.map((value, index) => ({ index, value }));

  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={STROKE[direction]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
