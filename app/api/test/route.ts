import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { database, COLLECTIONS, DATABASES } from "@/lib/backend/appwrite";
import { ID, Query } from "appwrite";
import { verifySignature } from "@/lib/helper/verify";
import { WebhookPayload } from "@/types/webhook";

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
        const item = body.data.items[0];
        
        // Handle different webhook types
        switch (body.type) {
            case "subscription_created":
                await handleSubscriptionCreated(body);
                break;
            case "subscription_updated":
                await handleSubscriptionUpdated(body);
                break;
            case "payment_success":
                await handleOneTimePayment(body);
                break;
            case "subscription_cancelled":
                await handleSubscriptionCancelled(body);
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

async function handleSubscriptionCreated(body: WebhookPayload) {
    const { user, subscription, lastPayment } = body.data;

    // Find or create Appwrite user
    const appwriteUser = await resolveAppwriteUser(user.email);
    if (!appwriteUser) {
        throw new Error("Could not resolve Appwrite user");
    }

    // Create subscription record
    await database.createDocument(
        DATABASES.MAIN,
        COLLECTIONS.SUBSCRIPTIONS,
        ID.unique(),
        {
            userId: appwriteUser.$id,
            subscriptionId: subscription.id,
            status: subscription.status,
            planType: 'free', // or determine from the subscription data
            startDate: new Date(subscription.currentIntervalStart).toISOString(),
            endDate: new Date(subscription.currentIntervalEnd).toISOString(),
            lastPaymentId: lastPayment.id,
            amount: lastPayment.value,
            currency: lastPayment.currency,
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

async function handleSubscriptionUpdated(body: WebhookPayload) {
    const { subscription, items } = body.data;
    const item = items[0];
    const productType = item.product.type;
    
    const [planType, interval] = productType.includes('annual') 
        ? ['muse', 'annual'] 
        : ['muse', 'monthly'];

    await database.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.SUBSCRIPTIONS,
        subscription.id,
        {
            planType,
            interval,
            status: subscription.status,
            endDate: new Date(subscription.currentIntervalEnd).toISOString()
        }
    );
}

async function handleOneTimePayment(body: WebhookPayload) {
    const { user, lastPayment } = body.data;

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
            type: 'forge', // or determine from the payment data
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

async function handleSubscriptionCancelled(body: WebhookPayload) {
    const { user, subscription } = body.data;

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
