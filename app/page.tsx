import Link from "next/link"
import { ArrowRight, Globe, Twitter, Search } from "lucide-react"
import { FaMagic } from "react-icons/fa"
import { HeroSection } from "@/components/hero-section"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: <FaMagic className="h-4.5 w-4.5" />,
    accent: "bg-violet-500",
    title: "AI Name Generator",
    description:
      "Describe your topic, tone, and audience — get dozens of distinctive names in seconds. Filter by style, star your favourites, iterate fast.",
    link: "/newsletter-name-generator",
    cta: "Start generating",
  },
  {
    icon: <Globe className="h-4.5 w-4.5" />,
    accent: "bg-indigo-500",
    title: "Domain Checker",
    description:
      "Check .com, .io, .co, and Substack availability for your shortlisted names — all in one request, no tab-switching required.",
    link: "/tools",
    cta: "Check domains",
  },
  {
    icon: <Twitter className="h-4.5 w-4.5" />,
    accent: "bg-pink-500",
    title: "Social Handle Checker",
    description:
      "See whether your handle is free on Twitter/X, Instagram, LinkedIn, and YouTube before you commit to a name.",
    link: "/tools",
    cta: "Check handles",
  },
  {
    icon: <Search className="h-4.5 w-4.5" />,
    accent: "bg-violet-500",
    title: "SEO Name Analysis",
    description:
      "Get keyword-aware name suggestions tuned for discoverability — so readers can actually find you through search.",
    link: "/tools",
    cta: "Analyse SEO",
  },
]

export default function Home() {
  return (
    <div className="bg-[#faf9ff] dark:bg-[#0e0b1a]">
      <HeroSection />

      {/* ── Section divider ── */}
      <div className="flex items-center gap-4 max-w-4xl mx-auto px-6 py-2">
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/60" />
        <span
          className="text-[10px] uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600"
        >
          Tools
        </span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Section header */}
          <div className="mb-12">
            <p className="text-[11px] uppercase tracking-[0.2em] text-violet-500/60 dark:text-violet-400/50 font-medium mb-3">
              What's inside
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 max-w-lg"
            >
              Everything you need to claim your newsletter's identity.
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-md leading-relaxed text-[0.9375rem]">
              From first idea to fully reserved — our toolkit covers every step of locking in a name you'll be proud of.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <GlassCard
                key={i}
                className="group border-slate-200/60 dark:border-slate-700/40 hover:border-violet-200 dark:hover:border-violet-800/50 bg-white/70 dark:bg-slate-900/40 hover:shadow-sm transition-all duration-300"
              >
                <GlassCardContent className="p-6">
                  {/* Icon dot */}
                  <div className={`w-8 h-8 rounded-lg ${f.accent} flex items-center justify-center mb-5 shadow-sm`}>
                    <span className="text-white">{f.icon}</span>
                  </div>
                  <h3
                    className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2"
                  >
                    {f.title}
                  </h3>
                  <p className="text-[0.875rem] text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                    {f.description}
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="p-0 h-auto text-violet-600 dark:text-violet-400 font-medium text-sm hover:no-underline"
                  >
                    <Link href={f.link} className="flex items-center gap-1 group/link">
                      {f.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                    </Link>
                  </Button>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 dark:bg-slate-800 px-8 md:px-14 py-14">
            {/* Subtle dot grid */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Soft violet corner bloom */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-pink-500/15 blur-3xl" />

            <div className="relative z-10 max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.2em] text-violet-400/70 font-medium mb-4">
                Get started
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight mb-5"
              >
                Your newsletter deserves a name worth remembering.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8 text-[0.9375rem]">
                Find the right name, check the domain, lock in your handles — all before anyone else gets there.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-violet-500 text-white hover:bg-violet-600 font-semibold border-0 shadow-none px-7"
                >
                  <Link href="/newsletter-name-generator">Generate Your Newsletter Name</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-slate-700 dark:text-slate-300  hover:bg-slate-800 hover:border-slate-600 hover:text-white px-7"
                >
                  <Link href="/tools">Explore All Tools</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
