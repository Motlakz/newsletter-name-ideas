export enum PlanId {
    FREE = 'FREE',
    MUSE_MONTHLY = 'MUSE_MONTHLY',
    MUSE_ANNUAL = 'MUSE_ANNUAL',
    FORGE = 'FORGE'
}

export interface PlanDetails {
    id: PlanId;
    name: string;
    label: string;
    price: number;
    planId: string;
    priceId: string;
    features: string[];
    interval: 'monthly' | 'annual' | 'one_time' | null;
    durationMonths: number | null;
}

export const Plans: PlanDetails[] = [
    {
        id: PlanId.FREE,
        name: 'Free',
        label: 'Free Forever',
        price: 0,
        planId: '',
        priceId: '',
        features: [
            'Newsletter Name Generator',
            'Domain Availability Checker',
            'SEO Analysis'
        ],
        interval: null,
        durationMonths: null
    },
    {
        id: PlanId.MUSE_MONTHLY,
        name: 'Muse',
        label: 'Monthly Plan',
        price: 899,
        planId: process.env.NEXT_PUBLIC_MUSE_MONTHLY_ID!,
        priceId: process.env.NEXT_PUBLIC_MUSE_MONTHLY_PRICE_ID!,
        features: [
            'Newsletter Name Generator',
            'Domain Availability Checker',
            'SEO Analysis',
            'Social Handle Check',
            'Trend Analytics'
        ],
        interval: 'monthly',
        durationMonths: 1
    },
    {
        id: PlanId.MUSE_ANNUAL,
        name: 'Muse',
        label: 'Annual Plan',
        price: 674 * 12,
        planId: process.env.NEXT_PUBLIC_MUSE_ANNUAL_ID!,
        priceId: process.env.NEXT_PUBLIC_MUSE_ANNUAL_PRICE_ID!,
        features: [
            'Newsletter Name Generator',
            'Domain Availability Checker',
            'SEO Analysis',
            'Social Handle Check',
            'Trend Analytics',
            '25% discount'
        ],
        interval: 'annual',
        durationMonths: 12
    },
    {
        id: PlanId.FORGE,
        name: 'Forge',
        label: 'Lifetime Access',
        price: 1999,
        planId: process.env.NEXT_PUBLIC_FORGE_ID!,
        priceId: process.env.NEXT_PUBLIC_FORGE_PRICE_ID!,
        features: [
            'Everything in Muse',
            'Lifetime Access',
            'Priority Support',
            'Early Access to New Features'
        ],
        interval: 'one_time',
        durationMonths: null
    }
];

// Feature sets for each plan
export const planFeatures = {
    [PlanId.FREE]: [
        'Newsletter Name Generator',
        'Domain Availability Checker',
        'SEO Analysis'
    ],
    [PlanId.MUSE_MONTHLY]: [
        'Newsletter Name Generator',
        'Domain Availability Checker',
        'SEO Analysis',
        'Social Handle Check',
        'Trend Analytics'
    ],
    [PlanId.MUSE_ANNUAL]: [
        'Everything in Monthly Plan',
        '25% Annual Discount',
        'Priority Support'
    ],
    [PlanId.FORGE]: [
        'Everything in Muse',
        'Lifetime Access',
        'Priority Support',
        'Early Access to New Features'
    ]
};

// Helper functions
export function getPlanById(planId: PlanId): PlanDetails | undefined {
    const plan = Plans.find(plan => plan.id === planId);
    
    if (!plan) {
        console.error(`No plan found for ID: ${planId}`);
        return undefined;
    }

    // Validate paid plans have IDs
    if (plan.id !== PlanId.FREE && (!plan.planId || !plan.priceId)) {
        console.error('Plan found but missing IDs:', {
            id: plan.id,
            name: plan.name,
            planId: plan.planId,
            priceId: plan.priceId
        });
        return undefined;
    }

    return plan;
}

export function getPlanByPriceId(priceId: string): PlanDetails | undefined {
    return Plans.find(plan => plan.priceId === priceId);
}

export function formatPrice(price: number): string {
    return (price / 100).toFixed(2);
}

export function getAnnualSavings(monthlyPrice: number, annualPrice: number): number {
    const monthlyTotal = monthlyPrice * 12;
    return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
}

// Validation function
export function validatePlans(): boolean {
    let isValid = true;
    
    Plans.forEach(plan => {
        if (plan.id !== PlanId.FREE) {
            if (!plan.planId) {
                console.error(`Missing planId for ${plan.name} (${plan.label})`);
                isValid = false;
            }
            if (!plan.priceId) {
                console.error(`Missing priceId for ${plan.name} (${plan.label})`);
                isValid = false;
            }
        }
    });

    return isValid;
}
