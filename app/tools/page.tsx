"use client"

import { useState, useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Search, CheckCircle, XCircle, Loader } from "lucide-react"
import { checkDomainAvailability, checkSocialMediaHandles, checkTLDAvailability, generateNames } from '@/lib/actions'

type DomainResult = {
  domain: string
  available: boolean
}

type GeneratedName = {
  id: string
  name: string
  description: string
  category: string
  isFavorite: boolean
}

export default function ToolsPage() {
  const [domainName, setDomainName] = useState('')
  const [selectedTld, setSelectedTld] = useState('.com')
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

  // Domain Checker Functions
  const handleDomainCheck = async () => {
    startTransition(async () => {
      try {
        const baseName = domainName.replace(/\..*$/, ''); // Remove any existing TLD
        const tldsToCheck = [selectedTld, '.io', '.co', '.net', '.org']
          .filter((tld, index, self) => self.indexOf(tld) === index); // Remove duplicates
  
        // Check all TLDs including selected one
        const results = await Promise.all(
          tldsToCheck.map(async (tld) => {
            if (tld === '.com') {
              // Use original server action for .com
              const result = await checkDomainAvailability(baseName);
              return { domain: `${baseName}.com`, available: result.available };
            } else {
              // Use new server action for other TLDs
              const result = await checkTLDAvailability(baseName, tld);
              return result;
            }
          })
        );
  
        // Sort results with selected TLD first
        const sortedResults = results.sort((a, b) => 
          a.domain.endsWith(selectedTld) ? -1 : 1
        );
  
        setDomainResults(sortedResults);
      } catch (error) {
        console.error('Domain check failed:', error);
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

  const handleSocialCheck = async () => {
    startTransition(async () => {
      try {
        const results = await checkSocialMediaHandles(handleName)
        setSocialResults(results)
      } catch (error) {
        console.error('Social check failed:', error)
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
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="domain-name">Domain Name</Label>
                      <div className="flex gap-2">
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
                        className="border-input/50 focus:border-primary"
                      />
                        <Select 
                          value={selectedTld} 
                          onValueChange={setSelectedTld}
                        >
                          <SelectTrigger className="w-[100px] border-input/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=".com">.com</SelectItem>
                            <SelectItem value=".io">.io</SelectItem>
                            <SelectItem value=".co">.co</SelectItem>
                            <SelectItem value=".net">.net</SelectItem>
                            <SelectItem value=".org">.org</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleDomainCheck}
                      disabled={isPending || !domainName}
                      className="w-full bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      {isPending ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Globe className="mr-2 h-4 w-4" />
                      )}
                      Check Availability
                    </Button>

                    {domainResults.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-semibold">Domain Suggestions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {domainResults.map((result) => (
                            <div 
                              key={result.domain}
                              className={`flex items-center justify-between p-3 border rounded-md ${
                                result.available 
                                  ? 'bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50'
                                  : 'bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                              }`}
                            >
                              <div className="flex items-center">
                                {result.available ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                )}
                                <span>{result.domain}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!result.available}
                                className={result.available 
                                  ? "border-green-500 text-green-700 dark:text-green-400"
                                  : "border-red-500 text-red-700 dark:text-red-400"
                                }
                              >
                                {result.available ? 'Available' : 'Taken'}
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
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="newsletter-name">Newsletter Name</Label>
                      <Input
                        id="newsletter-name"
                        placeholder="Enter your newsletter name"
                        value={seoName}
                        onChange={(e) => setSeoName(e.target.value)}
                        className="border-input/50 focus:border-primary"
                      />
                    </div>

                    <Button 
                      onClick={handleSeoAnalysis}
                      disabled={isPending || !seoName}
                      className="w-full bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      {isPending ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Analyze SEO Potential
                    </Button>

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
              <GlassCard>
                <GlassCardHeader>
                  <h2 className="text-2xl font-semibold">Social Media Handle Checker</h2>
                  <p className="text-muted-foreground">
                    Check availability of social media handles for your newsletter.
                  </p>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="handle-name">Handle Name</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted/50 text-muted-foreground">
                          @
                        </span>
                        <Input
                          id="handle-name"
                          placeholder="yournewsletter"
                          value={handleName}
                          onChange={(e) => setHandleName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="rounded-l-none border-input/50 focus:border-primary"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleSocialCheck}
                      disabled={isPending || !handleName}
                      className="w-full bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      {isPending ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Check Social Media Availability
                    </Button>

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
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">
                                  {result.platform}
                                </span>
                                <span className="text-muted-foreground">
                                  {result.handle}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.available ? (
                                  <>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-green-700 dark:text-green-400">
                                      Available
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span className="text-red-700 dark:text-red-400">
                                      Taken
                                    </span>
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

