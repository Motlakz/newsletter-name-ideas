"use client"

import { useRouter } from "next/navigation";
import { Check, Globe2, Search, Users2, BarChart3, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from "framer-motion"
import { useState } from 'react'
import { Switch } from '../ui/switch'
import { useUser } from "@/hooks/use-auth";
import Script from "next/script";

interface Feature {
  name: string
  description: string
  icon: React.ReactNode
  included: 'free' | 'muse' | 'forge' | 'both'
}

interface PricingToggleProps {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}

const OVERLAY_IDS = {
  MUSE_MONTHLY: process.env.NEXT_PUBLIC_MUSE_MONTHLY_ID || "",
  MUSE_ANNUAL: process.env.NEXT_PUBLIC_MUSE_ANNUAL_ID || "",
  FORGE: process.env.NEXT_PUBLIC_FORGE_ID || "",
}

const PricingToggle = ({ isAnnual, setIsAnnual }: PricingToggleProps) => {  
  return (
    <div className="mt-8 flex flex-col items-center gap-6">
      <div className="relative flex items-center gap-8">
        <motion.div
          animate={{ opacity: isAnnual ? 0.5 : 1 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm font-medium">Monthly</span>
          <motion.div
            animate={{ scale: isAnnual ? 0.9 : 1 }}
            className="text-xl"
          >
          💫
          </motion.div>
        </motion.div>

        <div className="relative">
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
          />
        </div>

        <motion.div
          animate={{ opacity: isAnnual ? 1 : 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm font-medium">Annual</span>
          <motion.div
            animate={{ scale: isAnnual ? 1 : 0.9 }}
            className="text-xl"
          >
            ⭐
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: isAnnual ? 1 : 0,
          y: isAnnual ? 0 : -10
        }}
        className="flex items-center gap-2 text-primary"
      >
        <span className="text-sm font-medium">Save 25%</span>
        <motion.div
          animate={{ 
            rotate: isAnnual ? [0, -10, 10, -10, 10, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          🎉
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function PricingComponent() {
    const [isAnnual, setIsAnnual] = useState(false)
    const router = useRouter();
    const { user } = useUser()

    const getCheckoutUrl = (overlayId: string) => {
      const baseUrl = `https://scrape-sync.stage.fungies.net/checkout-element/${overlayId}`
      return user?.$id ? `${baseUrl}?appwrite_user_id=${user.$id}` : baseUrl
    }
    
    const features: Feature[] = [
      {
        name: "Newsletter Name Generator",
        description: "AI-powered name generation with customization options",
        icon: <Sparkles className="h-5 w-5" />,
        included: 'both'
      },
      {
        name: "Domain Availability Checker",
        description: "Instant domain checks for your newsletter names",
        icon: <Globe2 className="h-5 w-5" />,
        included: 'both'
      },
      {
        name: "SEO Analysis",
        description: "Detailed SEO insights for your newsletter names",
        icon: <Search className="h-5 w-5" />,
        included: 'both'
      },
      {
        name: "Social Handle Check",
        description: "Cross-platform username availability check",
        icon: <Users2 className="h-5 w-5" />,
        included: 'muse'
      },
      {
        name: "Trend Analytics",
        description: "Industry trends and naming pattern analysis",
        icon: <BarChart3 className="h-5 w-5" />,
        included: 'muse'
      }
    ]

    const handleSubscribe = () => {
      router.push('/sign-up');
    };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 bg-pink-300/10">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mt-2 text-3xl font-bold text-foreground">
          Choose Your Creative Journey
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Select the plan that best fits your newsletter needs
        </p>
      </div>

      <PricingToggle 
        isAnnual={isAnnual}
        setIsAnnual={setIsAnnual}
      />

      <div className="mt-16 flex flex-wrap gap-4 justify-center">
        {/* Free Plan */}
        <GlassCard className="rounded-3xl">
          <div className="p-8">
            <h3 className="text-lg font-semibold leading-8">Free</h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Get started with essential naming tools
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight">$0</span>
              <span className="text-sm font-semibold leading-6">/forever</span>
            </p>
            <Button
              variant="outline"
              className="mt-6 w-full"
              onClick={() => router.push('/sign-up')}
            >
              Get Started
            </Button>
          </div>
        </GlassCard>

        {/* Muse Monthly */}
        <GlassCard className="rounded-3xl ring-2 ring-primary">
          <div className="p-8">
            <h3 className="text-lg font-semibold leading-8">Muse Monthly</h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Perfect for creators who need regular inspiration
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight">
                ${isAnnual ? '6.74' : '8.99'}
              </span>
              <span className="text-sm font-semibold leading-6">/month</span>
            </p>
            <Button
              className="mt-6 w-full"
              data-fungies-checkout-url={getCheckoutUrl(
                isAnnual ? OVERLAY_IDS.MUSE_ANNUAL : OVERLAY_IDS.MUSE_MONTHLY
              )}
              data-fungies-mode="overlay"
            >
              Subscribe to Muse
            </Button>
          </div>
        </GlassCard>

        {/* Forge Lifetime */}
        <GlassCard className="rounded-3xl">
          <div className="p-8">
            <h3 className="text-lg font-semibold leading-8">Forge</h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Lifetime access to premium features
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight">$19.99</span>
              <span className="text-sm font-semibold leading-6">/lifetime</span>
            </p>
            <Button
              variant="outline"
              className="mt-6 w-full"
              onClick={handleSubscribe}
            >
              Get Lifetime Access
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Feature Comparison */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">Feature Comparison</h3>
        
        {/* Column Headers */}
        <div className="grid grid-cols-4 items-center p-4 mb-4">
          <div className="col-span-2">
            <h4 className="font-semibold">Features</h4>
          </div>
          <div className="text-center">
            <h4 className="font-semibold">Free</h4>
          </div>
          <div className="text-center">
            <h4 className="font-semibold">Paid Plans</h4>
          </div>
        </div>

        <div className="grid gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="grid grid-cols-4 border shadow items-center p-4 rounded-lg bg-muted/30"
            >
              <div className="col-span-2 flex items-center gap-3">
                {feature.icon}
                <div>
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              <div className="text-center">
                {(feature.included === 'free' || feature.included === 'both') ? (
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                ) : (
                  <X className="h-5 w-5 mx-auto text-red-500" />
                )}
              </div>
              <div className="text-center">
                {(feature.included === 'muse' || feature.included === 'both' || feature.included === 'forge') ? (
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                ) : (
                  <X className="h-5 w-5 mx-auto text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 text-sm text-muted-foreground text-center">
          <p>✓ Included &nbsp;&nbsp; ✕ Not included</p>
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground">
          Need help choosing? <button className="text-primary underline" onClick={handleSubscribe}>Contact our team</button>
        </p>
      </div>
      <Script 
        src='https://cdn.jsdelivr.net/npm/@fungies/fungies-js@0.0.6' 
        defer 
        data-auto-init
      />
    </div>
  )
}
