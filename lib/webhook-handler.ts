import "server only";

import { PrismaClient } from "@prisma/client";
import { dodopayments } from "@/lib/dodopayments";

const prisma = new PrismaClient();

export async function processWebhookEvent(payload: any, webhookId: string) {
    try {
        // Record the webhook event first to ensure we track all events
        await prisma.webhookEvent.create({
            data: {
                id: webhookId, // Use webhookId as the primary key id
                eventType: payload.type,
                eventData: payload, // Changed from payload to eventData
                idempotencyKey: webhookId, // Required field in your schema
            },
        });

        // Process subscription events
        if (payload.data.payload_type === "Subscription") {
            await processSubscriptionEvent(payload);
        } 
        // Process payment events
        else if (payload.data.payload_type === "Payment") {
            await processPaymentEvent(payload);
        }
    } catch (error) {
        console.error("Error processing webhook in database:", error);
        
        // Optionally update the webhook event with error details
        try {
            await prisma.webhookEvent.update({
                where: { id: webhookId },
                data: {
                    status: "FAILED",
                    error: error instanceof Error ? error.message : "Unknown error"
                }
            });
        } catch (updateError) {
            console.error("Failed to update webhook error status:", updateError);
        }
    }
}

async function processSubscriptionEvent(payload: any) {
    const { type, data } = payload;
    const subscriptionId = data.subscription_id;
    
    const dodoSubscription = await dodopayments.subscriptions.get(subscriptionId);
    
    // Find the user by CustomerProfile
    const customerProfile = await prisma.customerProfile.findUnique({
        where: { dodoCustomerId: dodoSubscription.customer.customer_id },
        include: { user: true }
    });
    
    if (!customerProfile) {
        console.error(`No user found for DodoPayments customer ID: ${dodoSubscription.customer.customer_id}`);
        return;
    }
    
    const user = customerProfile.user;
    
    // Map status and get metadata
    const { status, statusMetadata } = mapSubscriptionStatus(type, data);
    
    // Try to find an existing subscription
    const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
    });
    
    if (subscription) {
        // Update existing subscription
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status,
                currentPeriodEnd: new Date(dodoSubscription.next_billing_date),
                cancelAtPeriod: type === 'subscription.cancelled',
                cancelReason: type === 'subscription.cancelled' ? data.cancellation_reason : undefined,
                metadata: {
                    ...(subscription.metadata as any || {}),
                    statusHistory: [
                        ...((subscription.metadata as any)?.statusHistory || []),
                        {
                            status,
                            timestamp: new Date().toISOString(),
                            ...statusMetadata
                        }
                    ]
                },
                updatedAt: new Date(),
            },
        });
    } else {
        // Create new subscription
        await prisma.subscription.create({
            data: {
                id: subscriptionId,
                userId: user.id,
                status,
                productId: dodoSubscription.product_id,
                planName: dodoSubscription.product_name || "Default Plan",
                amount: Math.round(dodoSubscription.amount || 0),
                recurringAmount: Math.round(dodoSubscription.recurring_amount || 0),
                currency: dodoSubscription.currency || "USD",
                interval: dodoSubscription.interval || "month",
                startDate: new Date(dodoSubscription.start_date || Date.now()),
                currentPeriodEnd: new Date(dodoSubscription.next_billing_date || Date.now()),
                metadata: {
                    statusHistory: [{
                        status: "PENDING",
                        timestamp: new Date().toISOString(),
                        reason: "Initial subscription creation"
                    }]
                }
            },
        });
    }
}

async function processPaymentEvent(payload: any) {
    const { type, data } = payload;
    const paymentId = data.payment_id;
    
    const dodoPayment = await dodopayments.payments.get(paymentId);
    
    // Find user by CustomerProfile
    const customerProfile = await prisma.customerProfile.findUnique({
        where: { dodoCustomerId: dodoPayment.customer.customer_id },
        include: { user: true }
    });
    
    if (!customerProfile) {
        console.error(`No user found for DodoPayments customer ID: ${dodoPayment.customer.customer_id}`);
        return;
    }
    
    const user = customerProfile.user;
    
    // Map status and get metadata
    const { status, statusMetadata } = mapPaymentStatus(type, data);
    
    // Check if payment already exists
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
    });
    
    if (payment) {
        // Update existing payment
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status,
                refundAmount: type === 'payment.refunded' ? data.refund_amount : payment.refundAmount,
                refundReason: type === 'payment.refunded' ? data.refund_reason : payment.refundReason,
                disputeStatus: type === 'payment.disputed' ? data.dispute_status : payment.disputeStatus,
                disputeReason: type === 'payment.disputed' ? data.dispute_reason : payment.disputeReason,
                processingError: type === 'payment.failed' ? data.failure_reason : payment.processingError,
                metadata: {
                    ...(payment.metadata as any || {}),
                    statusHistory: [
                        ...((payment.metadata as any)?.statusHistory || []),
                        {
                            status,
                            timestamp: new Date().toISOString(),
                            ...statusMetadata
                        }
                    ]
                },
            },
        });
    } else {
        // Create new payment
        await prisma.payment.create({
            data: {
                id: paymentId,
                userId: user.id,
                subscriptionId: dodoPayment.subscription_id,
                productId: dodoPayment.product_id,
                currency: dodoPayment.currency || "USD",
                status,
                amount: Math.round(dodoPayment.total_amount || 0),
                paymentMethod: dodoPayment.payment_method || "",
                paymentMethodId: dodoPayment.payment_method_id || "",
                metadata: {
                    statusHistory: [{
                        status: "PENDING",
                        timestamp: new Date().toISOString(),
                        reason: "Initial payment creation"
                    }]
                }
            },
        });
    }
}

function mapSubscriptionStatus(type: string, data: any) {
    let status: "PENDING" | "ACTIVE" | "ON_HOLD" | "CANCELLED" | "FAILED";
    let statusMetadata: any = {
        reason: "",
        eventType: type
    };
    
    switch (type) {
        case "subscription.active":
            status = "ACTIVE";
            statusMetadata.reason = "Subscription activated successfully";
            break;
        case "subscription.failed":
            status = "FAILED";
            statusMetadata.reason = data.failure_reason || "Payment failed";
            statusMetadata.failureDetails = data.failure_details;
            break;
        case "subscription.cancelled":
            status = "CANCELLED";
            statusMetadata.reason = data.cancellation_reason || "Subscription cancelled";
            statusMetadata.cancellationDetails = data.cancellation_details;
            break;
        case "subscription.on_hold":
            status = "ON_HOLD";
            statusMetadata.reason = "Subscription put on hold";
            statusMetadata.holdDetails = data.hold_details;
            break;
        default:
            status = "PENDING";
            statusMetadata.reason = "Status unchanged";
    }
    
    return { status, statusMetadata };
}

function mapPaymentStatus(type: string, data: any) {
    let status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "DISPUTED";
    let statusMetadata: any = {
        reason: "",
        eventType: type
    };
    
    switch (type) {
        case "payment.succeeded":
            status = "SUCCEEDED";
            statusMetadata.reason = "Payment completed successfully";
            break;
        case "payment.failed":
            status = "FAILED";
            statusMetadata.reason = data.failure_reason || "Payment failed";
            statusMetadata.failureDetails = data.failure_details;
            break;
        case "payment.refunded":
            status = "REFUNDED";
            statusMetadata.reason = data.refund_reason || "Payment refunded";
            statusMetadata.refundDetails = data.refund_details;
            break;
        case "payment.disputed":
            status = "DISPUTED";
            statusMetadata.reason = data.dispute_reason || "Payment disputed";
            statusMetadata.disputeDetails = data.dispute_details;
            break;
        default:
            status = "PENDING";
            statusMetadata.reason = "Status unchanged";
    }
    
    return { status, statusMetadata };
}
