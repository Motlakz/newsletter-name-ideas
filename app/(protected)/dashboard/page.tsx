"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card"
import { 
  BarChart2, 
  Hash, 
  FileText, 
  Heart, 
  Wand2, 
  Globe, 
  Pencil, 
  Trash2, 
  Loader, 
  Search,
  Twitter,
  Instagram,
  Facebook,
  Save,
  Check,
  AlertTriangle
} from "lucide-react"
import { useNewsletter } from "@/context/NewsletterContext"
import { cn } from "@/lib/utils"
import { GeneratedName } from "@/types/templates"
import { checkSocialMediaHandles } from "@/lib/actions"
import { checkSubscriptionStatus } from "@/actions/data"
import { useAuth, UserButton } from "@clerk/nextjs"
import { Activity } from "@/types/data"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("analytics")
    const [searchTerm, setSearchTerm] = useState("")
    const [isChecking, setIsChecking] = useState(false)
    const [editingNameId, setEditingNameId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: "", category: "" })
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [isVerifyingSubscription, setIsVerifyingSubscription] = useState(true)
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
    const router = useRouter()
    const { isLoaded, isSignedIn } = useAuth()
    const { 
        totalGenerated, 
        favorites,
        categories,
        recentActivity,
        deleteSavedName,
        editSavedName,
        socialChecks,
    } = useNewsletter()

    useEffect(() => {
        async function verifySubscription() {
            if (!isLoaded) return;
            
            try {
                const response = await checkSubscriptionStatus();
                
                // Handle error case first
                if (response.error) {
                    setSubscriptionError(response.error);
                    return;
                }
                
                // Only redirect if not subscribed
                if (!response.subscribed) {
                    router.push('/#plans');
                }
            } catch (error) {
                console.error('Subscription verification failed:', error);
                setSubscriptionError('Failed to verify subscription status. Please try again.');
            } finally {
                setIsVerifyingSubscription(false);
            }
        }
    
        verifySubscription();
    }, [isSignedIn, isLoaded, router]);

    // If still loading auth or verifying subscription, show loading state
    if (!isLoaded || isVerifyingSubscription) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading Data...</p>
                </div>
            </div>
        )
    }

    // If user is not signed in, they will be redirected in the useEffect
    if (!isSignedIn) {
        return null
    }
    
    // Show subscription error if there was a problem verifying
    if (subscriptionError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <GlassCard className="max-w-md w-full">
                    <GlassCardHeader>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            <h3 className="text-lg font-semibold">Subscription Verification Error</h3>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <p className="mb-4">{subscriptionError}</p>
                        <div className="flex justify-between">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsVerifyingSubscription(true)
                                    setSubscriptionError(null)
                                    window.location.reload()
                                }}
                            >
                                Try Again
                            </Button>
                            <Button asChild>
                                <a href="/#plans">View Plans</a>
                            </Button>
                        </div>
                    </GlassCardContent>
                </GlassCard>
            </div>
        )
    }

    const handleItemSelect = (activityId: string) => {
        setSelectedItems(prev => {
            if (prev.includes(activityId)) {
                return prev.filter(id => id !== activityId)
            }
            return [...prev, activityId]
        })
    }

    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
            selectedItems.forEach(id => {
                deleteSavedName(id)
            })
            setSelectedItems([])
        }
    }

    const analyticsData = {
        totalNames: totalGenerated,
        favoriteNames: favorites.length,
        popularCategories: Object.entries(categories)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
        recentActivity: recentActivity.filter((activity, index, self) =>
            index === self.findIndex((t) => (
                t.type === activity.type && 
                t.name === activity.name && 
                t.date === activity.date
            ))
        )
    }

    const handleSocialCheck = async (name: string) => {
        if (!name) return
        setIsChecking(true)
        try {
            await checkSocialMediaHandles(name)
        } catch (error) {
            console.error("Error checking social handles:", error)
        } finally {
            setIsChecking(false)
        }
    }

    const handleEdit = (name: GeneratedName) => {
        setEditingNameId(name.id)
        setEditForm({ name: name.name, category: name.category })
    }

    const handleSaveEdit = () => {
        if (editingNameId && editForm.name && editForm.category) {
            editSavedName(editingNameId, editForm)
            setEditingNameId(null)
            setEditForm({ name: "", category: "" })
        }
    }

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this name?")) {
            deleteSavedName(id)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="mb-8 flex items-center justify-between">
                <article>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your newsletter names and check analytics
                    </p>
                </article>
                <UserButton />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full max-w-lg mb-4 h-16 mx-auto dark:bg-slate-800/50 bg-gray-100/50 p-2 rounded-xl shadow-inner">
                    <TabsTrigger value="analytics" className="text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center justify-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="storage" className="text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center justify-center gap-2">
                        <Heart className="h-5 w-5" />
                        Favorites
                    </TabsTrigger>
                    <TabsTrigger value="social" className="text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center justify-center gap-2">
                        <Hash className="h-4 w-4" />
                        Social Check
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <GlassCard>
                            <GlassCardHeader>
                                <h3 className="text-lg font-semibold">Total Names</h3>
                            </GlassCardHeader>
                            <GlassCardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-bold">{analyticsData.totalNames}</span>
                                    <FileText className="h-8 w-8 text-primary opacity-50" />
                                </div>
                            </GlassCardContent>
                        </GlassCard>

                        <GlassCard>
                            <GlassCardHeader>
                                <h3 className="text-lg font-semibold">Favorites</h3>
                            </GlassCardHeader>
                            <GlassCardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-bold">{analyticsData.favoriteNames}</span>
                                    <Heart className="h-8 w-8 text-pink-500 opacity-50" />
                                </div>
                            </GlassCardContent>
                        </GlassCard>


                        <GlassCard className="md:col-span-2 lg:col-span-1">
                            <GlassCardHeader>
                                <h3 className="text-lg font-semibold">Popular Categories</h3>
                            </GlassCardHeader>
                            <GlassCardContent>
                                <div className="space-y-2">
                                    {analyticsData.popularCategories.map((category) => (
                                        <div key={category.name} className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">{category.name}</span>
                                            <Badge variant="secondary">{category.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </GlassCardContent>
                        </GlassCard>

                        <GlassCard className="md:col-span-2 lg:col-span-3">
                            <GlassCardHeader>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                                    {selectedItems.length > 0 && (
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={handleDeleteSelected}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Selected ({selectedItems.length})
                                        </Button>
                                    )}
                                </div>
                            </GlassCardHeader>
                            <GlassCardContent>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    <AnimatePresence>
                                        {(analyticsData.recentActivity as Activity[]).map((activity, index) => (
                                            <motion.div
                                                key={`${activity.type}-${activity.date}-${index}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={cn(
                                                    "flex items-center justify-between border-b pb-2 last:border-0 p-2 rounded-lg cursor-pointer transition-colors",
                                                    selectedItems.includes(activity.id) 
                                                        ? "bg-primary/10 border-primary/20" 
                                                        : "hover:bg-muted/50"
                                                )}
                                                onClick={() => handleItemSelect(activity.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-5 h-5 border rounded">
                                                        {selectedItems.includes(activity.id) && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </div>
                                                    {activity.type === "Generated" && <Wand2 className="h-4 w-4 text-primary" />}
                                                    {activity.type === "Favorited" && <Heart className="h-4 w-4 text-pink-500" />}
                                                    {activity.type === "Domain Checked" && <Globe className="h-4 w-4 text-blue-500" />}
                                                    {activity.type === "Social Check" && <Hash className="h-4 w-4 text-purple-500" />}
                                                    {activity.type === "Saved" && <Save className="h-4 w-4 text-green-500" />}
                                                    {activity.type === "Edited" && <Pencil className="h-4 w-4 text-orange-500" />}
                                                    {activity.type === "Deleted" && <Trash2 className="h-4 w-4 text-red-500" />}
                                                    <div>
                                                        <p className="font-medium">{activity.name}</p>
                                                        <p className="text-sm text-muted-foreground">{activity.type}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-muted-foreground">{activity.date}</span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </GlassCardContent>
                        </GlassCard>
                    </div>
                </TabsContent>

                <TabsContent value="storage">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Saved Names</h3>
                            <Input
                                placeholder="Search saved names..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {favorites.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="col-span-full text-center py-8"
                                    >
                                        <Heart className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                        <p className="text-muted-foreground">
                                            No favorite names yet
                                        </p>
                                    </motion.div>
                                ) : (
                                    favorites
                                        .filter(name => 
                                            searchTerm === "" || 
                                            name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            name.category.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((name) => (
                                            <motion.div
                                                key={name.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <GlassCard>
                                                    <GlassCardHeader>
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-lg font-semibold">{name.name}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(name)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-600"
                                                                    onClick={() => handleDelete(name.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </GlassCardHeader>
                                                    <GlassCardContent>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary">
                                                                    {name.category}
                                                                </Badge>
                                                            </div>
                                                            {editingNameId === name.id ? (
                                                                <div className="space-y-2 pt-2">
                                                                    <Input
                                                                        value={editForm.name}
                                                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                                        placeholder="Name"
                                                                    />
                                                                    <Input
                                                                        value={editForm.category}
                                                                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                                                        placeholder="Category"
                                                                    />
                                                                    <div className="flex justify-end gap-2 mt-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setEditingNameId(null)}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            variant="default"
                                                                            size="sm"
                                                                            onClick={handleSaveEdit}
                                                                            disabled={!editForm.name || !editForm.category}
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </GlassCardContent>
                                                </GlassCard>
                                            </motion.div>
                                        ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="social">
                    <GlassCard>
                        <GlassCardHeader>
                            <h3 className="text-lg font-semibold">Social Media Handle Checker</h3>
                            <p className="text-sm text-muted-foreground">
                                Check availability of your newsletter name across social media platforms
                            </p>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <div className="flex sm:flex-row flex-col gap-4">
                                <div className="flex w-full">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted/50 text-muted-foreground">
                                        @
                                    </span>
                                    <Input
                                        placeholder="Enter a name to check availability..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && searchTerm) {
                                                handleSocialCheck(searchTerm)
                                            }
                                        }}
                                    />
                                </div>
                                    
                                <Button
                                    onClick={() => handleSocialCheck(searchTerm)}
                                    disabled={!searchTerm || isChecking}
                                >
                                    {isChecking ? (
                                        <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Check Availability
                                        </>
                                    )}
                                </Button>
                            </div>

                            <AnimatePresence>
                                {socialChecks[searchTerm] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
                                    >
                                        {[
                                            { name: 'Twitter', icon: Twitter, color: 'text-blue-400', result: socialChecks[searchTerm].twitter },
                                            { name: 'Instagram', icon: Instagram, color: 'text-pink-500', result: socialChecks[searchTerm].instagram },
                                            { name: 'Facebook', icon: Facebook, color: 'text-blue-600', result: socialChecks[searchTerm].facebook }
                                        ].map((platform) => (
                                            <div
                                                key={platform.name}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-lg border",
                                                    "hover:border-primary/50 transition-colors"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                                                    <span>{platform.name}</span>
                                                </div>
                                                <Badge
                                                    variant={platform.result ? "default" : "destructive"}
                                                    className={platform.result ? 
                                                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                                                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                    }
                                                >
                                                    {platform.result ? "Available" : "Taken"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {searchTerm && socialChecks[searchTerm] && (
                                <div className="text-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm("")
                                        }}
                                    >
                                        Check Another Name
                                    </Button>
                                </div>
                            )}
                        </GlassCardContent>
                    </GlassCard>
                </TabsContent>
            </Tabs>
        </div>
    )
}
