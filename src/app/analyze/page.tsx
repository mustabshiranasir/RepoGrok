"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import SummaryCard from "@/components/analysis/SummaryCard";
import FolderTree from "@/components/analysis/FolderTree";
import SetupGuide from "@/components/analysis/SetupGuide";
import ArchitectureDiagram from "@/components/analysis/ArchitectureDiagram";
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
  const [repoName, setRepoName] = useState("");

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

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to analyze repository");
        return data;
      })
      .then((data) => {
        setAnalysis(data.analysis);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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
          <div>
            <SectionLabel label="Summary" />
            <SummaryCard analysis={analysis} repoName={repoName} />
          </div>

          {(analysis.folders.length > 0 || analysis.setupSteps.length > 0) && (
            <div className={`grid gap-6 ${analysis.folders.length > 0 && analysis.setupSteps.length > 0 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              {analysis.folders.length > 0 && (
                <div>
                  <SectionLabel label="Folder Structure" />
                  <FolderTree folders={analysis.folders} />
                </div>
              )}
              {analysis.setupSteps.length > 0 && (
                <div>
                  <SectionLabel label="Setup Guide" />
                  <SetupGuide steps={analysis.setupSteps} />
                </div>
              )}
            </div>
          )}

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
