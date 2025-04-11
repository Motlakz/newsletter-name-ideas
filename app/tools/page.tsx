"use client"

import { useEffect, useState, useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card"
import { Globe, Search, CheckCircle, XCircle, Loader, AlertTriangle, Lock } from "lucide-react"
import { checkDomainAvailability, checkSocialMediaHandles, checkTLDAvailability, generateNames } from '@/lib/actions'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { checkSubscriptionStatus } from '@/actions/data'
import { GeneratedName } from '@/types/templates'
import { SocialHandleCheck } from '@/types/data'
import { usePremiumProtection } from '@/hooks/use-premium-protection'

type DomainResult = {
  domain: string;
  available: boolean;
  error?: {
    message: string;
    code?: string;
  } | null;
  isPlatform: boolean;
}

export default function ToolsPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [domainName, setDomainName] = useState('')
  const [domainResults, setDomainResults] = useState<DomainResult[]>([])
  const [seoName, setSeoName] = useState('')
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([])
  const [isPending, startTransition] = useTransition()
  const [handleName, setHandleName] = useState('')
  const [socialResults, setSocialResults] = useState<Array<{
    platform: string
    handle: string
    available: boolean
  }>>([])

  const { isPremium, overlayVisible } = usePremiumProtection(userId ?? "")

  const PremiumOverlay = () => (
    <div 
      className="absolute inset-0 z-50 backdrop-blur-md bg-black/70 dark:bg-black/40 cursor-pointer rounded-lg flex items-center border-2 justify-center"
      onClick={() => router.push('/#plans')}
      onContextMenu={(e) => {
        e.preventDefault()
        router.push('/#plans')
      }}
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none'
      }}
    >
      <div className="text-center p-6 max-w-md mx-auto">
        <Lock className="h-12 w-12 text-purple-400 animate-pulse mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-purple-400 mb-2">
          Premium Feature
        </h3>
        <p className="text-white/90 mb-4">
          Upgrade to unlock social media handle checking
        </p>
        <Button 
          variant="secondary" 
          className="px-6 py-2 text-white hover:bg-purple-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            router.push('/#plans')
          }}
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  )

  const handleSocialCheck = async () => {
    startTransition(async () => {
      try {
        // Dual validation: client-side and server-side
        if (!isPremium || !(await validatePremiumStatus())) {
          router.push('/#plans')
          return
        }

        // Sanitize input and validate format
        const cleanHandle = handleName
          .replace(/[^a-zA-Z0-9_]/g, '')
          .substring(0, 20)
          
        if (cleanHandle.length < 3) {
          throw new Error('Handle must be at least 3 characters')
        }

        const results = await checkSocialMediaHandles(cleanHandle)
        setSocialResults(results)
      } catch (error) {
        console.error('Social check failed:', error)
      }
    })
  }

  const validatePremiumStatus = async () => {
    try {
      const res = await fetch('/api/validate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        credentials: 'same-origin'
      })
      return (await res.json()).valid
    } catch (error) {
      return false
    }
  }

  // Domain Checker Functions
  const handleDomainCheck = async () => {
    startTransition(async () => {
      try {
        // Input validation
        if (!domainName.trim()) {
          throw new Error("Please enter a domain name");
        }
  
        const baseName = domainName.trim().toLowerCase().replace(/\..*$/, ''); // Remove any existing TLD
        
        // Validate domain name format
        const domainRegex = /^[a-z0-9-]+$/;
        if (!domainRegex.test(baseName)) {
          throw new Error("Domain name can only contain letters, numbers, and hyphens");
        }
  
        if (baseName.length < 1 || baseName.length > 63) {
          throw new Error("Domain name must be between 1 and 63 characters");
        }
  
        // Define all TLDs to check, including newsletter platforms
        const tldsToCheck = [
          ".com",
          ".io",
          ".co",
          ".net",
          ".org",
          ".dev",
          ".app",
          ".substack.com",
        ].filter((tld, index, self) => self.indexOf(tld) === index); // Remove duplicates
  
        // Check all TLDs with proper error handling
        const results = await Promise.allSettled(
          tldsToCheck.map(async (tld): Promise<DomainResult> => {
            try {
              // Special handling for newsletter platforms
              if (tld === '.substack.com' || tld === '.beehiiv.com') {
                const platformDomain = `${baseName}${tld}`;
                const url = tld === '.substack.com' 
                  ? `https://substack.com/${baseName}`
                  : `https://${baseName}.beehiiv.com`;
  
                try {
                  const response = await fetch(url, {
                    method: 'HEAD', // Use HEAD request to minimize data transfer
                    cache: 'no-store', // Prevent caching
                    headers: {
                      'User-Agent': 'Mozilla/5.0', // Some platforms might block requests without proper UA
                    },
                  });
  
                  // For these platforms, a 404 typically means the subdomain is available
                  return {
                    domain: platformDomain,
                    available: response.status === 404,
                    error: null,
                    isPlatform: true
                  };
                } catch (error) {
                  // Network errors or CORS issues might indicate we can't check reliably
                  return {
                    domain: platformDomain,
                    available: false,
                    error: {
                      message: `Unable to verify ${tld} availability`,
                      code: 'PLATFORM_CHECK_FAILED'
                    },
                    isPlatform: true
                  };
                }
              } else if (tld === '.com') {
                // Use original server action for .com
                const result = await checkDomainAvailability(baseName);
                return {
                  domain: `${baseName}.com`,
                  available: result.available,
                  error: null,
                  isPlatform: false
                };
              } else {
                // Use TLD server action for other TLDs
                const result = await checkTLDAvailability(baseName, tld);
                return {
                  domain: `${baseName}${tld}`,
                  available: result.available,
                  error: null,
                  isPlatform: false
                };
              }
            } catch (error) {
              // Type guard for error handling
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              
              return {
                domain: `${baseName}${tld}`,
                available: false,
                error: {
                  message: errorMessage,
                  code: error instanceof Error && 'code' in error ? (error as any).code : 'CHECK_FAILED'
                },
                isPlatform: tld === '.substack.com' || tld === '.beehiiv.com'
              };
            }
          })
        );
  
        // Process results and handle errors
        const processedResults: DomainResult[] = results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              domain: `${baseName}${tldsToCheck[index]}`,
              available: false,
              error: {
                message: 'Failed to check domain availability',
                code: 'CHECK_FAILED'
              },
              isPlatform: tldsToCheck[index] === '.substack.com' || tldsToCheck[index] === '.beehiiv.com'
            };
          }
        });
  
        // Sort results with .com first, then platforms, then others
        const sortedResults = processedResults.sort((a, b) => {
          // Priority 1: .com comes first
          if (a.domain.endsWith('.com') && !a.isPlatform) return -1;
          if (b.domain.endsWith('.com') && !b.isPlatform) return 1;

          // Priority 2: Platform domains come next
          if (a.isPlatform && !b.isPlatform) return -1;
          if (!a.isPlatform && b.isPlatform) return 1;

          // Priority 3: Common TLDs (.io, .co, .net, .org) come next
          const commonTlds = ['.io', '.co', '.net', '.org'];
          const aIsCommon = commonTlds.some(tld => a.domain.endsWith(tld));
          const bIsCommon = commonTlds.some(tld => b.domain.endsWith(tld));
          if (aIsCommon && !bIsCommon) return -1;
          if (!aIsCommon && bIsCommon) return 1;

          // Priority 4: Errors go to the bottom within their groups
          if (a.error && !b.error) return 1;
          if (!a.error && b.error) return -1;

          // Priority 5: Available domains come before unavailable ones
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;

          return 0;
        });
  
        setDomainResults(sortedResults);
      } catch (error) {
        console.error('Domain check failed:', error);
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to check domain availability';
        setDomainResults([{
          domain: domainName,
          available: false,
          error: {
            message: errorMessage,
            code: 'CHECK_FAILED'
          },
          isPlatform: false
        }]);
      }
    });
  };

  // SEO Analysis Functions
  const handleSeoAnalysis = async () => {
    startTransition(async () => {
      try {
        const names = await generateNames({
          topic: seoName,
          nameLength: 3,
          useAlliteration: true
        })
        setGeneratedNames(names)
      } catch (error) {
        console.error('SEO analysis failed:', error)
      }
    })
  }

  const toggleFavorite = (id: string) => {
    setGeneratedNames(names =>
      names.map(name =>
        name.id === id ? { ...name, isFavorite: !name.isFavorite } : name
      )
    )
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Newsletter Tools</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Useful tools to help you launch and grow your newsletter
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="domain" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8 w-full max-w-md mx-auto">
              <TabsTrigger value="domain">Domain Checker</TabsTrigger>
              <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="domain">
              <GlassCard>
                <GlassCardHeader>
                  <h2 className="text-2xl font-semibold">Domain Availability Checker</h2>
                  <p className="text-muted-foreground">
                    Check if your desired domain name is available for your newsletter website.
                  </p>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <Label htmlFor="domain-name" className="text-xl font-semibold">Newsletter Domain Name</Label>
                    <div className="flex gap-2 sm:flex-row flex-col pb-4">
                      <Input
                        id="domain-name"
                        placeholder="yournewsletter"
                        value={domainName.replace(/\..*$/, '')} // Prevent TLDs in input
                        onChange={(e) => {
                          const cleanName = e.target.value
                            .replace(/\..*$/, '') // Remove any TLD
                            .replace(/[^a-zA-Z0-9-]/g, ''); // Only allow valid domain characters
                          setDomainName(cleanName);
                        }}
                        className="border-input/50 focus:border-primary w-full"
                      />
                      <Button 
                        onClick={handleDomainCheck}
                        disabled={isPending || !domainName}
                        className="bg-gradient-to-r w-full sm:w-[300px] from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        {isPending ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Globe className="mr-2 h-4 w-4" />
                        )}
                        Check Domain Availability
                      </Button>
                    </div>

                    {domainResults.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-semibold">Domain Suggestions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {domainResults.map((result) => (
                          <div 
                            key={result.domain}
                            className={`flex items-center justify-between p-3 border rounded-md ${
                              result.error
                                ? 'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50'
                                : result.available 
                                  ? 'bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50'
                                  : 'bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {result.error ? (
                                <>
                                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{result.domain}</span>
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                      {result.error.message}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  {result.available ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{result.domain}</span>
                                    {result.isPlatform && (
                                      <span className="text-xs text-muted-foreground">
                                        Newsletter Platform
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!result.available || !!result.error}
                              className={
                                result.error
                                  ? "border-yellow-500 text-yellow-700 dark:text-yellow-400"
                                  : result.available 
                                    ? "border-green-500 text-green-700 dark:text-green-400"
                                    : "border-red-500 text-red-700 dark:text-red-400"
                              }
                            >
                              {result.error 
                                ? 'Check Failed' 
                                : result.available 
                                  ? 'Available' 
                                  : 'Taken'
                              }
                            </Button>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </TabsContent>

            <TabsContent value="seo">
              <GlassCard>
                <GlassCardHeader>
                  <h2 className="text-2xl font-semibold">SEO Name Analysis</h2>
                  <p className="text-muted-foreground">
                    Analyze your newsletter name for search engine optimization potential.
                  </p>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <Label htmlFor="newsletter-name" className="text-xl font-semibold">Newsletter Name</Label>

                    <div className="flex gap-2 flex-col sm:flex-row pb-4">
                      <Input
                        id="newsletter-name"
                        placeholder="Enter your newsletter name"
                        value={seoName}
                        onChange={(e) => setSeoName(e.target.value)}
                        className="w-full border-input/50 focus:border-primary"
                      />

                      <Button 
                        onClick={handleSeoAnalysis}
                        disabled={isPending || !seoName}
                        className="w-full sm:w-[300px] bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        {isPending ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="mr-2 h-4 w-4" />
                        )}
                        Analyze SEO Potential
                      </Button>
                    </div>
                    

                    {generatedNames.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-semibold">Suggested Names</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {generatedNames.map((name) => (
                            <div 
                              key={name.id}
                              className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                            >
                              <div className="space-y-1">
                                <div className="font-medium">{name.name}</div>
                                <div className="text-sm text-muted-foreground">{name.description}</div>
                                <div className="text-xs text-primary">{name.category}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleFavorite(name.id)}
                              >
                                {name.isFavorite ? (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </TabsContent>

            <TabsContent value="social">
              <GlassCard className="relative overflow-hidden">
                {overlayVisible && <PremiumOverlay />}
                <GlassCardHeader>
                  <h2 className="text-2xl font-semibold">Social Media Handle Checker</h2>
                  <p className="text-muted-foreground">
                    {isPremium ? "Check availability of social media handles" : "Premium feature"}
                  </p>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <Label htmlFor="handle-name" className="text-xl font-semibold">Handle Name</Label>
                    <div className="flex items-center sm:flex-row flex-col gap-2 pb-4">
                      <div className="flex w-full">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted/50 text-muted-foreground">
                          @
                        </span>
                        <Input
                          id="handle-name"
                          placeholder="yournewsletter"
                          value={handleName}
                          onChange={(e) => setHandleName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="rounded-l-none border-input/50 focus:border-primary"
                          disabled={!isPremium}
                        />
                      </div>
                      <Button 
                        onClick={handleSocialCheck}
                        disabled={isPending || !handleName || !isPremium}
                        className="w-full sm:w-[300px] bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all">
                        {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 
                        isPremium ? "Check Availability" : "Premium Required"}
                      </Button>
                    </div>

                    {socialResults.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-semibold">Handle Availability</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {socialResults.map((result) => (
                            <div 
                              key={result.platform}
                              className={`flex items-center justify-between p-3 border rounded-md ${
                                result.available 
                                  ? 'bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50'
                                  : 'bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                              }`}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">{result.platform}</span>
                                <span className="text-muted-foreground">{result.handle}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.available ? (
                                  <>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-green-700 dark:text-green-400">Available</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span className="text-red-700 dark:text-red-400">Taken</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

