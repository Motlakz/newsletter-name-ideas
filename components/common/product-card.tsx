import { useState } from "react";
import { Product } from "@/types/billing";
import { useRouter } from "next/navigation";
import { GlassCard } from "../ui/glass-card";
import { Button } from "../ui/button";

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
  
    const checkoutProduct = async (productId: number, is_recurring: boolean) => {
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
  
    return (
        <GlassCard className={`rounded-3xl ${isHighlighted ? 'ring-2 ring-primary' : ''}`}>
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
                <Button
                    className={`mt-6 w-full ${isHighlighted ? '' : 'variant-outline'}`}
                    onClick={() => checkoutProduct(product.product_id, product.is_recurring)}
                    disabled={loading}
                >
                    {loading ? "Processing..." : product.is_recurring ? "Subscribe to Muse" : "Get Lifetime Access"}
                </Button>
            </div>
        </GlassCard>
    );
}
