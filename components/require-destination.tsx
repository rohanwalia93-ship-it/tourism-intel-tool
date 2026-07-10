"use client";

import Link from "next/link";
import { useSelection } from "@/lib/selection-context";
import type { Destination } from "@/lib/types";

export function RequireDestination({
  children,
}: {
  children: (selection: { destination: Destination; competitors: Destination[] }) => React.ReactNode;
}) {
  const { destination, competitors, hasSelection } = useSelection();

  if (!hasSelection || !destination) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">No destination selected</h1>
        <p className="max-w-md text-sm text-muted">
          Select a destination and comparable competitors to unlock the dashboard.
        </p>
        <Link
          href="/"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Choose a destination
        </Link>
      </div>
    );
  }

  return <>{children({ destination, competitors })}</>;
}
