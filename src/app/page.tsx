"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const EXAMPLES = [
  { label: "vercel/next.js" },
  { label: "facebook/react" },
  { label: "fastapi/fastapi" },
];

export default function Home() {
  const [url, setUrl] = useState("");

  const fillInput = (value: string) => {
    setUrl(`https://github.com/${value}`);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <motion.div
        className="flex flex-col items-center text-center max-w-2xl w-full gap-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-bold tracking-tight text-[#f4f4f5] leading-[1.15]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Understand any GitHub repo{" "}
          <span className="bg-gradient-to-r from-[#39AEA9] to-[#2d9490] bg-clip-text text-transparent">
            in 60 seconds
          </span>
        </motion.h1>

        <motion.p
          className="text-[#a1a1aa] text-lg max-w-lg leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Paste a GitHub URL and get an instant AI-powered breakdown of the codebase.
        </motion.p>

        <motion.div
          className="flex items-center w-full max-w-xl mt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative flex items-center w-full bg-[#111111] border border-[#1e1e1e] rounded-lg focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="flex-1 bg-transparent px-4 py-3.5 text-[#f4f4f5] placeholder-[#71717a] text-sm outline-none"
            />
            <button className="flex items-center gap-1.5 mr-1.5 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#e4e4e7] text-sm font-medium rounded-md hover:bg-[#222222] hover:border-accent/30 hover:text-[#f4f4f5] transition-all whitespace-nowrap">
              Analyze
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 flex-wrap justify-center mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-xs text-[#71717a] mr-1">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => fillInput(ex.label)}
              className="text-xs px-2.5 py-1 rounded-md bg-[#111111] border border-[#1e1e1e] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-accent/30 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
