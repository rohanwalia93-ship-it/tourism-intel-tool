"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSelection } from "@/lib/selection-context";

const NAV_LINKS = [
  { href: "/trends", label: "Trend Radar" },
  { href: "/opportunity", label: "Opportunity Score" },
  { href: "/benchmarking", label: "Benchmarking" },
];

export function NavBar() {
  const pathname = usePathname();
  const { destination, hasSelection } = useSelection();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
            T
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Tourism Market Intelligence
          </span>
        </Link>

        {hasSelection && (
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:bg-background hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3 text-sm">
          {hasSelection && destination ? (
            <>
              <span className="hidden text-muted sm:inline">Destination</span>
              <span className="rounded-full border border-border bg-background px-3 py-1 font-medium">
                {destination.name}
              </span>
              <Link href="/" className="text-accent hover:underline">
                Change
              </Link>
            </>
          ) : (
            <Link href="/" className="text-accent hover:underline">
              Select a destination
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
