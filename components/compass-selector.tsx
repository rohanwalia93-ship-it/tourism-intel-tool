"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { setDestination, useDestination } from "@/lib/selection-context";
import { CATEGORIES, DESTINATIONS, type CategoryId } from "@/lib/types";

const SIZE = 360;
const CENTER = SIZE / 2;
const BUTTON_RADIUS = 145;
const NEEDLE_LENGTH = 118;
const TICK_RADIUS = 168;

const ANGLES: Record<CategoryId, number> = {
  events: 0,
  attractions: 90,
  accommodation: 180,
  mice: 270,
};

// Rounded to 2dp: raw Math.sin/cos output can differ in the last few
// decimal places between server and client JS engines for non-axis-aligned
// angles, which otherwise trips a hydration mismatch on these SVG coordinates.
function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((CENTER + radius * Math.sin(rad)) * 100) / 100,
    y: Math.round((CENTER - radius * Math.cos(rad)) * 100) / 100,
  };
}

export function CompassSelector() {
  const router = useRouter();
  const destinationId = useDestination();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("events");

  const needleAngle = ANGLES[selectedCategory];
  const selectedCategoryInfo = CATEGORIES.find((c) => c.id === selectedCategory)!;

  const ticks = useMemo(
    () => Array.from({ length: 24 }).map((_, i) => (i * 360) / 24),
    []
  );

  function enterDashboard() {
    if (!destinationId || !selectedCategoryInfo.available) return;
    router.push("/events");
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-2 rounded-full border border-border bg-bg-panel p-1">
        {DESTINATIONS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDestination(d.id)}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              destinationId === d.id
                ? "bg-brass text-brass-foreground"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="relative" style={{ width: "min(360px, 90vw)", height: "min(360px, 90vw)" }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full">
          <circle cx={CENTER} cy={CENTER} r={TICK_RADIUS} fill="none" stroke="var(--border)" strokeWidth={1} />
          <circle cx={CENTER} cy={CENTER} r={BUTTON_RADIUS - 40} fill="none" stroke="var(--border)" strokeWidth={1} opacity={0.5} />

          {ticks.map((deg, i) => {
            const major = i % 6 === 0;
            const outer = pointOnCircle(deg, TICK_RADIUS);
            const inner = pointOnCircle(deg, TICK_RADIUS - (major ? 12 : 6));
            return (
              <line
                key={deg}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="var(--accent-brass)"
                strokeOpacity={major ? 0.7 : 0.3}
                strokeWidth={major ? 1.5 : 1}
              />
            );
          })}

          <g
            className="compass-ring"
            style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: `${CENTER}px ${CENTER}px` }}
          >
            <line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER - NEEDLE_LENGTH} stroke="var(--accent-brass)" strokeWidth={2} />
            <circle cx={CENTER} cy={CENTER - NEEDLE_LENGTH} r={4} fill="var(--accent-brass)" />
          </g>

          <circle cx={CENTER} cy={CENTER} r={6} fill="var(--bg-panel)" stroke="var(--accent-brass)" strokeWidth={2} />
        </svg>

        {CATEGORIES.map((category) => {
          const { x, y } = pointOnCircle(ANGLES[category.id], BUTTON_RADIUS);
          const active = category.id === selectedCategory;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                left: `${(x / SIZE) * 100}%`,
                top: `${(y / SIZE) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={clsx(
                "absolute flex w-24 flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-center transition-colors sm:w-32 sm:px-3 sm:py-2.5",
                active
                  ? "border-brass bg-bg-panel-raised"
                  : "border-border bg-bg-panel hover:border-text-muted",
                !category.available && "text-text-muted"
              )}
            >
              <span className="font-display text-xs font-semibold sm:text-sm">{category.name}</span>
              <span className="hidden text-[11px] leading-tight text-text-muted sm:block">{category.tagline}</span>
              {!category.available && (
                <span className="mt-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
                  Coming soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        {!destinationId ? (
          <p className="text-sm text-text-muted">Select a destination to activate the compass.</p>
        ) : !selectedCategoryInfo.available ? (
          <p className="text-sm text-text-muted">
            {selectedCategoryInfo.name} is not live yet — Events is the first category built end-to-end.
          </p>
        ) : (
          <button
            onClick={enterDashboard}
            className="rounded-lg bg-brass px-6 py-3 font-display text-sm font-semibold text-brass-foreground transition-opacity hover:opacity-90"
          >
            Enter {selectedCategoryInfo.name} Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}
