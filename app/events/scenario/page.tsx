"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { RequireDestination } from "@/components/require-destination";
import { RadarDial } from "@/components/radar-dial";
import { useFocusedEvent } from "@/lib/use-focused-event";
import { applyScenario, computeOpportunity, computeRisk } from "@/lib/events-engine";
import { DEFAULT_SCENARIO_ADJUSTMENTS, type DestinationId, type EventScenarioAdjustments } from "@/lib/types";

function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-mono text-sm font-semibold text-brass">
          {value > 0 ? "+" : ""}
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent-brass)]"
      />
      <div className="mt-1 flex justify-between font-mono text-xs text-text-muted">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ScenarioContent({ destination }: { destination: DestinationId }) {
  const { focusedEvent } = useFocusedEvent(destination);
  const [adjustments, setAdjustments] = useState<EventScenarioAdjustments>(DEFAULT_SCENARIO_ADJUSTMENTS);

  const baselineOpportunity = useMemo(() => computeOpportunity(focusedEvent), [focusedEvent]);
  const baselineRisk = useMemo(() => computeRisk(focusedEvent), [focusedEvent]);

  const adjustedEvent = useMemo(() => applyScenario(focusedEvent, adjustments), [focusedEvent, adjustments]);
  const opportunity = useMemo(() => computeOpportunity(adjustedEvent), [adjustedEvent]);
  const risk = useMemo(() => computeRisk(adjustedEvent), [adjustedEvent]);

  const opportunityDelta = opportunity.score - baselineOpportunity.score;
  const riskDelta = risk.score - baselineRisk.score;

  function update<K extends keyof EventScenarioAdjustments>(key: K, value: EventScenarioAdjustments[K]) {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setAdjustments(DEFAULT_SCENARIO_ADJUSTMENTS);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">Scenario Simulator</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">{focusedEvent.name}</h1>
        </div>
        <button
          onClick={reset}
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:border-text-muted hover:text-text-primary"
        >
          Reset to baseline
        </button>
      </div>

      <div className="mb-8 flex flex-col items-center gap-4 rounded-lg border border-border bg-bg-panel p-8">
        <RadarDial opportunity={opportunity.score} risk={risk.score} size={220} showAxisLabels />
        <div className="flex gap-6 font-mono text-xs text-text-muted">
          <span>
            Opportunity Δ{" "}
            <span style={{ color: opportunityDelta >= 0 ? "var(--signal-positive)" : "var(--signal-risk)" }}>
              {opportunityDelta > 0 ? "+" : ""}
              {opportunityDelta}
            </span>{" "}
            vs. baseline
          </span>
          <span>
            Risk Δ{" "}
            <span style={{ color: riskDelta <= 0 ? "var(--signal-positive)" : "var(--signal-risk)" }}>
              {riskDelta > 0 ? "+" : ""}
              {riskDelta}
            </span>{" "}
            vs. baseline
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <SliderControl
          label="Adjust ticket price"
          value={adjustments.ticketPriceChangePct}
          min={-30}
          max={30}
          unit="%"
          onChange={(v) => update("ticketPriceChangePct", v)}
        />
        <SliderControl
          label="Shift event date"
          value={adjustments.dateShiftWeeks}
          min={-6}
          max={6}
          unit="w"
          onChange={(v) => update("dateShiftWeeks", v)}
        />
        <SliderControl
          label="Adjust venue capacity"
          value={adjustments.capacityChangePct}
          min={-20}
          max={40}
          unit="%"
          onChange={(v) => update("capacityChangePct", v)}
        />

        <div className="flex items-center justify-between rounded-lg border border-border bg-bg-panel p-5">
          <label htmlFor="competing-event" className="text-sm font-medium">
            Competing event announced in the same window
          </label>
          <button
            id="competing-event"
            role="switch"
            aria-checked={adjustments.competingEventAnnounced}
            onClick={() => update("competingEventAnnounced", !adjustments.competingEventAnnounced)}
            className={clsx(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              adjustments.competingEventAnnounced ? "bg-brass" : "bg-bg-panel-raised"
            )}
          >
            <span
              className={clsx(
                "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-bg-primary transition-transform",
                adjustments.competingEventAnnounced ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScenarioSimulatorPage() {
  return <RequireDestination>{(destination) => <ScenarioContent destination={destination} />}</RequireDestination>;
}
