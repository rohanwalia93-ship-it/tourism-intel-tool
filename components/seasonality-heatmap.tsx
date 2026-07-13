import type { SeasonalitySeries } from "@/lib/types";
import { MONTH_LABELS } from "@/lib/mock-data/seasonality";

export function SeasonalityHeatmap({ series }: { series: SeasonalitySeries[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-muted">Segment</th>
            {MONTH_LABELS.map((label) => (
              <th key={label} className="w-14 py-3 text-center text-xs font-medium text-muted">
                {label}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-medium text-muted">Peak</th>
          </tr>
        </thead>
        <tbody>
          {series.map((row) => {
            const peakIndex = row.months.reduce(
              (best, value, index) => (value > row.months[best] ? index : best),
              0
            );
            return (
              <tr key={row.segmentKey} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium">{row.segmentName}</td>
                {row.months.map((value, index) => (
                  <td key={index} className="p-1">
                    <div
                      title={`${row.segmentName} — ${MONTH_LABELS[index]}: ${value}/100`}
                      className="mx-auto h-7 w-7 rounded-sm"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--accent) ${value}%, var(--background))`,
                      }}
                    />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-xs font-semibold text-accent">
                  {MONTH_LABELS[peakIndex]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted">
        <span>Low demand</span>
        <div className="flex h-2.5 w-32 overflow-hidden rounded-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                backgroundColor: `color-mix(in srgb, var(--accent) ${(i + 1) * 10}%, var(--background))`,
              }}
            />
          ))}
        </div>
        <span>Peak demand</span>
      </div>
    </div>
  );
}
