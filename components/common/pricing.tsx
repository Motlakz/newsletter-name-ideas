"use client"

import { useRouter } from "next/navigation";
import { Check, Globe2, Search, Users2, BarChart3, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from "framer-motion"
import { useEffect, useState } from 'react'
import { Switch } from '../ui/switch'
import { useUser } from "@/hooks/use-auth";
import { formatPrice, getPlanById, PlanId } from "@/types/billing";
import Link from "next/link";

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
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const musePlan = isAnnual 
      ? getPlanById(PlanId.MUSE_ANNUAL)
      : getPlanById(PlanId.MUSE_MONTHLY);
  
  const forgePlan = getPlanById(PlanId.FORGE);
  const freePlan = getPlanById(PlanId.FREE);

  useEffect(() => {
    if (!musePlan || !forgePlan || !freePlan) {
        setError('Failed to load plan information');
    }
  }, [musePlan, forgePlan, freePlan]);

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
  ];

  const createSubscription = async (planId: PlanId) => {
    setError(null);
    setIsLoading(true);

    try {
        if (!user) {
            router.push('/register');
            return;
        }

        const response = await fetch('/api/subscription/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId,
                userId: user.$id,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to create subscription');
        }

        // Check subscription status
        if (data.data?.status === 'active' || data.data?.status === 'trialing') {
            // Subscription is active, redirect to dashboard
            router.push('/dashboard');
        } else if (data.data?.lastPayment?.status === 'PENDING') {
            // Payment pending, might need to wait or redirect to payment
            router.push(`/payment-pending?subscriptionId=${data.data.subscriptionId}`);
        } else {
            // Handle other states or show appropriate message
            setError('Subscription status unclear. Please contact support.');
        }

    } catch (err) {
        console.error('Subscription creation error:', err);
        setError(
            err instanceof Error 
                ? err.message 
                : 'Failed to create subscription. Please try again.'
        );
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubscriptionClick = (planId: PlanId) => {
      if (!user) {
          router.push('/register');
          return;
      }
      createSubscription(planId);
  };

  if (userLoading) {
      return <div className="flex justify-center items-center min-h-screen">
          Loading...
      </div>;
  }
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

      {error && (
        <div className="mt-4 text-red-500 text-center">
          {error}
        </div>
      )}

      <div className="mt-16 flex flex-wrap gap-4 justify-center">
        {/* Free Plan */}
        <GlassCard className="rounded-3xl">
            <div className="p-8">
                <h3 className="text-lg font-semibold leading-8">{freePlan?.name}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Get started with essential naming tools
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight">
                        $0
                    </span>
                </p>
                <Button
                    variant="outline"
                    className="mt-6 w-full"
                    onClick={() => handleSubscriptionClick(PlanId.FREE)}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Get Started'}
                </Button>
            </div>
        </GlassCard>

        {/* Muse Plan */}
        <GlassCard className="rounded-3xl ring-2 ring-primary">
            <div className="p-8">
                <h3 className="text-lg font-semibold leading-8">
                    {musePlan?.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Perfect for creators who need regular inspiration
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight">
                        ${formatPrice(musePlan?.price || 0)}
                    </span>
                    <span className="text-sm font-semibold leading-6">
                        /{isAnnual ? 'year' : 'month'}
                    </span>
                </p>
                <Button
                    className="mt-6 w-full"
                    onClick={() => handleSubscriptionClick(isAnnual ? PlanId.MUSE_ANNUAL : PlanId.MUSE_MONTHLY)}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Subscribe to Muse'}
                </Button>
            </div>
        </GlassCard>

        {/* Forge Plan */}
        <GlassCard className="rounded-3xl">
            <div className="p-8">
                <h3 className="text-lg font-semibold leading-8">{forgePlan?.name}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Lifetime access to premium features
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight">
                        ${formatPrice(forgePlan?.price || 0)}
                    </span>
                    <span className="text-sm font-semibold leading-6">/lifetime</span>
                </p>
                <Button
                    variant="outline"
                    className="mt-6 w-full"
                    onClick={() => handleSubscriptionClick(PlanId.FORGE)}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Get Lifetime Access'}
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
          Need help choosing? <Link href="/support" className="text-primary underline">Contact our team</Link>
        </p>
      </div>
    </div>
  )
}
