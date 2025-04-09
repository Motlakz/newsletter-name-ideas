import crypto from "crypto";

export class WebhookTester {
    constructor(private webhookKey: string) {}
    
    async generateTestWebhook(payload: any): Promise<{
        body: string;
        headers: {
            "webhook-id": string;
            "webhook-signature": string;
            "webhook-timestamp": string;
        }
    }> {
        const webhookId = crypto.randomUUID();
        const timestamp = Date.now().toString();
        const body = JSON.stringify(payload);
        
        // Create a manual HMAC signature
        const hmac = crypto.createHmac('sha256', this.webhookKey);
        hmac.update(`${webhookId}.${timestamp}.${body}`);
        const signature = hmac.digest('hex');
        
        return {
            body,
            headers: {
                "webhook-id": webhookId,
                "webhook-signature": signature,
                "webhook-timestamp": timestamp,
            }
        };
    }
}
