import clsx from "clsx";
import type { TrendDirection } from "@/lib/types";

const STYLES: Record<TrendDirection, { label: string; className: string; dot: string }> = {
  rising: {
    label: "Rising",
    className: "bg-rising-soft text-rising",
    dot: "bg-rising",
  },
  peaking: {
    label: "Peaking",
    className: "bg-peaking-soft text-peaking",
    dot: "bg-peaking",
  },
  declining: {
    label: "Declining",
    className: "bg-declining-soft text-declining",
    dot: "bg-declining",
  },
};

export function TrendBadge({ direction }: { direction: TrendDirection }) {
  const style = STYLES[direction];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        style.className
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
