"use client";

import Link from "next/link";
import { useDestination } from "@/lib/selection-context";
import type { DestinationId } from "@/lib/types";

export function RequireDestination({
  children,
}: {
  children: (destination: DestinationId) => React.ReactNode;
}) {
  const destination = useDestination();

  if (!destination) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="font-display text-xl font-semibold">No destination selected</h1>
        <p className="text-sm text-text-muted">
          Return to the compass and choose Dubai or Abu Dhabi to continue.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-brass px-5 py-2.5 font-display text-sm font-semibold text-brass-foreground hover:opacity-90"
        >
          Back to compass
        </Link>
      </div>
    );
  }

  return <>{children(destination)}</>;
}
