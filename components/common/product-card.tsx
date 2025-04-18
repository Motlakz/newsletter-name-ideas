import { useState, useEffect } from "react";
import { Product } from "@/types/billing";
import { useRouter } from "next/navigation";
import { GlassCard } from "../ui/glass-card";
import { Button } from "../ui/button";
import { useAuth } from "@clerk/nextjs";

export default function ProductGlassCard({ 
    product, 
    isHighlighted = false, 
    isAnnual = false
}: { 
    product: Product, 
    isHighlighted?: boolean,
    isAnnual?: boolean
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { isSignedIn } = useAuth();
  
    const checkoutProduct = async (productId: number, is_recurring: boolean) => {
        if (!isSignedIn) {
            // Save the return URL in localStorage before redirecting
            localStorage.setItem('returnToPlans', 'true');
            
            // Redirect to sign-in
            router.push("/sign-in");
            return;
        }

        setLoading(true);
        
        let productType = "onetime";
        if (is_recurring) {
            productType = "subscription";
        }
      
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/${productType}?productId=${productId}`, {
                cache: "no-store",
            });
            const data = await response.json();
            router.push(data.payment_link);
        } catch (error) {
            console.error("Checkout error:", error);
            setLoading(false);
        }
    };
    
    // Check if user just signed in and should be redirected to plans
    useEffect(() => {
        if (isSignedIn && typeof window !== 'undefined') {
            const shouldReturnToPlans = localStorage.getItem('returnToPlans') === 'true';
            
            if (shouldReturnToPlans) {
                // Clear the flag
                localStorage.removeItem('returnToPlans');
                
                // Redirect to plans section
                router.push('/#plans');
            }
        }
    }, [isSignedIn, router]);
  
    return (
        <GlassCard className={`rounded-3xl max-w-lg w-full ${isHighlighted ? 'ring-2 ring-primary' : ''}`}>
            <div className="p-8">
                <h3 className="text-lg font-semibold leading-8">{product.name}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {product.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight">
                        ${(product.price / 100)}
                    </span>
                    {product.is_recurring && (
                        <span className="text-sm font-semibold leading-6">
                            /{isAnnual ? 'year' : 'month'}
                        </span>
                    )}
                </p>
                {product.is_recurring && isAnnual && (
                    <p className="text-sm text-primary dark:text-purple-400 mt-2">
                        ${((product.price / 100) / 12).toFixed(2)}/month charged annually
                    </p>
                )}
                <Button
                    className={`mt-6 text-white highlight-mini w-full ${isHighlighted ? '' : 'variant-outline'}`}
                    onClick={() => checkoutProduct(product.product_id, product.is_recurring)}
                    disabled={loading}
                >
                    {loading ? "Processing..." : product.is_recurring ? "Subscribe to Muse" : "Get Lifetime Access"}
                </Button>
            </div>
        </GlassCard>
    );
}
