import type { RegulatoryItem } from "@/lib/types";

const IMPACT_STYLE: Record<RegulatoryItem["impact"], { label: string; color: string }> = {
  positive: { label: "Tailwind", color: "var(--signal-positive)" },
  negative: { label: "Headwind", color: "var(--signal-risk)" },
  neutral: { label: "Neutral", color: "var(--text-muted)" },
};

export function RegulatoryFeed({ items }: { items: RegulatoryItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-bg-panel px-4 py-6 text-center text-sm text-text-muted">
        No regulatory signals filed for this category and destination.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const style = IMPACT_STYLE[item.impact];
        return (
          <div key={item.id} className="rounded-lg border border-border bg-bg-panel p-4">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <span
                className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium"
                style={{ color: style.color, borderColor: style.color }}
              >
                {style.label}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-text-muted">{item.summary}</p>
            <p className="mt-2 font-mono text-xs text-text-muted">{item.dateLabel}</p>
          </div>
        );
      })}
    </div>
  );
}
