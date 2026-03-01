"use client"

import { useState, useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import {
  Globe,
  Search,
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Star,
} from "lucide-react"
import {
  checkDomainAvailability,
  checkSocialMediaHandles,
  checkTLDAvailability,
  generateNames,
} from '@/lib/actions'
import { GeneratedName } from '@/types/templates'

type DomainResult = {
  domain: string
  available: boolean
  error?: { message: string; code?: string } | null
  isPlatform: boolean
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter:   <Twitter   className="h-3.5 w-3.5" />,
  instagram: <Instagram className="h-3.5 w-3.5" />,
  linkedin:  <Linkedin  className="h-3.5 w-3.5" />,
  youtube:   <Youtube   className="h-3.5 w-3.5" />,
}

export default function ToolsPage() {
  const [domainName,     setDomainName]     = useState('')
  const [domainResults,  setDomainResults]  = useState<DomainResult[]>([])
  const [seoName,        setSeoName]        = useState('')
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([])
  const [handleName,     setHandleName]     = useState('')
  const [socialResults,  setSocialResults]  = useState<Array<{
    platform: string; handle: string; available: boolean
  }>>([])
  const [isPending, startTransition] = useTransition()

  // ── Domain checker ─────────────────────────────────────────────────────────
  const handleDomainCheck = async () => {
    startTransition(async () => {
      try {
        if (!domainName.trim()) return
        const baseName = domainName.trim().toLowerCase().replace(/\..*$/, '')
        if (!/^[a-z0-9-]+$/.test(baseName) || baseName.length < 1 || baseName.length > 63) return

        const tldsToCheck = ['.com', '.io', '.co', '.net', '.org', '.dev', '.app', '.substack.com']

        const results = await Promise.allSettled(
          tldsToCheck.map(async (tld): Promise<DomainResult> => {
            try {
              if (tld === '.substack.com') {
                try {
                  const res = await fetch(`https://substack.com/${baseName}`, { method: 'HEAD', cache: 'no-store' })
                  return { domain: `${baseName}${tld}`, available: res.status === 404, error: null, isPlatform: true }
                } catch {
                  return { domain: `${baseName}${tld}`, available: false, error: { message: 'Unable to verify availability', code: 'PLATFORM_CHECK_FAILED' }, isPlatform: true }
                }
              } else if (tld === '.com') {
                const result = await checkDomainAvailability(baseName)
                return { domain: `${baseName}.com`, available: result.available, error: null, isPlatform: false }
              } else {
                const result = await checkTLDAvailability(baseName, tld)
                return { domain: `${baseName}${tld}`, available: result.available, error: null, isPlatform: false }
              }
            } catch (err) {
              return { domain: `${baseName}${tld}`, available: false, error: { message: err instanceof Error ? err.message : 'Unknown error', code: 'CHECK_FAILED' }, isPlatform: tld === '.substack.com' }
            }
          })
        )

        const processed: DomainResult[] = results.map((r, i) =>
          r.status === 'fulfilled' ? r.value : {
            domain: `${baseName}${tldsToCheck[i]}`, available: false,
            error: { message: 'Failed to check domain availability', code: 'CHECK_FAILED' },
            isPlatform: tldsToCheck[i] === '.substack.com',
          }
        )

        setDomainResults(processed.sort((a, b) => {
          if (a.domain.endsWith('.com') && !a.isPlatform) return -1
          if (b.domain.endsWith('.com') && !b.isPlatform) return 1
          if (a.isPlatform && !b.isPlatform) return -1
          if (!a.isPlatform && b.isPlatform) return 1
          const common = ['.io', '.co', '.net', '.org']
          const aC = common.some(t => a.domain.endsWith(t))
          const bC = common.some(t => b.domain.endsWith(t))
          if (aC && !bC) return -1
          if (!aC && bC) return 1
          if (a.error && !b.error) return 1
          if (!a.error && b.error) return -1
          if (a.available && !b.available) return -1
          if (!a.available && b.available) return 1
          return 0
        }))
      } catch (err) {
        console.error('Domain check failed:', err)
      }
    })
  }

  // ── SEO analysis ───────────────────────────────────────────────────────────
  const handleSeoAnalysis = async () => {
    startTransition(async () => {
      try {
        const names = await generateNames({ topic: seoName, nameLength: 3, useAlliteration: true })
        setGeneratedNames(names)
      } catch (err) {
        console.error('SEO analysis failed:', err)
      }
    })
  }

  const toggleFavorite = (id: string) =>
    setGeneratedNames(ns => ns.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))

  // ── Social handles ─────────────────────────────────────────────────────────
  const handleSocialCheck = async () => {
    startTransition(async () => {
      try {
        const clean = handleName.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20)
        if (clean.length < 3) return
        const results = await checkSocialMediaHandles(clean)
        setSocialResults(results)
      } catch (err) {
        console.error('Social check failed:', err)
      }
    })
  }

  // ── Shared result row ──────────────────────────────────────────────────────
  const ResultRow = ({
    label, sublabel, available, error, action,
  }: {
    label: React.ReactNode; sublabel?: string
    available: boolean; error?: string | null; action?: React.ReactNode
  }) => (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
      error
        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/30'
        : available
          ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/60 dark:border-green-800/30'
          : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-700/30'
    }`}>
      <div className="flex items-center gap-2.5">
        {error
          ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          : available
            ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
            : <XCircle className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
        }
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{label}</div>
          {sublabel && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</div>}
          {error && <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{error}</div>}
        </div>
      </div>
      {action ?? (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          error
            ? 'text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/20'
            : available
              ? 'text-green-700 dark:text-green-400 bg-green-100/60 dark:bg-green-900/20'
              : 'text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/40'
        }`}>
          {error ? 'Error' : available ? 'Available' : 'Taken'}
        </span>
      )}
    </div>
  )

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

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-violet-500/60 dark:text-violet-400/50 font-medium mb-3">
            Newsletter Toolkit
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4"
          >
            Claim every corner<br />of your identity.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[0.9375rem] leading-relaxed max-w-md">
            Check domain availability, surface SEO-smart name ideas, and lock in your social handles — before anyone else gets there.
          </p>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          <Tabs defaultValue="domain" className="w-full">

            {/* Tab list */}
            <TabsList className="grid grid-cols-3 w-full mb-8 h-11 bg-slate-100/70 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/30">
              <TabsTrigger
                value="domain"
                className="text-sm rounded-lg transition-all text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/60 dark:data-[state=active]:border-slate-700/40 font-medium"
              >
                <Globe className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                Domains
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="text-sm rounded-lg transition-all text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/60 dark:data-[state=active]:border-slate-700/40 font-medium"
              >
                <Search className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                SEO
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="text-sm rounded-lg transition-all text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/60 dark:data-[state=active]:border-slate-700/40 font-medium"
              >
                <Twitter className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                Handles
              </TabsTrigger>
            </TabsList>

            {/* ── Domain Checker ── */}
            <TabsContent value="domain">
              <GlassCard className="border-slate-200/50 dark:border-slate-700/30 bg-white/70 dark:bg-slate-900/40">
                <GlassCardHeader className="pb-0">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                      >
                        Domain Availability
                      </h2>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                        Check across .com, .io, .co, .net, .org, .dev, .app, and Substack in one go.
                      </p>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="domain-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Newsletter name
                      </Label>
                      <div className="flex gap-2 sm:flex-row flex-col">
                        <div className="relative flex-1">
                          <Input
                            id="domain-name"
                            placeholder="e.g. techweekly"
                            value={domainName.replace(/\..*$/, '')}
                            onChange={(e) => setDomainName(e.target.value.replace(/\..*$/, '').replace(/[^a-zA-Z0-9-]/g, ''))}
                            className="pr-14 border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 dark:text-slate-600 pointer-events-none select-none">
                            .com…
                          </span>
                        </div>
                        <Button
                          onClick={handleDomainCheck}
                          disabled={isPending || !domainName}
                          className="bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white border-0 shrink-0 shadow-sm"
                        >
                          {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                          Check All
                        </Button>
                      </div>
                    </div>

                    {domainResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 pt-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Results for <span className="text-violet-600 dark:text-violet-400 font-semibold">{domainName}</span>
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {domainResults.filter(r => r.available).length} of {domainResults.length} available
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {domainResults.map((r) => (
                            <ResultRow
                              key={r.domain}
                              label={r.domain}
                              sublabel={r.isPlatform ? 'Newsletter Platform' : undefined}
                              available={r.available}
                              error={r.error?.message}
                              action={
                                r.available && !r.error ? (
                                  <a
                                    href={`https://www.namecheap.com/domains/registration/results/?domain=${r.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors shrink-0"
                                  >
                                    Register →
                                  </a>
                                ) : undefined
                              }
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </TabsContent>

            {/* ── SEO Analysis ── */}
            <TabsContent value="seo">
              <GlassCard className="border-slate-200/50 dark:border-slate-700/30 bg-white/70 dark:bg-slate-900/40">
                <GlassCardHeader className="pb-0">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                      >
                        SEO Name Suggestions
                      </h2>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                        Enter a topic and get keyword-aware name ideas tuned for search discoverability.
                      </p>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="newsletter-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Topic or niche
                      </Label>
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Input
                          id="newsletter-name"
                          placeholder="e.g. fintech, climate, remote work"
                          value={seoName}
                          onChange={(e) => setSeoName(e.target.value)}
                          className="flex-1 border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900"
                        />
                        <Button
                          onClick={handleSeoAnalysis}
                          disabled={isPending || !seoName}
                          className="bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white border-0 shrink-0 shadow-sm"
                        >
                          {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                          Generate
                        </Button>
                      </div>
                    </div>

                    {generatedNames.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 pt-1"
                      >
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">SEO-friendly name ideas</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {generatedNames.map((name) => (
                            <div
                              key={name.id}
                              className="flex items-start justify-between px-4 py-3 rounded-lg border border-slate-200/50 dark:border-slate-700/30 bg-slate-50/60 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                            >
                              <div className="space-y-1 flex-1 pr-2">
                                <div
                                  className="font-semibold text-sm text-slate-800 dark:text-slate-200"
                                >
                                  {name.name}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                  {name.description}
                                </div>
                                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-100/70 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                  {name.category}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleFavorite(name.id)}
                                className="shrink-0 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Star className={`h-3.5 w-3.5 ${name.isFavorite ? 'fill-violet-500 text-violet-500' : 'text-slate-300 dark:text-slate-600'}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </TabsContent>

            {/* ── Social Handles ── */}
            <TabsContent value="social">
              <GlassCard className="border-slate-200/50 dark:border-slate-700/30 bg-white/70 dark:bg-slate-900/40">
                <GlassCardHeader className="pb-0">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Twitter className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                      >
                        Social Handle Checker
                      </h2>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                        Check Twitter/X, Instagram, LinkedIn, and YouTube all at once.
                      </p>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="handle-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Handle
                      </Label>
                      <div className="flex gap-2 sm:flex-row flex-col">
                        <div className="flex flex-1">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200/70 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 text-sm select-none">
                            @
                          </span>
                          <Input
                            id="handle-name"
                            placeholder="yournewsletter"
                            value={handleName}
                            onChange={(e) => setHandleName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            className="rounded-l-none border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900"
                          />
                        </div>
                        <Button
                          onClick={handleSocialCheck}
                          disabled={isPending || !handleName}
                          className="bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white border-0 shrink-0 shadow-sm"
                        >
                          {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Twitter className="mr-2 h-4 w-4" />}
                          Check
                        </Button>
                      </div>
                    </div>

                    {socialResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 pt-1"
                      >
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Results for{" "}
                          <span className="text-violet-600 dark:text-violet-400 font-semibold">@{handleName}</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {socialResults.map((r) => (
                            <ResultRow
                              key={r.platform}
                              label={
                                <span className="flex items-center gap-1.5 capitalize">
                                  <span className="text-slate-400 dark:text-slate-500">
                                    {PLATFORM_ICONS[r.platform.toLowerCase()] ?? null}
                                  </span>
                                  {r.platform}
                                </span>
                              }
                              sublabel={r.handle}
                              available={r.available}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </TabsContent>

          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
