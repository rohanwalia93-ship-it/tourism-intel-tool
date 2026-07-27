"use client";

import { useMemo } from "react";
import { useFocusedEventId } from "@/lib/selection-context";
import { getEventsForDestination } from "@/lib/mock-data/events";
import type { DestinationId, EventRecord, TrendDirection } from "@/lib/types";

const TREND_RANK: Record<TrendDirection, number> = { rising: 0, peaking: 1, declining: 2 };

/** Ranked-by-momentum event list plus the currently focused event, falling
 * back to the top-ranked event when nothing has been focused yet. Shared by
 * the dashboard, Scenario Simulator, and Insight Report so all three agree
 * on "which event" without duplicating the ranking logic. */
export function useFocusedEvent(destination: DestinationId): {
  focusedEvent: EventRecord;
  rankedEvents: EventRecord[];
} {
  const focusedEventId = useFocusedEventId();
  const events = useMemo(() => getEventsForDestination(destination), [destination]);
  const rankedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => TREND_RANK[a.trendDirection] - TREND_RANK[b.trendDirection] || b.buzzVelocity - a.buzzVelocity
      ),
    [events]
  );
  const focusedEvent = useMemo(
    () => events.find((e) => e.id === focusedEventId) ?? rankedEvents[0],
    [events, rankedEvents, focusedEventId]
  );
  return { focusedEvent, rankedEvents };
}
