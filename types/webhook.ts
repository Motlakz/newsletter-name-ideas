export interface FungiesSubscription {
    object: "subscription";
    id: string;
    status: string;
    createdAt: number;
    currentIntervalEnd: number;
    currentIntervalStart: number;
    cancelAtIntervalEnd: boolean;
    canceledAt: number | null;
    userId: string | null;
    user: any | null;
    orderId: string;
    orderNumber: string;
    order: {
        object: "order";
        id: string;
        number: string;
        status: string;
    };
    lastPaymentId: string | null;
    lastPaymentNumber: string | null;
    lastPayment: any | null;
}
export interface FungiesResponse {
    status: string;
    data: {
        subscription: FungiesSubscription;
    };
}

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
        value: number;
        status: string;
        currency: string;
        createdAt: number;
        orderId: string;
        orderNumber: string;
        currencyDecimals: number;
    };
    subscription: {
        id: string;
        status: string;
        userId: string;
        orderId: string;
        createdAt: number;
        canceledAt: null;
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
