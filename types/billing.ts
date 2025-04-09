export type Product = {
    product_id: number;
    name: string;
    description: string;
    price: number;
    is_recurring: boolean;
};

export interface WebhookPayload {
    type: string;
    data: {
        payload_type: 'Subscription' | 'Payment';
        subscription_id?: string;
        payment_id?: string;
    };
}