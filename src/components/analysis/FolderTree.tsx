"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FolderOpen, ChevronRight } from "lucide-react";
import type { FolderInfo } from "@/types/analysis";

export default function FolderTree({ folders }: { folders: FolderInfo[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--bg-border)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Folder Structure
        </h2>
      </div>
      <div className="divide-y divide-[var(--bg-border)]">
        {folders.map((folder, i) => {
          const isOpen = open.has(i);
          return (
            <div key={folder.path}>
              <button
                onClick={() => toggle(i)}
                className={`flex items-center gap-2.5 w-full px-5 py-2.5 text-left transition-colors hover:bg-[var(--bg-border)] ${
                  isOpen ? "border-l-2 border-accent bg-[var(--bg-border)]/30" : "border-l-2 border-transparent"
                }`}
              >
                {isOpen ? (
                  <FolderOpen className="w-4 h-4 text-accent shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                )}
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {folder.name}
                </span>
                <span className="text-xs text-[var(--text-muted)] ml-auto">
                  {folder.path}
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-3 pt-1 text-sm text-[var(--text-secondary)] leading-relaxed pl-[52px]">
                      {folder.explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {folders.length === 0 && (
          <div className="px-5 py-4 text-sm text-[var(--text-muted)]">
            No folder information available.
          </div>
        )}
      </div>
    </div>
  );
}
