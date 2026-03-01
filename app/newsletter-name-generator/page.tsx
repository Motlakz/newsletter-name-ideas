import { Suspense } from "react"
import NewsletterGenerator from "@/components/newsletter-name-generator"
import { Loader } from "lucide-react"

export default function GeneratorPage() {
  return (
    <div className="min-h-screen bg-[#faf9ff] dark:bg-[#0e0b1a]">

      {/* Background dot grid */}
      <div
        className="fixed inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Soft corner blooms */}
      <div className="fixed -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-violet-200/20 dark:bg-violet-700/8 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 -left-48 w-[420px] h-[420px] rounded-full bg-pink-200/15 dark:bg-pink-800/8 blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <header className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.2em] text-violet-500/60 dark:text-violet-400/50 font-medium mb-3">
            Newsletter Toolkit
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4"
          >
            Your newsletter's perfect name.<br/>A few clicks away.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[0.9375rem] leading-relaxed max-w-md">
            Describe your topic, tone, and audience — get dozens of distinctive names in seconds. Filter by style, star your favourites, iterate fast.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          }
        >
          <NewsletterGenerator />
        </Suspense>
      </div>
    </div>
  )
}
