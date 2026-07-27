import type { BenchmarkMetricRow } from "@/lib/types";

const POSITION_STYLE: Record<BenchmarkMetricRow["position"], { label: string; color: string; arrow: string }> = {
  leads: { label: "Leads", color: "var(--signal-positive)", arrow: "↑" },
  lags: { label: "Lags", color: "var(--signal-risk)", arrow: "↓" },
  matches: { label: "Matches", color: "var(--text-muted)", arrow: "→" },
};

function formatValue(value: number, unit: BenchmarkMetricRow["unit"]): string {
  if (unit === "%") return `${value}%`;
  if (unit === "days") return `${value}d`;
  return `${value}`;
}

export function BenchmarkTable({ focusLabel, rows }: { focusLabel: string; rows: BenchmarkMetricRow[] }) {
  const maxComparables = Math.max(0, ...rows.map((r) => r.comparableValues.length));

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-bg-panel">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-text-muted">Metric</th>
            <th className="min-w-[130px] bg-brass/10 px-4 py-3 text-left font-semibold">{focusLabel}</th>
            {Array.from({ length: maxComparables }).map((_, i) => (
              <th key={i} className="min-w-[110px] px-4 py-3 text-left font-medium text-text-muted">
                {rows[0]?.comparableValues[i]?.name ?? "—"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const style = POSITION_STYLE[row.position];
            return (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 text-text-muted">{row.label}</td>
                <td className="bg-brass/10 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{formatValue(row.focusValue, row.unit)}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-medium" style={{ color: style.color }}>
                      {style.arrow} {style.label}
                    </span>
                  </div>
                </td>
                {row.comparableValues.map((cv) => (
                  <td key={cv.name} className="px-4 py-2.5 font-mono text-text-muted">
                    {formatValue(cv.value, row.unit)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
