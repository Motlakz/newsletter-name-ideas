"use client"

import { useState, useEffect } from "react";
import { Check, Globe2, Search, Users2, BarChart3, X, Sparkles, Loader } from 'lucide-react';
import { motion } from "framer-motion";
import { Switch } from '../ui/switch';
import Link from "next/link";
import { Product } from "@/types/billing";
import ProductGlassCard from "./product-card";
import { IoSaveOutline } from "react-icons/io5";

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
  included: 'free' | 'paid' | 'both';
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
  );
};

export default function PricingComponent() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const features: Feature[] = [
    {
      name: "Newsletter Name Generator",
      description: "AI-powered name generation with customization options",
      icon: <Sparkles className="h-5 w-5" />,
      included: 'both'
    },
    {
      name: "Name Ideas Storage",
      description: "Unlimited storage for your favorite name ideas",
      icon: <IoSaveOutline className="h-5 w-5" />,
      included: 'paid'
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
      included: 'paid'
    },
    {
      name: "Trend Analytics",
      description: "Industry trends and naming pattern analysis",
      icon: <BarChart3 className="h-5 w-5" />,
      included: 'paid'
    }
  ];

  // Fetch products on component mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const fetchedProducts = await response.json();
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load pricing information');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  // Filter products based on the billing cycle
  const filteredProducts = products.filter(product => {
    if (isAnnual) {
      // Show annual products
      return product.is_recurring && product.name.toLowerCase().includes('annual');
    } else {
      // Show monthly products
      return product.is_recurring && product.name.toLowerCase().includes('monthly');
    }
  });

  // Add one-time products
  const oneTimeProducts = products.filter(product => !product.is_recurring);
  const allDisplayProducts = [...filteredProducts, ...oneTimeProducts];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-16 h-16" />
      </div>
    );
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
        {allDisplayProducts.map((product, index) => (
          <ProductGlassCard
            key={product.product_id}
            product={product}
            isHighlighted={index === 1}
            isAnnual={isAnnual}
          />
        ))}
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
                {(feature.included === 'paid' || feature.included === 'both') ? (
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
  );
}
