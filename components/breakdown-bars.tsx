import type { NicheScoreBreakdown } from "@/lib/types";

const ROWS: { key: keyof NicheScoreBreakdown; label: string }[] = [
  { key: "demandGrowth", label: "Demand Growth" },
  { key: "competitiveSaturation", label: "Competitive Saturation" },
  { key: "sentiment", label: "Sentiment" },
];

export function BreakdownBars({ breakdown }: { breakdown: NicheScoreBreakdown }) {
  return (
    <div className="space-y-3">
      {ROWS.map((row) => (
        <div key={row.key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-muted">{row.label}</span>
            <span className="font-semibold tabular-nums">{breakdown[row.key]}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${breakdown[row.key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
