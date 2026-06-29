"use client";

import { AlertTriangle, SearchX, Ban, Bot } from "lucide-react";

const errors = {
  invalid_url: {
    icon: AlertTriangle,
    title: "Invalid URL",
    message: "That doesn't look like a valid GitHub URL.",
  },
  repo_not_found: {
    icon: SearchX,
    title: "Repository Not Found",
    message: "Repository not found or is private.",
  },
  rate_limit: {
    icon: Ban,
    title: "Rate Limit Exceeded",
    message: "GitHub API rate limit hit, try again in a few minutes.",
  },
  analysis_failed: {
    icon: Bot,
    title: "Analysis Failed",
    message: "AI analysis failed, please try again.",
  },
};

type ErrorType = keyof typeof errors;

export default function ErrorCard({
  type,
  onRetry,
}: {
  type: ErrorType;
  onRetry?: () => void;
}) {
  const err = errors[type];
  const Icon = err.icon;

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
          <Icon className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-400">{err.title}</p>
          <p className="mt-1 text-sm text-red-300/70">{err.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              Try again &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
