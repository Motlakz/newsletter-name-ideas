import { getPlanById, PlanId } from "@/types/billing";
import { FungiesResponse, WebhookPayload } from "@/types/webhook";
import { NextResponse } from "next/server";

const FUNGIES_PUBLIC_KEY = process.env.FUNGIES_TEST_PUBLIC_API_KEY;
const FUNGIES_SECRET_KEY = process.env.FUNGIES_TEST_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!FUNGIES_PUBLIC_KEY || !FUNGIES_SECRET_KEY || !APP_URL) {
    throw new Error("Missing required environment variables");
}

export async function POST(req: Request) {
    try {
        const { planId, userId } = await req.json();
        
        console.log('Received request:', { planId, userId });

        const plan = getPlanById(planId as PlanId);
        if (!plan) {
            console.error('Invalid plan:', planId);
            return NextResponse.json({ 
                success: false, 
                error: "Invalid plan" 
            }, { status: 400 });
        }

        console.log('Found plan:', plan);

        const headers: HeadersInit = {
            'x-fngs-public-key': FUNGIES_PUBLIC_KEY!,
            'x-fngs-secret-key': FUNGIES_SECRET_KEY!,
            'Content-Type': 'application/json'
        };

        const requestBody = {
            planId: plan.planId,
            priceId: plan.priceId,
            customerId: userId,
            returnUrl: `${APP_URL}/dashboard`,
            cancelUrl: `${APP_URL}/pricing`,
            skipTrial: false,
            skipNotifications: false
        };

        console.log('Sending request to Fungies:', {
            url: 'https://api.fungies.io/v0/subscriptions/create',
            headers: {
                ...headers,
                'x-fngs-secret-key': '***'
            },
            body: requestBody
        });

        const response = await fetch('https://api.fungies.io/v0/subscriptions/create', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        const responseData: FungiesResponse | WebhookPayload = await response.json();
        console.log('Fungies response:', {
            status: response.status,
            data: responseData
        });

        if (!response.ok) {
            console.error('Fungies error response:', responseData);
            throw new Error('Failed to create subscription');
        }

        // Handle both response types
        if ('type' in responseData && responseData.type === 'subscription_created') {
            // It's a WebhookPayload
            const webhookData = responseData as WebhookPayload;
            return NextResponse.json({
                success: true,
                data: {
                    subscriptionId: webhookData.data.subscription.id,
                    status: webhookData.data.subscription.status,
                    userId: webhookData.data.subscription.userId,
                    orderId: webhookData.data.subscription.orderId,
                    lastPayment: webhookData.data.lastPayment
                }
            });
        } else {
            // It's a FungiesResponse
            const fungiesData = responseData as FungiesResponse;
            return NextResponse.json({
                success: true,
                data: {
                    subscriptionId: fungiesData.data.subscription.id,
                    status: fungiesData.data.subscription.status,
                    userId: fungiesData.data.subscription.userId,
                    orderId: fungiesData.data.subscription.orderId,
                    lastPayment: fungiesData.data.subscription.lastPayment
                }
            });
        }

    } catch (error) {
        console.error("Detailed subscription creation error:", {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });

        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? {
                    stack: error instanceof Error ? error.stack : undefined
                } : undefined
            },
            { status: 500 }
        );
    }
}
