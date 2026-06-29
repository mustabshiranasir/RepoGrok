"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

const categoryColors: Record<string, string> = {
  frontend: "bg-indigo-500",
  backend: "bg-purple-500",
  database: "bg-green-500",
  devops: "bg-amber-500",
  testing: "bg-zinc-400",
};

export default function SummaryCard({
  analysis,
  repoName,
}: {
  analysis: AnalysisResult;
  repoName: string;
}) {
  return (
    <motion.div
      className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
        {repoName}
      </h1>

      <p className="mt-1 text-accent font-medium">{analysis.purpose}</p>

      <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
        {analysis.summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {analysis.techStack.map((tech) => (
          <span
            key={tech.name}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-primary)] border border-[var(--bg-border)] text-[var(--text-secondary)]"
          >
            <span
              className={`w-2 h-2 rounded-full ${categoryColors[tech.category] ?? "bg-zinc-500"}`}
            />
            {tech.name}
          </span>
        ))}
      </div>

      {analysis.highlights.length > 0 && (
        <ul className="mt-5 space-y-1.5">
          {analysis.highlights.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
