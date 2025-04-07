export enum PlanId {
    FREE = 'free',
    MUSE = 'muse',
    FORGE = 'forge'
}

export interface PlanDetails {
    id: PlanId;
    name: string;
    price: number;
    annualPrice?: number;
    features: string[];
    durationMonths: number | null;
}

export const Plans: PlanDetails[] = [
    {
        id: PlanId.FREE,
        name: 'Free',
        price: 0,
        features: ['Newsletter Name Generator', 'Domain Availability Checker', 'SEO Analysis'],
        durationMonths: null
    },
    {
        id: PlanId.MUSE,
        name: 'Muse Monthly',
        price: 899, // $8.99
        annualPrice: 674 * 12, // $6.74 * 12 months
        features: ['Newsletter Name Generator', 'Domain Availability Checker', 'SEO Analysis', 'Social Handle Check', 'Trend Analytics'],
        durationMonths: 1
    },
    {
        id: PlanId.FORGE,
        name: 'Forge',
        price: 1999, // $19.99
        features: ['Newsletter Name Generator', 'Domain Availability Checker', 'SEO Analysis', 'Social Handle Check', 'Trend Analytics'],
        durationMonths: null // Lifetime
    }
];

export interface PurchaseResult {
    success: boolean;
    message: string;
    planId: PlanId;
    expiresAt?: Date;
    error?: string;
}
