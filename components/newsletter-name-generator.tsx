"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader, Star, RefreshCw, Filter, Heart, Sparkles, Check, X, Globe, Wand2, ListFilter, Type, Puzzle, Smile } from "lucide-react"
import { generateNames, checkDomainAvailability } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { GeneratedName, TemplatePreset } from "@/types/templates"
import { useNewsletter } from "@/context/NewsletterContext"

export default function NewsletterNameGenerator() {
  const [topic, setTopic] = useState("")
  const [audience, setAudience] = useState("")
  const [tone, setTone] = useState("Professional")
  const [keywords, setKeywords] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [nameLength, setNameLength] = useState([3])
  const [useAlliteration, setUseAlliteration] = useState(false)
  const [useEmojis, setUseEmojis] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCheckingDomain, setIsCheckingDomain] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("default")
  const [activeTab, setActiveTab] = useState("generator")
  const [domainResults, setDomainResults] = useState<{ [key: string]: boolean }>({})
  const [activeTemplate, setActiveTemplate] = useState<string>("")
  const { names, favorites, setNames, addToFavorites, removeFromFavorites } = useNewsletter()

  // Save favorites to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("newsletterFavorites", JSON.stringify(favorites))
  }, [favorites])

  // Update isFavorite property in names array based on favorites
  useEffect(() => {
    if (names.length > 0) {
      const updatedNames = names.map((name) => ({
        ...name,
        isFavorite: favorites.some((fav) => fav.id === name.id),
      }))
      setNames(updatedNames)
    }
  }, [favorites])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic) return

    setIsGenerating(true)
    try {
      const generatedNames = await generateNames({
        topic,
        audience,
        tone,
        keywords,
        additionalInfo,
        nameLength: nameLength[0],
        useAlliteration,
        useEmojis,
      })
      setNames(generatedNames) // This will now update the context
      setActiveTab("results")
    } catch (error) {
      console.error("Error generating names:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleFavorite = (name: GeneratedName) => {
    if (favorites.some((fav) => fav.id === name.id)) {
      removeFromFavorites(name.id)
    } else {
      addToFavorites(name)
    }
  }

  const checkDomains = async (name: string) => {
    setIsCheckingDomain(true)
    try {
      const results = await checkDomainAvailability(name)
      setDomainResults((prev) => ({ ...prev, [name]: results.available }))
    } catch (error) {
      console.error("Error checking domain:", error)
    } finally {
      setIsCheckingDomain(false)
    }
  }

  const getFilteredNames = () => {
    let filtered = [...names]

    if (activeFilter !== "all") {
      filtered = filtered.filter((name) => name.category === activeFilter)
    }

    switch (sortBy) {
      case "az":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "za":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "favorites":
        filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
        break
      case "length":
        filtered.sort((a, b) => a.name.length - b.name.length)
        break
      default:
        break
    }

    return filtered
  }

  const getCategories = () => {
    const categories = new Set<string>()
    names.forEach((name) => categories.add(name.category))
    return Array.from(categories)
  }

  const getFavoriteCategories = () => {
    const categories = new Set<string>()
    favorites.forEach((name) => categories.add(name.category))
    return Array.from(categories)
  }

  const [favoritesFilter, setFavoritesFilter] = useState("all")
  const [favoritesSortBy, setFavoritesSortBy] = useState("default")

  const getFilteredFavorites = () => {
    let filtered = [...favorites]

    if (favoritesFilter !== "all") {
      filtered = filtered.filter((name) => name.category === favoritesFilter)
    }

    switch (favoritesSortBy) {
      case "az":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "za":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "length":
        filtered.sort((a, b) => a.name.length - b.name.length)
        break
      default:
        break
    }

    return filtered
  }

  const TEMPLATE_PRESETS: TemplatePreset[] = [
    {
      id: "alliteration",
      label: "Alliteration",
      icon: <Type className="h-5 w-5" />,
    },
    {
      id: "noun-structure",
      label: "Noun Style",
      icon: <ListFilter className="h-5 w-5" />,
    },
    {
      id: "wordplay",
      label: "Wordplay",
      icon: <Puzzle className="h-5 w-5" />,
    },
    {
      id: "emoji",
      label: "Emoji",
      icon: <Smile className="h-5 w-5" />,
    },
  ]

  const applyTemplate = (templateId: string) => {
    setActiveTemplate(templateId)
    
    switch(templateId) {
      case "alliteration":
        setUseAlliteration(true)
        setTone("Casual")
        setKeywords((prev) => `${prev}, alliteration`.replace(/^, /, ''))
        break
        
      case "noun-structure":
        setTone("Professional")
        setKeywords((prev) => `${prev}, Insider, Digest, Brief, Update`.replace(/^, /, ''))
        break
        
      case "wordplay":
        setTone("Humorous")
        setKeywords((prev) => `${prev}, puns, wordplay, creative`.replace(/^, /, ''))
        break
        
      case "emoji":
        setUseEmojis(true)
        setTone("Casual")
        break
        
      default:
        setActiveTemplate("")
    }
  }

  const clearTemplate = () => {
    setActiveTemplate("")
    setUseAlliteration(false)
    setUseEmojis(false)
    setTone("Professional")
    setKeywords("")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full max-w-md h-16 mx-auto dark:bg-slate-800/50 bg-gray-100/50 p-2 rounded-xl shadow-inner">
        <TabsTrigger 
          value="generator" 
          className="text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center justify-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Generator
        </TabsTrigger>
        <TabsTrigger 
          value="results" 
          className="text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center justify-center gap-2"
        >
          <ListFilter className="h-4 w-4" />
          Results
        </TabsTrigger>
        <TabsTrigger 
          value="favorites" 
          className="text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center justify-center gap-2"
        >
          <Heart className="h-4 w-4" />
          <span>Favorites</span>
          {favorites.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {favorites.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generator">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <GlassCard className="border-primary/20">
            <GlassCardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold">Create Your Newsletter Name</h2>
                  <p className="text-muted-foreground">
                    {activeTemplate ? 
                      `Using ${TEMPLATE_PRESETS.find(t => t.id === activeTemplate)?.label} template` : 
                      "Choose a template or start fresh"}
                  </p>
                </div>
                {activeTemplate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTemplate}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Clear Template
                  </Button>
                )}
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="mb-8">
                <Label className="block mb-4">Naming Templates</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {TEMPLATE_PRESETS.map((template) => (
                    <Button
                      key={template.id}
                      variant={activeTemplate === template.id ? "default" : "outline"}
                      className={`h-auto py-3 flex flex-col items-center gap-2 transition-all ${
                        activeTemplate === template.id 
                          ? "border-primary bg-primary/10 text-primary hover:bg-primary/20" 
                          : "border-input/50 hover:border-primary/30 hover:bg-accent/50"
                      }`}
                      onClick={() => applyTemplate(template.id)}
                    >
                      <span className="text-primary">{template.icon}</span>
                      <span className="text-sm">{template.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Newsletter Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Technology, Finance, Health, Marketing"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    className="border-input/50 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      placeholder="e.g., Professionals, Students, Parents"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="border-input/50 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Preferred Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="border-input/50 focus:border-primary">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Humorous">Humorous</SelectItem>
                        <SelectItem value="Inspirational">Inspirational</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                        <SelectItem value="Formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords or Phrases to Include</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., tech, insights, weekly, insider"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="border-input/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Name Length</Label>
                  <div className="pt-2 px-2">
                    <Slider
                      defaultValue={nameLength}
                      max={5}
                      min={1}
                      step={1}
                      onValueChange={setNameLength}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Short</span>
                      <span>Medium</span>
                      <span>Long</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="alliteration" 
                      checked={useAlliteration} 
                      onCheckedChange={(checked) => {
                        setUseAlliteration(checked)
                        if (!checked) setActiveTemplate("")
                      }}
                      disabled={activeTemplate === 'alliteration'}
                    />
                    <Label htmlFor="alliteration">Use Alliteration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="emojis" 
                      checked={useEmojis} 
                      onCheckedChange={(checked) => {
                        setUseEmojis(checked)
                        if (!checked) setActiveTemplate("")
                      }}
                      disabled={activeTemplate === 'emoji'}
                    />
                    <Label htmlFor="emojis">Include Emojis</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any other details that might help generate better names..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="border-input/50 focus:border-primary min-h-[100px]"
                  />
                </div>

                <GlassCardFooter className="flex justify-end px-0 pb-0">
                  <Button
                    type="submit"
                    disabled={isGenerating || !topic}
                    className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Newsletter Names
                      </>
                    )}
                  </Button>
                </GlassCardFooter>
              </form>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </TabsContent>

        <TabsContent value="results">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <span className="font-medium">Filter by:</span>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[180px] border-input/50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-input/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="za">Z-A</SelectItem>
                    <SelectItem value="length">Length</SelectItem>
                    <SelectItem value="favorites">Favorites First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {names.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg mb-4">No newsletter names generated yet.</p>
                <Button
                  onClick={() => setActiveTab("generator")}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  Go to Generator
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {getFilteredNames().map((name, index) => (
                    <motion.div
                      key={name.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <GlassCard
                        className={cn(
                          "transition-all duration-300 hover:shadow-md",
                          name.isFavorite ? "border-amber-300/50 dark:border-amber-300/30" : "border-primary/20",
                        )}
                      >
                        <GlassCardContent>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{name.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(name)}
                              className={cn("p-2 h-auto", name.isFavorite ? "text-amber-500" : "text-muted-foreground")}
                            >
                              {name.isFavorite ? (
                                <Star className="h-5 w-5 fill-amber-500" />
                              ) : (
                                <Star className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">{name.category}</Badge>
                          <p className="text-muted-foreground mb-4">{name.description}</p>

                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-primary/20 text-primary"
                              onClick={() => checkDomains(name.name.replace(/\s+/g, "").toLowerCase())}
                              disabled={isCheckingDomain}
                            >
                              {isCheckingDomain ? (
                                <Loader className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Globe className="h-3 w-3 mr-1" />
                              )}
                              Check Domain
                            </Button>

                            {domainResults[name.name.replace(/\s+/g, "").toLowerCase()] !== undefined && (
                              <Badge
                                className={
                                  domainResults[name.name.replace(/\s+/g, "").toLowerCase()]
                                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                }
                              >
                                {domainResults[name.name.replace(/\s+/g, "").toLowerCase()] ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : (
                                  <X className="h-3 w-3 mr-1" />
                                )}
                                {name.name.replace(/\s+/g, "").toLowerCase()}.com
                              </Badge>
                            )}
                          </div>
                        </GlassCardContent>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {names.length > 0 && (
              <div className="mt-8 text-center">
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating More...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate More Ideas
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="favorites">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <span className="font-medium">Filter by:</span>
                <Select value={favoritesFilter} onValueChange={setFavoritesFilter}>
                  <SelectTrigger className="w-[180px] border-input/50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getFavoriteCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Sort by:</span>
                <Select value={favoritesSortBy} onValueChange={setFavoritesSortBy}>
                  <SelectTrigger className="w-[180px] border-input/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="za">Z-A</SelectItem>
                    <SelectItem value="length">Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Heart className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-lg mb-4">No favorites saved yet.</p>
                  <Button
                    onClick={() => setActiveTab("generator")}
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/10"
                  >
                    Generate Some Names
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {getFilteredFavorites().map((favorite, index) => (
                    <motion.div
                      key={favorite.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <GlassCard className="border-pink-300/50 dark:border-pink-500/30 hover:shadow-md transition-all duration-300">
                        <GlassCardContent>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{favorite.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(favorite)}
                              className="p-2 h-auto text-pink-500"
                            >
                              <Star className="h-5 w-5 fill-pink-500" />
                            </Button>
                          </div>
                          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                            {favorite.category}
                          </Badge>
                          <p className="text-muted-foreground mb-4">{favorite.description}</p>

                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-primary/20 text-primary"
                              onClick={() => checkDomains(favorite.name.replace(/\s+/g, "").toLowerCase())}
                              disabled={isCheckingDomain}
                            >
                              {isCheckingDomain ? (
                                <Loader className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Globe className="h-3 w-3 mr-1" />
                              )}
                              Check Domain
                            </Button>

                            {domainResults[favorite.name.replace(/\s+/g, "").toLowerCase()] !== undefined && (
                              <Badge
                                className={
                                  domainResults[favorite.name.replace(/\s+/g, "").toLowerCase()]
                                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                }
                              >
                                {domainResults[favorite.name.replace(/\s+/g, "").toLowerCase()] ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : (
                                  <X className="h-3 w-3 mr-1" />
                                )}
                                {favorite.name.replace(/\s+/g, "").toLowerCase()}.com
                              </Badge>
                            )}
                          </div>
                        </GlassCardContent>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {favorites.length > 0 && (
              <div className="mt-8 text-center">
                <Button
                  onClick={() => setActiveTab("generator")}
                  className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate More Names
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
