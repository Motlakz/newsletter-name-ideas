import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { database, COLLECTIONS, DATABASES } from "@/lib/backend/appwrite";
import { ID, Query } from "appwrite";
import { verifySignature } from "@/lib/helper/verify";
import { WebhookPayload, WebhookPayloadData } from "@/types/webhook";
import { getPlanByPriceId, PlanId } from "@/types/billing";

const WEBHOOK_SECRET = process.env.FUNGIES_TEST_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
    throw new Error("Missing required WEBHOOK_SECRET environment variable");
}

export async function POST(req: Request) {
    try {
        // Step 1: Verify signature
        const signature = (await headers()).get("x-fngs-signature");
        if (!signature) {
            return NextResponse.json({ error: "No signature provided" }, { status: 401 });
        }

        const payload = await req.text();
        if (!verifySignature(payload, signature, WEBHOOK_SECRET!)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        // Step 2: Parse and validate payload
        const body: WebhookPayload = JSON.parse(payload);
        
        // Handle different webhook types
        switch (body.type) {
            case "subscription_created":
                await handleSubscriptionCreated(body.data);
                break;
            case "subscription_updated":
                await handleSubscriptionUpdated(body.data);
                break;
            case "payment_success":
                await handleOneTimePayment(body.data);
                break;
            case "subscription_cancelled":
                await handleSubscriptionCancelled(body.data);
                break;
            default:
                console.log(`Unhandled webhook type: ${body.type}`);
        }

        return NextResponse.json({
            success: true,
            type: body.type,
            userId: body.data.user.id,
            orderId: body.data.lastPayment?.orderId,
        });

    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

async function handleSubscriptionCreated(data: WebhookPayloadData) {
    const { user, subscription, lastPayment } = data;

    // Find or create Appwrite user
    const appwriteUser = await resolveAppwriteUser(user.email);
    if (!appwriteUser) {
        throw new Error("Could not resolve Appwrite user");
    }

    const planType = determinePlanType(data.items[0]?.product.id);

    // Create subscription record
    await database.createDocument(
        DATABASES.MAIN,
        COLLECTIONS.SUBSCRIPTIONS,
        ID.unique(),
        {
            userId: appwriteUser.$id,
            subscriptionId: subscription.id,
            status: subscription.status,
            planType,
            startDate: new Date(subscription.currentIntervalStart).toISOString(),
            endDate: new Date(subscription.currentIntervalEnd).toISOString(),
            lastPaymentId: lastPayment?.id,
            amount: lastPayment?.value,
            currency: lastPayment?.currency,
        }
    );

    // Update user's subscription status
    await database.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.USERS,
        appwriteUser.$id,
        {
            subscriptionStatus: 'active',
            subscriptionId: subscription.id,
        }
    );
}

async function handleSubscriptionUpdated(data: WebhookPayloadData) {
    const { subscription, items } = data;
    const productType = items[0]?.product.type;
    
    await database.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.SUBSCRIPTIONS,
        subscription.id,
        {
            planType: determinePlanType(productType),
            status: subscription.status,
            endDate: new Date(subscription.currentIntervalEnd).toISOString()
        }
    );
}

async function handleOneTimePayment(data: WebhookPayloadData) {
    const { user, lastPayment } = data;

    // Find or create Appwrite user
    const appwriteUser = await resolveAppwriteUser(user.email);
    if (!appwriteUser) {
        throw new Error("Could not resolve Appwrite user");
    }

    // Create purchase record
    await database.createDocument(
        DATABASES.MAIN,
        COLLECTIONS.PURCHASES,
        ID.unique(),
        {
            userId: appwriteUser.$id,
            paymentId: lastPayment.id,
            amount: lastPayment.value,
            currency: lastPayment.currency,
            status: lastPayment.status,
            type: 'forge',
            createdAt: new Date(lastPayment.createdAt).toISOString(),
        }
    );

    // Update user's lifetime access status
    await database.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.USERS,
        appwriteUser.$id,
        {
            hasLifetimeAccess: true,
        }
    );
}

async function handleSubscriptionCancelled(data: WebhookPayloadData) {
    const { user, subscription } = data;

    // Find Appwrite user
    const appwriteUser = await resolveAppwriteUser(user.email);
    if (!appwriteUser) {
        throw new Error("Could not resolve Appwrite user");
    }

    // Update subscription status
    await database.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.SUBSCRIPTIONS,
        subscription.id,
        {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
        }
    );

    // Update user's subscription status
    await database.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.USERS,
        appwriteUser.$id,
        {
            subscriptionStatus: 'cancelled',
        }
    );
}

function determinePlanType(priceId: string | undefined): PlanId {
    if (!priceId) return PlanId.FREE;
    const plan = getPlanByPriceId(priceId);
    return plan?.id || PlanId.FREE;
}

async function resolveAppwriteUser(email: string) {
    try {
        // Try to find existing user
        const existingUsers = await database.listDocuments(
            DATABASES.MAIN,
            COLLECTIONS.USERS,
            [Query.equal('email', email)]
        );

        if (existingUsers.documents.length > 0) {
            return existingUsers.documents[0];
        }

        // Create new user if not found
        return await database.createDocument(
            DATABASES.MAIN,
            COLLECTIONS.USERS,
            ID.unique(),
            {
                email,
                createdAt: new Date().toISOString(),
                subscriptionStatus: 'none',
                hasLifetimeAccess: false,
            }
        );

    } catch (error) {
        console.error("Error resolving Appwrite user:", error);
        return null;
    }
}
