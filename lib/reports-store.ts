"use client";

import { useSyncExternalStore } from "react";
import type { Destination, SavedReport } from "@/lib/types";

// A small external store (same pattern as lib/selection-context.tsx) that
// keeps a history of destination analyses in localStorage, so the Saved
// Reports page can list them without a backend.

const STORAGE_KEY = "tmi:reports";
const MAX_REPORTS = 20;

function load(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedReport[];
  } catch {
    // ignore malformed storage
  }
  return [];
}

let reports: SavedReport[] = typeof window !== "undefined" ? load() : [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SavedReport[] {
  return reports;
}

function getServerSnapshot(): SavedReport[] {
  return [];
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function saveReport(destination: Destination, competitors: Destination[]) {
  const existing = reports.find((r) => r.destination.id === destination.id);
  const entry: SavedReport = {
    id: existing?.id ?? `${destination.id}-${Date.now()}`,
    destination,
    competitors,
    savedAt: Date.now(),
  };
  reports = [entry, ...reports.filter((r) => r.destination.id !== destination.id)].slice(
    0,
    MAX_REPORTS
  );
  persist();
  emit();
}

export function removeReport(id: string) {
  reports = reports.filter((r) => r.id !== id);
  persist();
  emit();
}

export function useSavedReports(): SavedReport[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
