"use client"

import { motion } from "framer-motion"
import NewsletterNameGenerator from "@/components/newsletter-name-generator"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-[#faf9ff] dark:bg-[#0e0b1a]">

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Soft corner blobs — very subtle ── */}
      <div className="absolute -top-48 -right-48 w-[560px] h-[560px] rounded-full bg-violet-200/25 dark:bg-violet-700/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-48 w-[480px] h-[480px] rounded-full bg-pink-200/20 dark:bg-pink-800/10 blur-3xl pointer-events-none" />

      {/* ── Hero copy ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-7"
        >
          <div className="h-px w-10 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full opacity-60" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-violet-500/60 dark:text-violet-400/50 font-medium">
            Newsletter Name Generator
          </span>
          <div className="h-px w-10 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full opacity-60" />
        </motion.div>

        {/* Headline — serif, no gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 90 }}
          className="text-[2.75rem] md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-slate-900 dark:text-slate-50"
        >
          The name your readers{" "}
          <span className="relative inline-block italic text-violet-600 dark:text-violet-400">
            remember.
            {/* Squiggle underline */}
            <svg
              className="absolute -bottom-1.5 left-0 w-full"
              viewBox="0 0 220 8"
              preserveAspectRatio="none"
              height="6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 5 Q27 1 55 5 Q82 9 110 5 Q137 1 165 5 Q192 9 220 5"
                stroke="#db2777"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed"
        >
          Generate distinctive, memorable names for your newsletter in seconds — powered by AI that understands what actually stands out in the inbox.
        </motion.p>
      </div>

      {/* ── Generator divider ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 flex items-center gap-4 max-w-3xl mx-auto px-6 mt-4 mb-8"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/60 to-transparent" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
            Generator
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/60 to-transparent" />
      </motion.div>

      {/* ── Generator ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.55 }}
        className="relative z-10 max-w-3xl mx-auto px-6 pb-28"
      >
        <NewsletterNameGenerator />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#faf9ff] dark:from-[#0e0b1a] to-transparent pointer-events-none" />
    </div>
  )
}
