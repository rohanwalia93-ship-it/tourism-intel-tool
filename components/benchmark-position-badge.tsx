import clsx from "clsx";
import type { BenchmarkPosition } from "@/lib/types";

const STYLES: Record<BenchmarkPosition, { label: string; className: string; arrow: string }> = {
  leads: { label: "Leads", className: "text-rising", arrow: "↑" },
  lags: { label: "Lags", className: "text-declining", arrow: "↓" },
  matches: { label: "Matches", className: "text-muted", arrow: "→" },
};

export function BenchmarkPositionBadge({ position }: { position: BenchmarkPosition }) {
  const style = STYLES[position];
  return (
    <span className={clsx("inline-flex items-center gap-1 text-xs font-semibold", style.className)}>
      <span aria-hidden>{style.arrow}</span>
      {style.label}
    </span>
  );
}
