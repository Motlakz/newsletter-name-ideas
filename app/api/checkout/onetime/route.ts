import { NextResponse } from "next/server";
import { dodopayments } from "@/lib/dodopayments";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import type { CountryCode } from "dodopayments";
import { PaymentStatus } from "@prisma/client";
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
        // First try to find by userId
        let dbUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!dbUser) {
            // If not found by userId, check if user exists with the same email
            const email = user.emailAddresses[0]?.emailAddress || '';
            
            if (email) {
                dbUser = await prisma.user.findUnique({
                    where: { email }
                });
            }
            
            // Only create if no user with this email exists
            if (!dbUser) {
                dbUser = await prisma.user.create({
                    data: {
                        id: userId,
                        email: email,
                    }
                });
            } else {
                // If user with email exists but has different ID, update the ID
                if (dbUser.id !== userId) {
                    dbUser = await prisma.user.update({
                        where: { id: dbUser.id },
                        data: { id: userId }
                    });
                }
            }
        }

        return dbUser;
    } catch (error) {
        console.error("Error in getOrCreateUser:", error);
        throw error;
    }
}

function mapDodoStatus(dodoStatus: string | null | undefined): PaymentStatus {
    if (!dodoStatus) {
        return PaymentStatus.PENDING;
    }
    
    const statusMap = new Map<string, PaymentStatus>([
        ['succeeded', PaymentStatus.SUCCEEDED],
        ['pending', PaymentStatus.PENDING],
        ['failed', PaymentStatus.FAILED],
        ['disputed', PaymentStatus.DISPUTED],
        ['refunded', PaymentStatus.REFUNDED]
    ]);
  
    const normalizedStatus = dodoStatus.toLowerCase();
    const mappedStatus = statusMap.get(normalizedStatus) || PaymentStatus.PENDING;
    
    console.log(`Mapped DodoPayments status '${dodoStatus}' to '${mappedStatus}'`);
    return mappedStatus;
}

// Function to update payment status based on URL parameters
async function updatePaymentFromUrlParams(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const encryptedPaymentId = searchParams.get("payment_id");
    
    if (status && encryptedPaymentId) {
        console.log(`Found status=${status} and encrypted payment_id in URL params`);
        
        try {
            // Decrypt the payment ID
            const paymentId = decrypt(encryptedPaymentId);
            
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId }
            });
            
            if (payment) {
                const mappedStatus = mapDodoStatus(status);
                
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: mappedStatus,
                        metadata: {
                            ...(payment.metadata as any || {}),
                            statusHistory: [
                                ...((payment.metadata as any)?.statusHistory || []),
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
                
                console.log(`Updated payment ${paymentId} status to ${mappedStatus} based on URL params`);
                return true;
            }
        } catch (error) {
            console.error("Error updating payment from URL params:", error);
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

        const productCart = [{
            product_id: productId,
            quantity: 1
        }];

        const response = await dodopayments.payments.create({
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
            product_cart: productCart,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        });

        const paymentStatus = PaymentStatus.PENDING;

        // Create payment record in database
        await prisma.payment.create({
            data: {
                id: response.payment_id,
                userId: dbUser.id,
                productId: productId,
                amount: response.total_amount || 0,
                currency: "USD",
                status: paymentStatus,
                paymentMethod: "card",
                paymentLink: response.payment_link,
                clientSecret: response.client_secret,
                metadata: {
                    statusHistory: [{
                        status: paymentStatus,
                        timestamp: new Date().toISOString(),
                        reason: "Initial payment creation"
                    }]
                }
            }
        });

        const secureResponse = {
            ...response,
            payment_id: encrypt(response.payment_id)
        };

        return NextResponse.json(secureResponse);
    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    // Check if we need to update a payment based on URL parameters
    await updatePaymentFromUrlParams(request);
    
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
            productId,
            quantity = 1,
            billing
        } = body;

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Get or update customer profile
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

        const productCart = [{
            product_id: productId,
            quantity: quantity
        }];

        const response = await dodopayments.payments.create({
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
            product_cart: productCart,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        });

        // Default to SUCCEEDED since payments are typically successful
        const paymentStatus = PaymentStatus.PENDING;

        await prisma.payment.create({
            data: {
                id: response.payment_id,
                userId: dbUser.id,
                productId: productId,
                quantity: quantity,
                amount: response.total_amount || 0,
                currency: "USD",
                status: paymentStatus,
                paymentMethod: "card",
                paymentLink: response.payment_link,
                clientSecret: response.client_secret,
                metadata: {
                    statusHistory: [{
                        status: paymentStatus,
                        timestamp: new Date().toISOString(),
                        reason: "Initial payment creation"
                    }]
                }
            }
        });

        const secureResponse = {
            ...response,
            payment_id: encrypt(response.payment_id)
        };

        return NextResponse.json(secureResponse);
    } catch (error) {
        console.error('Payment creation error:', error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}
