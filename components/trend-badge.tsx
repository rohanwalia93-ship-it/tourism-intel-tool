import type { TrendDirection } from "@/lib/types";

const STYLES: Record<TrendDirection, { label: string; color: string }> = {
  rising: { label: "Rising", color: "var(--signal-positive)" },
  peaking: { label: "Peaking", color: "var(--accent-brass)" },
  declining: { label: "Declining", color: "var(--signal-risk)" },
};

export function TrendBadge({ direction }: { direction: TrendDirection }) {
  const style = STYLES[direction];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-medium"
      style={{ color: style.color, borderColor: style.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {style.label}
    </span>
  );
}
