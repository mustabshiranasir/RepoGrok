"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

const commandPrefixes = [
  "npm", "pip", "git", "docker", "yarn", "pnpm", "brew", "cargo", "go install",
  "apt", "composer", "gem", "npx", "bun", "make", "cmake",
];

function isCommand(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return commandPrefixes.some((cmd) => trimmed.startsWith(cmd));
}

function StepCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative flex items-center gap-2 mt-2 bg-[var(--bg-primary)] border border-[var(--bg-border)] rounded-lg px-4 py-2.5 font-mono text-sm text-[var(--text-secondary)]">
      <span className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {text}
      </span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="shrink-0 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-border)] transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-accent" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export default function SetupGuide({ steps }: { steps: string[] }) {
  if (!steps.length) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[var(--bg-border)] shrink-0">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Setup Guide
        </h2>
      </div>
      <div className="px-5 py-5 flex-1 overflow-y-auto min-h-0">
        <div className="relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative flex gap-4 pb-6 last:pb-0"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1, ease: "easeOut" }}
            >
              {i < steps.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--bg-border)]" />
              )}

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 border border-accent/30 text-xs font-semibold text-accent">
                {i + 1}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                {isCommand(step) ? (
                  <StepCode text={step} />
                ) : (
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
