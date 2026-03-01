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
import AdScript from "./common/ad-script"

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
      <TabsList className="grid grid-cols-3 w-full max-w-md h-11 mx-auto bg-slate-100/70 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/30">
        <TabsTrigger
          value="generator"
          className="text-sm rounded-lg transition-all text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/60 dark:data-[state=active]:border-slate-700/40 font-medium flex items-center justify-center gap-2"
        >
          <Wand2 className="h-3.5 w-3.5 opacity-70" />
          Generator
        </TabsTrigger>
        <TabsTrigger
          value="results"
          className="text-sm rounded-lg transition-all text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/60 dark:data-[state=active]:border-slate-700/40 font-medium flex items-center justify-center gap-2"
        >
          <ListFilter className="h-3.5 w-3.5 opacity-70" />
          Results
        </TabsTrigger>
        <TabsTrigger
          value="favorites"
          className="text-sm rounded-lg transition-all text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/60 dark:data-[state=active]:border-slate-700/40 font-medium flex items-center justify-center gap-2"
        >
          <Heart className="h-3.5 w-3.5 opacity-70" />
          <span>Favorites</span>
          {favorites.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-violet-100/70 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full">
              {favorites.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generator">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <GlassCard className="border-slate-200/50 dark:border-slate-700/30 bg-white/70 dark:bg-slate-900/40">
            <GlassCardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2
                    className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Create Your Newsletter Name
                  </h2>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
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
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    Clear Template
                  </Button>
                )}
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="mb-8">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-4">Naming Templates</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {TEMPLATE_PRESETS.map((template) => (
                    <Button
                      key={template.id}
                      variant={activeTemplate === template.id ? "default" : "outline"}
                      className={`h-auto py-3 flex flex-col items-center gap-2 transition-all ${
                        activeTemplate === template.id
                          ? "border-violet-300 bg-violet-50/80 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30"
                          : "border-slate-200/60 dark:border-slate-700/40 hover:border-violet-200 dark:hover:border-violet-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      }`}
                      onClick={() => applyTemplate(template.id)}
                    >
                      <span className="text-violet-600 dark:text-violet-400">{template.icon}</span>
                      <span className="text-sm">{template.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm font-medium text-slate-700 dark:text-slate-300">Newsletter Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Technology, Finance, Health, Marketing"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    className="border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="audience" className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience</Label>
                    <Input
                      id="audience"
                      placeholder="e.g., Professionals, Students, Parents"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900">
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
                  <Label htmlFor="keywords" className="text-sm font-medium text-slate-700 dark:text-slate-300">Keywords or Phrases to Include</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., tech, insights, weekly, insider"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name Length</Label>
                  <div className="pt-2 px-2">
                    <Slider
                      defaultValue={nameLength}
                      max={5}
                      min={1}
                      step={1}
                      onValueChange={setNameLength}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
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
                    <Label htmlFor="alliteration" className="text-slate-700 dark:text-slate-300">Use Alliteration</Label>
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
                    <Label htmlFor="emojis" className="text-slate-700 dark:text-slate-300">Include Emojis</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo" className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any other details that might help generate better names..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="border-slate-200/70 dark:border-slate-700/50 focus:border-violet-400 dark:focus:border-violet-500 bg-white dark:bg-slate-900 min-h-[100px]"
                  />
                </div>

                <GlassCardFooter className="flex justify-end px-0 pb-0">
                  <Button
                    type="submit"
                    disabled={isGenerating || !topic}
                    className="bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white border-0 shadow-sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
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
                <Filter className="h-5 w-5 text-violet-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Filter by:</span>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[180px] border-slate-200/60 dark:border-slate-700/40">
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
                <span className="font-medium text-slate-700 dark:text-slate-300">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-slate-200/60 dark:border-slate-700/40">
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
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">No newsletter names generated yet.</p>
                <Button
                  onClick={() => setActiveTab("generator")}
                  variant="outline"
                  className="border-slate-200/60 dark:border-slate-700/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  Go to Generator
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          "transition-all duration-300 hover:shadow-sm",
                          name.isFavorite
                            ? "border-amber-200/60 dark:border-amber-800/30"
                            : "border-slate-200/50 dark:border-slate-700/30",
                          "bg-white/70 dark:bg-slate-900/40",
                        )}
                      >
                        <GlassCardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3
                              className="text-base font-semibold text-slate-800 dark:text-slate-200"
                            >
                              {name.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(name)}
                              className={cn("p-2 h-auto", name.isFavorite ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}
                            >
                              <Star className={cn("h-4 w-4", name.isFavorite && "fill-amber-500")} />
                            </Button>
                          </div>
                          <Badge className="mb-2 bg-violet-100/70 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-800/30">
                            {name.category}
                          </Badge>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{name.description}</p>

                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-slate-200/60 dark:border-slate-700/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
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
                                    ? "bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200/60 dark:hover:bg-green-900/40"
                                    : "bg-red-100/70 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200/60 dark:hover:bg-red-900/40"
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
                  className="bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white border-0 shadow-sm"
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
                <Filter className="h-5 w-5 text-violet-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Filter by:</span>
                <Select value={favoritesFilter} onValueChange={setFavoritesFilter}>
                  <SelectTrigger className="w-[180px] border-slate-200/60 dark:border-slate-700/40">
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
                <span className="font-medium text-slate-700 dark:text-slate-300">Sort by:</span>
                <Select value={favoritesSortBy} onValueChange={setFavoritesSortBy}>
                  <SelectTrigger className="w-[180px] border-slate-200/60 dark:border-slate-700/40">
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
                  <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">No favorites saved yet.</p>
                  <Button
                    onClick={() => setActiveTab("generator")}
                    variant="outline"
                    className="border-slate-200/60 dark:border-slate-700/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    Generate Some Names
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {getFilteredFavorites().map((favorite, index) => (
                    <motion.div
                      key={favorite.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <GlassCard className="border-amber-200/60 dark:border-amber-800/30 hover:shadow-sm transition-all duration-300 bg-white/70 dark:bg-slate-900/40">
                        <GlassCardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3
                              className="text-base font-semibold text-slate-800 dark:text-slate-200"
                            >
                              {favorite.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(favorite)}
                              className="p-2 h-auto text-amber-500"
                            >
                              <Star className="h-4 w-4 fill-amber-500" />
                            </Button>
                          </div>
                          <Badge className="mb-2 bg-violet-100/70 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-800/30">
                            {favorite.category}
                          </Badge>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{favorite.description}</p>

                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-slate-200/60 dark:border-slate-700/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
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
                                    ? "bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200/60 dark:hover:bg-green-900/40"
                                    : "bg-red-100/70 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200/60 dark:hover:bg-red-900/40"
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
                  className="bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white border-0 shadow-sm"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate More Names
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
      <AdScript />
    </div>
  )
}
