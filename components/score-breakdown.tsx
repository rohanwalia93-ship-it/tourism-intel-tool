import clsx from "clsx";
import type { ScoreComponent } from "@/lib/types";

export function ScoreBreakdown({
  breakdown,
  tone,
}: {
  breakdown: ScoreComponent[];
  tone: "positive" | "risk";
}) {
  const color = tone === "positive" ? "var(--signal-positive)" : "var(--signal-risk)";

  return (
    <div className="space-y-3">
      {breakdown.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-text-muted">
              {item.label} <span className="text-text-muted/70">· {item.weightPct}%</span>
            </span>
            <span className={clsx("font-mono font-semibold")} style={{ color }}>
              {item.score}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-panel-raised">
            <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
