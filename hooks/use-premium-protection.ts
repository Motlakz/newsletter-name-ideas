import { useEffect, useState } from "react"
import { checkSubscriptionStatus } from "@/actions/data"

export const usePremiumProtection = (userId: string) => {
    const [isPremium, setIsPremium] = useState(false)
    const [overlayVisible, setOverlayVisible] = useState(true)

    useEffect(() => {
        const checkPremium = async () => {
            try {
                if (!userId) return
                const { subscribed } = await checkSubscriptionStatus()
                setIsPremium(subscribed)
                setOverlayVisible(!subscribed)
            } catch (error) {
                console.error('Premium check failed:', error)
                setOverlayVisible(true)
            }
        }

        checkPremium()
        const interval = setInterval(checkPremium, 30000)
        return () => clearInterval(interval)
    }, [userId])

  return { isPremium, overlayVisible }
}
