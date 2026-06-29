"use client";

import type { RatingItem } from "@/types/analysis";

const categoryColors: Record<string, string> = {
  "Code Quality": "var(--accent)",
  Architecture: "var(--accent)",
  Performance: "#eab308",
  "Error Handling": "#f97316",
  Documentation: "#3b82f6",
  Testing: "#8b5cf6",
  Security: "#ef4444",
};

function getScoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "var(--accent)";
  if (pct >= 0.5) return "#eab308";
  return "#ef4444";
}

export default function RatingCard({ ratings }: { ratings: RatingItem[] }) {
  if (!ratings || ratings.length === 0) return null;

  const overall =
    ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--bg-border)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Project Score
        </h2>
        <span
          className="text-lg font-bold font-mono"
          style={{ color: getScoreColor(overall, 10) }}
        >
          {overall.toFixed(1)}
          <span className="text-[11px] text-[var(--text-muted)] font-normal">
            /10
          </span>
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ratings.map((r) => {
          const pct = (r.score / r.maxScore) * 100;
          const color = categoryColors[r.category] ?? "var(--accent)";

          return (
            <div key={r.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  {r.category}
                </span>
                <span
                  className="font-mono font-semibold"
                  style={{ color: getScoreColor(r.score, r.maxScore) }}
                >
                  {r.score}/{r.maxScore}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: color,
                  }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                {r.reason}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
