"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelection } from "@/lib/selection-context";
import { removeReport, useSavedReports } from "@/lib/reports-store";

function formatRelativeTime(timestampMs: number): string {
  const diffMs = Date.now() - timestampMs;
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return new Date(timestampMs).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function SavedReportsPage() {
  const router = useRouter();
  const { setSelection } = useSelection();
  const reports = useSavedReports();

  function open(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    setSelection(report.destination, report.competitors);
    router.push("/trends");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Saved Reports</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Your past analyses</h1>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          No saved reports yet. Analyses are saved automatically each time you{" "}
          <Link href="/" className="text-accent hover:underline">
            pick a destination
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div>
                <h3 className="text-base font-semibold">{report.destination.name}</h3>
                <p className="text-xs text-muted">{formatRelativeTime(report.savedAt)}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {report.competitors.length === 0 ? (
                  <span className="text-xs text-muted">No competitors selected</span>
                ) : (
                  report.competitors.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted"
                    >
                      {c.name}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-sm">
                <button
                  onClick={() => open(report.id)}
                  className="font-medium text-accent hover:underline"
                >
                  Open
                </button>
                <button
                  onClick={() => removeReport(report.id)}
                  className="font-medium text-muted hover:text-declining"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
