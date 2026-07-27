"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useDestination } from "@/lib/selection-context";
import { DESTINATIONS } from "@/lib/types";

const EVENTS_LINKS = [
  { href: "/events", label: "Dashboard" },
  { href: "/events/scenario", label: "Scenario Simulator" },
  { href: "/events/report", label: "Insight Report" },
];

export function NavBar() {
  const pathname = usePathname();
  const destinationId = useDestination();
  const destination = DESTINATIONS.find((d) => d.id === destinationId);
  const inEvents = pathname.startsWith("/events");

  return (
    <header className="no-print border-b border-border bg-bg-panel">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="13" cy="13" r="11.5" fill="none" stroke="var(--accent-brass)" strokeWidth="1" opacity="0.4" />
            <circle cx="13" cy="13" r="7.5" fill="none" stroke="var(--accent-brass)" strokeWidth="1" opacity="0.6" />
            <circle cx="13" cy="13" r="2.5" fill="var(--accent-brass)" />
            <line x1="13" y1="13" x2="13" y2="2.5" stroke="var(--accent-brass)" strokeWidth="1.5" />
          </svg>
          <span className="font-display text-sm font-semibold tracking-tight">
            Tourism Market Intelligence
          </span>
        </Link>

        {inEvents && (
          <nav className="flex items-center gap-1">
            {EVENTS_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brass text-brass-foreground"
                      : "text-text-muted hover:bg-bg-panel-raised hover:text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3 text-sm">
          {destination ? (
            <>
              <span className="hidden text-text-muted sm:inline">Destination</span>
              <span className="rounded-full border border-border bg-bg-panel-raised px-3 py-1 font-mono text-xs font-medium">
                {destination.name}
              </span>
              <Link href="/" className="text-brass hover:underline">
                Change
              </Link>
            </>
          ) : (
            <Link href="/" className="text-brass hover:underline">
              Select destination
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
