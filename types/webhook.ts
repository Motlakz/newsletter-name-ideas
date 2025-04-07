export interface WebhookPayloadData {
    user: {
        id: string;
        email: string;
        object: string;
        details: {
            countryCode: string;
        };
        username: string | null;
        internalId: string | null;
    };
    items: {
        id: string;
        name: string;
        plan: null;
        offer: {
            id: string;
            object: string;
            internalId: string | null;
        };
        value: number;
        object: string;
        product: {
            id: string;
            type: string;
            object: string;
            internalId: string | null;
        };
        variant: string | null;
        currency: string;
        quantity: number;
        customFields: any | null;
    }[];
    lastPayment: {
        id: string;
        fee: number;
        tax: number;
        type: string;
        user: {
            id: string;
            object: string;
            username: string | null;
        };
        order: {
            id: string;
            number: string;
            object: string;
            status: string;
        };
        value: number;
        number: string;
        object: string;
        status: string;
        userId: string;
        orderId: string;
        currency: string;
        createdAt: number;
        orderNumber: string;
        subscription: null;
        subscriptionId: null;
        currencyDecimals: number;
    };
    subscription: {
        id: string;
        user: {
            id: string;
            object: string;
            username: string | null;
        };
        order: {
            id: string;
            number: string;
            object: string;
            status: string;
        };
        object: string;
        status: string;
        userId: string;
        orderId: string;
        createdAt: number;
        canceledAt: null;
        lastPayment: {
            id: string;
            type: string;
            number: string;
            object: string;
            status: string;
        };
        orderNumber: string;
        lastPaymentId: string;
        lastPaymentNumber: string;
        currentIntervalEnd: number;
        cancelAtIntervalEnd: boolean;
        currentIntervalStart: number;
    };
}

export interface WebhookPayload {
    id: string;
    type: "payment_success" | "payment_refunded" | "payment_failed" | "subscription_created" | "subscription_updated" | "subscription_cancelled";
    testMode: boolean;
    data: WebhookPayloadData;
    idempotencyKey: string;
}
