"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { GeneratedName } from '@/types/templates'

interface NewsletterContextType {
    names: GeneratedName[]
    favorites: GeneratedName[]
    totalGenerated: number

    setNames: (names: GeneratedName[]) => void
    addToFavorites: (name: GeneratedName) => void
    removeFromFavorites: (nameId: string) => void
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined)

export function NewsletterProvider({ children }: { children: ReactNode }) {
    const [names, setNames] = useState<GeneratedName[]>([])
    const [favorites, setFavorites] = useState<GeneratedName[]>([])
    const [totalGenerated, setTotalGenerated] = useState(0)

    // Load favorites from localStorage on mount
    useEffect(() => {
        const storedFavorites = localStorage.getItem("newsletterFavorites")
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites))
        }
    }, [])

    const addToFavorites = (name: GeneratedName) => {
        setFavorites(prev => {
            if (prev.length >= 10) return prev
            if (!prev.some(f => f.id === name.id)) {
                const updated = [...prev, { ...name, isFavorite: true }]
                localStorage.setItem("newsletterFavorites", JSON.stringify(updated))
                return updated
            }
            return prev
        })
    }

    const removeFromFavorites = (nameId: string) => {
        setFavorites(prev => {
            const updated = prev.filter(f => f.id !== nameId)
            localStorage.setItem("newsletterFavorites", JSON.stringify(updated))
            return updated
        })
    }

    const setNamesWithTracking = (newNames: GeneratedName[]) => {
        setNames(newNames)
        setTotalGenerated(prev => prev + newNames.length)
    }

    return (
        <NewsletterContext.Provider
            value={{
                names,
                favorites,
                totalGenerated,
                setNames: setNamesWithTracking,
                addToFavorites,
                removeFromFavorites,
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
