"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import SummaryCard from "@/components/analysis/SummaryCard";
import FolderTree from "@/components/analysis/FolderTree";
import SetupGuide from "@/components/analysis/SetupGuide";
import ArchitectureDiagram from "@/components/analysis/ArchitectureDiagram";
import RatingCard from "@/components/analysis/RatingCard";
import type { AnalysisResult } from "@/types/analysis";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] ${className ?? ""}`}
    />
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] mb-2.5 uppercase">
      {label}
    </p>
  );
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const repoUrl = searchParams.get("url");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rawFileTree, setRawFileTree] = useState<{ path: string; type: string }[] | null>(null);
  const [repoName, setRepoName] = useState("");
  const [isCached, setIsCached] = useState(false);

  const fetchAnalysis = (force = false) => {
    setLoading(true);
    setError(null);

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl, force }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to analyze repository");
        return data;
      })
      .then((data) => {
        setAnalysis(data.analysis);
        setRawFileTree(data.rawFileTree ?? null);
        setIsCached(data.cached === true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!repoUrl) {
      setLoading(false);
      setError("No repository URL provided.");
      return;
    }

    const short =
      repoUrl.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "") ||
      repoUrl;
    setRepoName(short);

    fetchAnalysis();
  }, [repoUrl]);

  if (!repoUrl) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <p className="text-[var(--text-muted)]">No repository URL provided.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-accent hover:underline"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {loading && (
        <div className="space-y-6">
          <div>
            <SectionLabel label="Summary" />
            <SkeletonBlock className="h-44" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SectionLabel label="Folder Structure" />
              <SkeletonBlock className="h-64" />
            </div>
            <div>
              <SectionLabel label="Setup Guide" />
              <SkeletonBlock className="h-64" />
            </div>
          </div>
          <div>
            <SectionLabel label="Architecture" />
            <SkeletonBlock className="h-[320px]" />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[var(--error)] font-medium">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-accent hover:underline"
          >
            Try a different repository
          </button>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-8">
          {isCached && (
            <div className="flex items-center justify-between px-5 py-3 bg-accent/10 border border-accent/30 rounded-xl text-sm">
              <span className="text-[var(--text-secondary)]">
                Showing cached results. Re-analyze to get refreshed data including ratings.
              </span>
              <button
                onClick={() => fetchAnalysis(true)}
                className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Re-analyze
              </button>
            </div>
          )}
          <div>
            <SectionLabel label="Summary" />
            <SummaryCard analysis={analysis} repoName={repoName} />
          </div>

          {(analysis.folders.length > 0 || analysis.setupSteps.length > 0) && (
            <div className={`grid gap-6 ${analysis.folders.length > 0 && analysis.setupSteps.length > 0 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              {analysis.folders.length > 0 && (
                <div className="h-full flex flex-col min-h-0">
                  <SectionLabel label="Folder Structure" />
                  <div className="flex-1 min-h-0">
                    <FolderTree folders={analysis.folders} tree={rawFileTree ?? []} />
                  </div>
                </div>
              )}
              {analysis.setupSteps.length > 0 && (
                <div className="h-full flex flex-col min-h-0">
                  <SectionLabel label="Setup Guide" />
                  <div className="flex-1 min-h-0">
                    <SetupGuide steps={analysis.setupSteps} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <SectionLabel label="Ratings" />
            <RatingCard ratings={analysis.ratings} />
          </div>

          <div>
            <SectionLabel label="Architecture" />
            <ArchitectureDiagram analysis={analysis} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6" />
          ))}
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
