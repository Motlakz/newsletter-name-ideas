"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'
import { GeneratedName } from '@/types/templates'
import * as serverActions from '@/actions/data'
import { Activity, SavedName, SocialHandleCheck } from '@/types/data'

interface NewsletterContextType {
    names: GeneratedName[]
    favorites: GeneratedName[]
    totalGenerated: number
    recentActivity: Activity[]
    categories: { [key: string]: number }
    savedNames: SavedName[]
    socialChecks: { [key: string]: SocialHandleCheck }
    
    setNames: (names: GeneratedName[]) => void
    addToFavorites: (name: GeneratedName) => Promise<void>
    removeFromFavorites: (nameId: string) => Promise<void>
    addActivity: (activity: { type: string; name: string }) => Promise<void>
    searchSavedNames: (term: string) => Promise<SavedName[]>
    addSavedName: (name: SavedName) => Promise<void>
    deleteSavedName: (id: string) => Promise<void>
    editSavedName: (id: string, updates: Partial<SavedName>) => Promise<void>
    checkSocialHandles: (name: string) => Promise<SocialHandleCheck>
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined)

// Helper function to convert server data to client format
const convertServerToClientName = (serverName: any): SavedName => ({
    id: serverName.id,
    name: serverName.name,
    category: serverName.category,
    description: serverName.description || '',
    dateAdded: new Date(serverName.createdAt).toDateString(),
    lastModified: new Date(serverName.updatedAt).toDateString()
})

export function NewsletterProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoaded } = useAuth()
    const [names, setNames] = useState<GeneratedName[]>([])
    const [favorites, setFavorites] = useState<GeneratedName[]>([])
    const [totalGenerated, setTotalGenerated] = useState(0)
    const [recentActivity, setRecentActivity] = useState<Activity[]>([])
    const [categories, setCategories] = useState<{ [key: string]: number }>({})
    const [savedNames, setSavedNames] = useState<SavedName[]>([])
    const [socialChecks, setSocialChecks] = useState<{ [key: string]: SocialHandleCheck }>({})
    const [isInitialized, setIsInitialized] = useState(false)

    // Load initial data based on auth state
    useEffect(() => {
        if (!isLoaded) return

        const loadData = async () => {
            if (isSignedIn) {
                try {
                    const dashboardData = await serverActions.getDashboardData()
                    if (dashboardData.success) {
                        const convertedNames = dashboardData.data.savedNames.map(convertServerToClientName)
                        setSavedNames(convertedNames)
                        
                        // Convert savedNames to GeneratedName format
                        const convertedFavorites: GeneratedName[] = convertedNames.map(name => ({
                            id: name.id,
                            name: name.name,
                            category: name.category,
                            description: '', // Add a default description or get it from your data
                            isFavorite: true // Since these are saved names, they are favorites
                        }))
                        setFavorites(convertedFavorites)
                        
                        const convertedActivity = dashboardData.data.recentActivity.map(activity => ({
                            ...activity,
                            date: new Date(activity.date).toDateString()
                        }))
                        setRecentActivity(convertedActivity)
                        
                        setTotalGenerated(dashboardData.data.totalGenerated)
                        setSocialChecks(dashboardData.data.socialChecks)
                        
                        const newCategories: { [key: string]: number } = {}
                        convertedNames.forEach(name => {
                            if (name.category) {
                                newCategories[name.category] = (newCategories[name.category] || 0) + 1
                            }
                        })
                        setCategories(newCategories)
                    }
                } catch (error) {
                    console.error('Error loading dashboard data:', error)
                }
            } else {
                // Load from localStorage for unauthenticated users
                const storedData = {
                    favorites: localStorage.getItem("newsletterFavorites"),
                    savedNames: localStorage.getItem("newsletterSavedNames"),
                    socialChecks: localStorage.getItem("newsletterSocialChecks"),
                    activity: localStorage.getItem("newsletterActivity"),
                    totalGenerated: localStorage.getItem("newsletterTotalGenerated")
                }

                if (storedData.favorites) {
                    const parsedFavorites = JSON.parse(storedData.favorites)
                    setFavorites(parsedFavorites.slice(0, 10))
                }
                if (storedData.savedNames) setSavedNames(JSON.parse(storedData.savedNames))
                if (storedData.socialChecks) setSocialChecks(JSON.parse(storedData.socialChecks))
                if (storedData.activity) setRecentActivity(JSON.parse(storedData.activity))
                if (storedData.totalGenerated) setTotalGenerated(JSON.parse(storedData.totalGenerated))
            }
            setIsInitialized(true)
        }

        loadData()
    }, [isSignedIn, isLoaded])

    // Save data to localStorage for unauthenticated users
    useEffect(() => {
        if (!isLoaded || isSignedIn || !isInitialized) return

        const dataToStore = {
            favorites,
            savedNames,
            socialChecks,
            recentActivity,
            totalGenerated
        }

        Object.entries(dataToStore).forEach(([key, value]) => {
            localStorage.setItem(`newsletter${key.charAt(0).toUpperCase() + key.slice(1)}`, JSON.stringify(value))
        })
    }, [isSignedIn, isLoaded, isInitialized, favorites, savedNames, socialChecks, recentActivity, totalGenerated])

    const addActivity = async (activity: { type: string; name: string }) => {
        const newActivity: Activity = {
            id: Date.now().toString(),
            ...activity,
            date: new Date().toDateString()
        }
    
        setRecentActivity(prev => {
            const updated = [newActivity, ...prev].slice(0, 10)
            return updated
        })
    
        if (isSignedIn) {
            try {
                await serverActions.trackActivity(activity.type as any, activity.name)
            } catch (error) {
                console.error('Error tracking activity:', error)
            }
        }
    }

    const addToFavorites = async (name: GeneratedName) => {
        if (isSignedIn) {
            try {
                const result = await serverActions.saveFavoriteName({
                    name: name.name,
                    category: name.category || 'default',
                    description: name.description
                })
                if (result.success) {
                    const convertedName = convertServerToClientName(result.data)
                    setSavedNames(prev => [...prev, convertedName])
                    
                    const newFavorite: GeneratedName = {
                        id: convertedName.id,
                        name: convertedName.name,
                        category: convertedName.category,
                        description: name.description || '',
                        isFavorite: true
                    }
                    setFavorites(prev => [...prev, newFavorite])
                    
                    await addActivity({ type: "Favorited", name: name.name })
                }
            } catch (error) {
                console.error('Error saving favorite:', error)
            }
        } else {
            setFavorites(prev => {
                if (prev.length >= 10) return prev
                if (!prev.some(f => f.id === name.id)) {
                  return [...prev, { ...name, isFavorite: true }]
                }
                return prev
            })
            await addActivity({ type: "Favorited", name: name.name })
        }
    }

    const removeFromFavorites = async (nameId: string) => {
        const nameToRemove = favorites.find(f => f.id === nameId)
        
        if (isSignedIn) {
            try {
                await serverActions.deleteSavedName(nameId)
                setSavedNames(prev => prev.filter(name => name.id !== nameId))
                setFavorites(prev => prev.filter(f => f.id !== nameId))
                if (nameToRemove) {
                    await addActivity({ type: "Removed from Favorites", name: nameToRemove.name })
                }
            } catch (error) {
                console.error('Error removing favorite:', error)
            }
        } else {
            setFavorites(prev => prev.filter(f => f.id !== nameId))
            if (nameToRemove) {
                await addActivity({ type: "Removed from Favorites", name: nameToRemove.name })
            }
        }
    }

    const searchSavedNames = async (term: string): Promise<SavedName[]> => {
        if (isSignedIn) {
            try {
                const result = await serverActions.searchSavedNames(term)
                return result.success ? result.data.map(convertServerToClientName) : []
            } catch (error) {
                console.error('Error searching names:', error)
                return []
            }
        } else {
            if (!term) return savedNames
            const lowercaseTerm = term.toLowerCase()
            return savedNames.filter(
                name => 
                    name.name.toLowerCase().includes(lowercaseTerm) ||
                    name.category.toLowerCase().includes(lowercaseTerm)
            )
        }
    }

    const addSavedName = async (name: SavedName) => {
        if (isSignedIn) {
            try {
                const result = await serverActions.saveFavoriteName({
                    name: name.name,
                    category: name.category,
                    description: name.description
                })
                if (result.success) {
                    const convertedName = convertServerToClientName(result.data)
                    setSavedNames(prev => [...prev, convertedName])
                    await addActivity({ type: "Saved", name: name.name })
                }
            } catch (error) {
                console.error('Error saving name:', error)
                throw error
            }
        } else {
            setSavedNames(prev => [...prev, {
                ...name,
                id: Math.random().toString(36).substr(2, 9),
                dateAdded: new Date().toDateString(),
                lastModified: new Date().toDateString()
            }])
            await addActivity({ type: "Saved", name: name.name })
        }
    }

    const editSavedName = async (id: string, updates: Partial<SavedName>) => {
        if (isSignedIn) {
            try {
                const result = await serverActions.editSavedName(id, {
                    name: updates.name!,
                    category: updates.category!,
                })
                if (result.success) {
                    const convertedName = convertServerToClientName(result.data)
                    setSavedNames(prev => 
                        prev.map(name => name.id === id ? convertedName : name)
                    )
                    await addActivity({ type: "Edited", name: updates.name || "Saved name" })
                }
            } catch (error) {
                console.error('Error editing name:', error)
                throw error
            }
        } else {
            setSavedNames(prev => 
                prev.map(name => 
                    name.id === id 
                    ? { ...name, ...updates, lastModified: new Date().toDateString() } 
                    : name
                )
            )
            await addActivity({ type: "Edited", name: updates.name || "Saved name" })
        }
    }

    const deleteSavedName = async (id: string) => {
        const nameToDelete = savedNames.find(n => n.id === id)
        
        if (isSignedIn) {
            try {
                await serverActions.deleteSavedName(id)
                setSavedNames(prev => prev.filter(name => name.id !== id))
                if (nameToDelete) {
                    await addActivity({ type: "Deleted", name: nameToDelete.name })
                }
            } catch (error) {
                console.error('Error deleting name:', error)
                throw error
            }
        } else {
            setSavedNames(prev => prev.filter(name => name.id !== id))
            if (nameToDelete) {
                await addActivity({ type: "Deleted", name: nameToDelete.name })
            }
        }
    }

    const checkSocialHandles = async (name: string): Promise<SocialHandleCheck> => {
        if (isSignedIn) {
            try {
                const results = {
                    twitter: Math.random() > 0.5,
                    instagram: Math.random() > 0.5,
                    facebook: Math.random() > 0.5
                }
                await serverActions.storeSocialCheck(name, results)
                setSocialChecks(prev => ({
                    ...prev,
                    [name]: results
                }))
                await addActivity({ type: "Social Check", name })
                return results
            } catch (error) {
                console.error('Error checking social handles:', error)
                throw error
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
            const results = {
                twitter: Math.random() > 0.5,
                instagram: Math.random() > 0.5,
                facebook: Math.random() > 0.5
            }
            
            setSocialChecks(prev => ({
                ...prev,
                [name]: results
            }))
            
            await addActivity({ type: "Social Check", name })
            return results
        }
    }

    const setNamesWithTracking = (newNames: GeneratedName[]) => {
        setNames(newNames)
        setTotalGenerated(prev => prev + newNames.length)
        addActivity({ type: "Generated", name: `${newNames.length} names` })
            .catch(error => console.error('Error tracking generation:', error))
    }

    return (
        <NewsletterContext.Provider
            value={{
                names,
                favorites,
                totalGenerated,
                recentActivity,
                categories,
                savedNames,
                socialChecks,
                setNames: setNamesWithTracking,
                addToFavorites,
                removeFromFavorites,
                addActivity,
                searchSavedNames,
                addSavedName,
                deleteSavedName,
                editSavedName,
                checkSocialHandles,
            }}
        >
            {children}
        </NewsletterContext.Provider>
    )
}

export function useNewsletter() {
    const context = useContext(NewsletterContext)
    if (context === undefined) {
        throw new Error('useNewsletter must be used within a NewsletterProvider')
    }
    return context
}
