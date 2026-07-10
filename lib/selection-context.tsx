"use client";

import { useSyncExternalStore } from "react";
import type { Destination } from "@/lib/types";

// A tiny external store (not React Context) so destination + competitor
// selection is shared across every route without prop drilling, and
// persisted to localStorage. Using `useSyncExternalStore` instead of
// `useEffect` + `useState` avoids the hydrate-from-localStorage effect
// entirely — the store loads synchronously on the client and React handles
// the server/client snapshot difference for us.

interface SelectionState {
  destination: Destination | null;
  competitors: Destination[];
}

const STORAGE_KEY = "tmi:selection";
const EMPTY_STATE: SelectionState = { destination: null, competitors: [] };

function loadFromStorage(): SelectionState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SelectionState;
      if (parsed.destination) return parsed;
    }
  } catch {
    // ignore malformed storage
  }
  return EMPTY_STATE;
}

let state: SelectionState = typeof window !== "undefined" ? loadFromStorage() : EMPTY_STATE;
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

function setSelectionStore(destination: Destination, competitors: Destination[]) {
  state = { destination, competitors };
  persist();
  emit();
}

function clearSelectionStore() {
  state = EMPTY_STATE;
  persist();
  emit();
}

export function useSelection() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    destination: snapshot.destination,
    competitors: snapshot.competitors,
    hasSelection: snapshot.destination !== null,
    setSelection: setSelectionStore,
    clearSelection: clearSelectionStore,
  };
}
