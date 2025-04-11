import { NextResponse } from "next/server";
import { dodopayments } from "@/lib/dodopayments";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import type { CountryCode } from "dodopayments";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import { decrypt, encrypt } from "@/lib/helper/crypto";

export const dynamic = 'force-dynamic';

function validateCountryCode(country: string): CountryCode {
    const validCountryCodes = ["US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "JP"] as const;
    const upperCountry = country.toUpperCase();
    
    if (validCountryCodes.includes(upperCountry as any)) {
        return upperCountry as CountryCode;
    }
    return "US" as CountryCode;
}

async function getOrCreateUser(userId: string, user: any) {
    try {
        let dbUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: userId,
                    email: user.emailAddresses[0]?.emailAddress || '',
                }
            });
        }

        return dbUser;
    } catch (error) {
        console.error("Error in getOrCreateUser:", error);
        throw error;
    }
}

function mapDodoStatus(dodoStatus: string | null | undefined): SubscriptionStatus {
    if (!dodoStatus) {
        console.log("No status provided from DodoPayments, using PENDING as default");
        return SubscriptionStatus.PENDING;
    }
    
    const statusMap = new Map<string, SubscriptionStatus>([
        ['active', SubscriptionStatus.ACTIVE],
        ['pending', SubscriptionStatus.PENDING],
        ['on_hold', SubscriptionStatus.ON_HOLD],
        ['cancelled', SubscriptionStatus.CANCELLED],
        ['failed', SubscriptionStatus.FAILED]
    ]);
  
    const normalizedStatus = dodoStatus.toLowerCase();
    const mappedStatus = statusMap.get(normalizedStatus) || SubscriptionStatus.PENDING;
    
    console.log(`Mapped DodoPayments status '${dodoStatus}' to '${mappedStatus}'`);
    return mappedStatus;
}

async function updateSubscriptionFromUrlParams(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const encryptedSubscriptionId = searchParams.get("subscription_id");
    
    if (status && encryptedSubscriptionId) {
        console.log(`Found status=${status} and encrypted subscription_id in URL params`);
        
        try {
            // Decrypt the subscription ID
            const subscriptionId = decrypt(encryptedSubscriptionId);
            
            const subscription = await prisma.subscription.findUnique({
                where: { id: subscriptionId }
            });
            
            if (subscription) {
                const mappedStatus = mapDodoStatus(status);
                
                await prisma.subscription.update({
                    where: { id: subscriptionId },
                    data: {
                        status: mappedStatus,
                        metadata: {
                            ...(subscription.metadata as any || {}),
                            statusHistory: [
                                ...((subscription.metadata as any)?.statusHistory || []),
                                {
                                    status: mappedStatus,
                                    timestamp: new Date().toISOString(),
                                    reason: "Status updated from URL parameters"
                                }
                            ],
                            urlParamStatus: status
                        }
                    }
                });
                
                console.log(`Updated subscription ${subscriptionId} status to ${mappedStatus} based on URL params`);
                return true;
            }
        } catch (error) {
            console.error("Error updating subscription from URL params:", error);
        }
    }
    
    return false;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
        return NextResponse.json(
            { error: "Product ID is required" },
            { status: 400 }
        );
    }

    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Ensure user exists in database
        const dbUser = await getOrCreateUser(userId, user);

        // Get customer profile if exists
        const customerProfile = await prisma.customerProfile.findUnique({
            where: { userId: dbUser.id }
        });

        const response = await dodopayments.subscriptions.create({
            billing: {
                city: customerProfile?.city || "",
                country: validateCountryCode(customerProfile?.country || "US"),
                state: customerProfile?.state || "",
                street: customerProfile?.street || "",
                zipcode: customerProfile?.zipcode || "",
            },
            customer: {
                email: user.emailAddresses[0]?.emailAddress || "",
                name: `${user.firstName} ${user.lastName}` || user.username || "",
            },
            payment_link: true,
            product_id: productId,
            quantity: 1,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        });

        const currentDate = new Date();
        const periodEnd = new Date(currentDate);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const subscriptionStatus = PaymentStatus.PENDING;

        await prisma.subscription.create({
            data: {
                id: response.subscription_id,
                userId: dbUser.id,
                status: subscriptionStatus,
                productId: productId,
                planName: "Subscription",
                amount: response.recurring_pre_tax_amount || 0,
                recurringAmount: response.recurring_pre_tax_amount,
                currency: "USD",
                interval: "month",
                startDate: currentDate,
                currentPeriodEnd: periodEnd,
                clientSecret: response.client_secret,
                paymentLink: response.payment_link,
                metadata: {
                    statusHistory: [{
                        status: subscriptionStatus,
                        timestamp: new Date().toISOString(),
                        reason: "Initial subscription creation"
                    }]
                }
            }
        });

        const secureResponse = {
            ...response,
            subscription_id: encrypt(response.subscription_id)
        };

        return NextResponse.json(secureResponse);
    } catch (error) {
        console.error('Subscription creation error:', error);
        return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    // Check if we need to update a subscription based on URL parameters
    await updateSubscriptionFromUrlParams(request);
    
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Ensure user exists in database
        const dbUser = await getOrCreateUser(userId, user);

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const { 
            billing,
            quantity = 1,
            productId
        } = body;

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        let customerProfile = await prisma.customerProfile.findUnique({
            where: { userId: dbUser.id }
        });

        if (billing && (billing.city || billing.country || billing.state || billing.street || billing.zipcode)) {
            customerProfile = await prisma.customerProfile.upsert({
                where: { userId: dbUser.id },
                update: {
                    city: billing.city || customerProfile?.city || "",
                    country: billing.country || customerProfile?.country || "US",
                    state: billing.state || customerProfile?.state || "",
                    street: billing.street || customerProfile?.street || "",
                    zipcode: billing.zipcode || customerProfile?.zipcode || "",
                },
                create: {
                    userId: dbUser.id,
                    dodoCustomerId: "",
                    name: `${user.firstName} ${user.lastName}` || user.username || "",
                    email: user.emailAddresses[0]?.emailAddress || "",
                    city: billing.city || "",
                    country: billing.country || "US",
                    state: billing.state || "",
                    street: billing.street || "",
                    zipcode: billing.zipcode || "",
                }
            });
        }

        const response = await dodopayments.subscriptions.create({
            billing: {
                city: billing?.city || customerProfile?.city || "",
                country: validateCountryCode(billing?.country || customerProfile?.country || "US"),
                state: billing?.state || customerProfile?.state || "",
                street: billing?.street || customerProfile?.street || "",
                zipcode: billing?.zipcode || customerProfile?.zipcode || "",
            },
            customer: {
                email: user.emailAddresses[0]?.emailAddress || "",
                name: `${user.firstName} ${user.lastName}` || user.username || "",
            },
            payment_link: true,
            product_id: productId,
            quantity: quantity,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        });

        const currentDate = new Date();
        const periodEnd = new Date(currentDate);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const subscriptionStatus = PaymentStatus.PENDING;

        await prisma.subscription.create({
            data: {
                id: response.subscription_id,
                userId: dbUser.id,
                status: subscriptionStatus,
                productId: productId,
                planName: "Subscription",
                amount: response.recurring_pre_tax_amount || 0,
                recurringAmount: response.recurring_pre_tax_amount,
                currency: "USD",
                interval: "month",
                startDate: currentDate,
                currentPeriodEnd: periodEnd,
                clientSecret: response.client_secret,
                paymentLink: response.payment_link,
                metadata: {
                    statusHistory: [{
                        status: subscriptionStatus,
                        timestamp: new Date().toISOString(),
                        reason: "Initial subscription creation"
                    }]
                }
            }
        });

        const secureResponse = {
            ...response,
            subscription_id: encrypt(response.subscription_id)
        };

        return NextResponse.json(secureResponse);
    } catch (error) {
        console.error('Subscription creation error:', error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        
        return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
        );
    }
}
