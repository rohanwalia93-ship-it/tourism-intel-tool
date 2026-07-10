"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { DESTINATIONS, searchDestinations, suggestCompetitors } from "@/lib/mock-data/destinations";
import { useSelection } from "@/lib/selection-context";
import type { Destination } from "@/lib/types";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveFreeTextDestination(input: string): Destination {
  const trimmed = input.trim();
  const known = DESTINATIONS.find((d) => d.name.toLowerCase() === trimmed.toLowerCase());
  if (known) return known;
  return {
    id: slugify(trimmed),
    name: trimmed,
    country: "Unspecified",
    region: "Middle East",
    blurb: "Custom destination — comparisons use generated market signals.",
    isCustom: true,
  };
}

const MAX_COMPETITORS = 4;

export default function LandingPage() {
  const router = useRouter();
  const { setSelection } = useSelection();

  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [competitors, setCompetitors] = useState<Destination[]>([]);
  const [competitorPickerQuery, setCompetitorPickerQuery] = useState("");

  const suggestions = useMemo(() => {
    if (destination || !query.trim()) return [];
    return searchDestinations(query, 6);
  }, [query, destination]);

  const competitorCandidates = useMemo(() => {
    const pool = DESTINATIONS.filter(
      (d) => d.id !== destination?.id && !competitors.some((c) => c.id === d.id)
    );
    if (!competitorPickerQuery.trim()) return pool.slice(0, 6);
    const q = competitorPickerQuery.trim().toLowerCase();
    return pool.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 6);
  }, [destination, competitors, competitorPickerQuery]);

  function chooseDestination(d: Destination) {
    setDestination(d);
    setQuery(d.name);
    setCompetitors(suggestCompetitors(d, 3));
  }

  function applyCustomDestination() {
    if (!query.trim()) return;
    const custom = resolveFreeTextDestination(query);
    chooseDestination(custom);
  }

  function resetDestination() {
    setDestination(null);
    setQuery("");
    setCompetitors([]);
  }

  function addCompetitor(d: Destination) {
    if (competitors.length >= MAX_COMPETITORS) return;
    setCompetitors((prev) => [...prev, d]);
    setCompetitorPickerQuery("");
  }

  function removeCompetitor(id: string) {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  }

  function autoSuggestCompetitors() {
    if (!destination) return;
    setCompetitors(suggestCompetitors(destination, 3));
  }

  function proceed() {
    if (!destination) return;
    setSelection(destination, competitors);
    router.push("/trends");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
          Tourism Market Intelligence
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Understand what&apos;s next for your destination
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Pick your destination and a handful of comparable competitors. Every trend, score, and
          benchmark in the dashboard is generated relative to your selection.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold">1. Your destination</label>
          {destination ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <div>
                <div className="font-medium">{destination.name}</div>
                <div className="text-xs text-muted">
                  {destination.isCustom ? "Custom destination" : destination.country}
                </div>
              </div>
              <button
                onClick={resetDestination}
                className="text-sm font-medium text-accent hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (suggestions.length > 0) {
                      chooseDestination(suggestions[0]);
                    } else {
                      applyCustomDestination();
                    }
                  }
                }}
                placeholder="Type any destination — e.g. Dubai, Bali, or your own city"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-accent/30 placeholder:text-muted focus:ring-2"
                autoFocus
              />
              {query.trim() && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-md">
                  {suggestions.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => chooseDestination(d)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-background"
                    >
                      <span className="font-medium">{d.name}</span>
                      <span className="text-xs text-muted">{d.country}</span>
                    </button>
                  ))}
                  <button
                    onClick={applyCustomDestination}
                    className="flex w-full items-center gap-1 border-t border-border px-4 py-2.5 text-left text-sm text-accent hover:bg-background"
                  >
                    Use &ldquo;{query.trim()}&rdquo; as a custom destination
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold">
              2. Comparable competitor destinations{" "}
              <span className="font-normal text-muted">(2–4, optional)</span>
            </label>
            {destination && (
              <button
                onClick={autoSuggestCompetitors}
                className="text-xs font-medium text-accent hover:underline"
              >
                Auto-suggest
              </button>
            )}
          </div>

          {!destination ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
              Select a destination first to see suggested competitors.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {competitors.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                  >
                    {c.name}
                    <button
                      onClick={() => removeCompetitor(c.id)}
                      aria-label={`Remove ${c.name}`}
                      className="text-muted hover:text-declining"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {competitors.length === 0 && (
                  <span className="text-sm text-muted">No competitors selected yet.</span>
                )}
              </div>

              {competitors.length < MAX_COMPETITORS && (
                <div className="relative">
                  <input
                    value={competitorPickerQuery}
                    onChange={(e) => setCompetitorPickerQuery(e.target.value)}
                    placeholder="Add another comparable destination…"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none ring-accent/30 placeholder:text-muted focus:ring-2"
                  />
                  {competitorPickerQuery.trim() && competitorCandidates.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-md">
                      {competitorCandidates.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => addCompetitor(d)}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-background"
                        >
                          <span className="font-medium">{d.name}</span>
                          <span className="text-xs text-muted">{d.region}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={proceed}
          disabled={!destination}
          className={clsx(
            "mt-8 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
            destination
              ? "bg-accent text-accent-foreground hover:opacity-90"
              : "cursor-not-allowed bg-border text-muted"
          )}
        >
          View Trend Radar for {destination ? destination.name : "your destination"}
        </button>
      </div>
    </div>
  );
}
