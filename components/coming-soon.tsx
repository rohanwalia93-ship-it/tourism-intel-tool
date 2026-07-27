import Link from "next/link";

export function ComingSoon({ category, tagline }: { category: string; tagline: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">Coming soon</p>
      <h1 className="font-display text-2xl font-bold tracking-tight">{category}</h1>
      <p className="text-sm text-text-muted">
        {tagline} — this category shares the same schema as Events (Part A.3) and is next in line to
        be built end-to-end: Trend Radar, Opportunity Score, Risk Radar, Benchmarking, and Regulatory
        Pulse, reconfigured for {category.toLowerCase()}.
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
