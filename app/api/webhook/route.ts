import { processWebhookEvent } from "@/lib/webhook-handler";
import crypto from "crypto";
import Redis from "ioredis";
import { headers } from "next/headers";

const redis = new Redis(process.env.REDIS_URL!);

const logger = {
    info: (message: string, metadata?: Record<string, unknown>) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "INFO",
            message,
            ...metadata,
        }));
    },
    warn: (message: string, metadata?: Record<string, unknown>) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "WARN",
            message,
            ...metadata,
        }));
    },
    error: (message: string, metadata?: Record<string, unknown>) => {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "ERROR",
            message,
            ...metadata,
        }));
    },
};

function verifyWebhook({
    rawBody,
    secret,
    signatureHeader,
    timestampHeader,
    tolerance = 300,
}: {
    rawBody: string;
    secret: string;
    signatureHeader: string;
    timestampHeader: string;
    tolerance?: number;
}): boolean {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const eventTime = parseInt(timestampHeader, 10);

        if (Math.abs(currentTime - eventTime) > tolerance) {
            throw new Error("Timestamp outside tolerance window");
        }

        const signedContent = `${timestampHeader}.${rawBody}`;
        const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(signedContent)
        .digest("base64");

        return signatureHeader.split(" ").some((sig) => {
            const [version, signature] = sig.split(",", 2);
            return version === "v1" && signature === expectedSignature;
        });
    } catch (error) {
        logger.error("Webhook verification failed", { error: error instanceof Error ? error.message : "Unknown error" });
        return false;
    }
}

export async function POST(request: Request) {
    const headersList = headers();
    
    try {
        const rawBody = await request.text();
        const webhookId = (await headersList).get("webhook-id") || "";
        const signature = (await headersList).get("webhook-signature") || "";
        const timestamp = (await headersList).get("webhook-timestamp") || "";

        // Idempotency check
        const idempotencyKey = `webhook:${webhookId}`;
        const exists = await redis.exists(idempotencyKey);
        if (exists) {
            logger.info("Duplicate webhook event blocked", { webhookId });
            return Response.json({ message: "Event already processed" }, { status: 200 });
        }

        // Signature verification
        const isValid = verifyWebhook({
            rawBody,
            secret: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
            signatureHeader: signature,
            timestampHeader: timestamp,
        });

        if (!isValid) {
            logger.error("Invalid webhook signature", { webhookId });
            return Response.json({ message: "Invalid signature" }, { status: 200 });
        }

        // Parse payload
        const payload = JSON.parse(rawBody);

        // Log event
        logger.info(`Received ${payload.type} webhook`, { 
            eventType: payload.type,
            payloadType: payload.data.payload_type,
            webhookId
        });

        // Process the webhook in database
        await processWebhookEvent(payload, webhookId);

        // Store successful processing
        await redis.set(idempotencyKey, "processed", "EX", 604800); // 7 days

        return Response.json(
            { message: "Webhook processed successfully" },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger.error("Webhook processing failed", { error: errorMessage });
        
        // Always return 200 to avoid webhook retries
        return Response.json(
            { message: "Webhook received" },
            { status: 200 }
        );
    }
}
