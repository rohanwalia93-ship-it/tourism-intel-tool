import type { Segment } from "@/lib/types";
import { TrendBadge } from "@/components/trend-badge";
import { Sparkline } from "@/components/sparkline";

export function SegmentCard({ segment, onClick }: { segment: Segment; onClick?: () => void }) {
  const growthLabel = `${segment.searchGrowthPct > 0 ? "+" : ""}${segment.searchGrowthPct}%`;

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 text-left shadow-sm transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">{segment.name}</h3>
        <TrendBadge direction={segment.trendDirection} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-3xl font-bold tabular-nums">{growthLabel}</div>
          <div className="text-xs text-muted">search growth YoY</div>
        </div>
        <Sparkline data={segment.bookingVolumeTrend} direction={segment.trendDirection} />
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted">{segment.whySummary}</p>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
        <span>{segment.socialMentionVolume.toLocaleString()} social mentions / 30d</span>
        <span className="font-medium text-accent">View details →</span>
      </div>
    </button>
  );
}
