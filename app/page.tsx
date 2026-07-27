import { CompassSelector } from "@/components/compass-selector";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Dubai · Abu Dhabi
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Tourism Market Intelligence
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-text-muted">
          Choose a destination, then a category — Events, Attractions, Accommodation, or MICE.
          Every signal, score, and benchmark below reconfigures to match.
        </p>
      </div>

      <CompassSelector />
    </div>
  );
}
