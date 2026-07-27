"use client";

import { useSyncExternalStore } from "react";
import type { DestinationId } from "@/lib/types";

// Small external store for the selected Destination (Dubai | Abu Dhabi) and
// the currently focused event within the Events category, persisted to
// localStorage so both survive navigation between the compass Home screen,
// the category dashboard, the Scenario Simulator, and the Insight Report.

interface SelectionState {
  destination: DestinationId | null;
  focusedEventId: string | null;
}

const STORAGE_KEY = "tmi:selection";
const EMPTY_STATE: SelectionState = { destination: null, focusedEventId: null };

function load(): SelectionState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<SelectionState>) };
  } catch {
    // ignore malformed storage
  }
  return EMPTY_STATE;
}

let state: SelectionState = typeof window !== "undefined" ? load() : EMPTY_STATE;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SelectionState {
  return state;
}

function getServerSnapshot(): SelectionState {
  return EMPTY_STATE;
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function setDestination(next: DestinationId) {
  state = { destination: next, focusedEventId: null };
  persist();
  emit();
}

export function setFocusedEvent(eventId: string) {
  state = { ...state, focusedEventId: eventId };
  persist();
  emit();
}

export function useDestination(): DestinationId | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).destination;
}

export function useFocusedEventId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).focusedEventId;
}
