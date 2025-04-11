import { Product } from "./billing";

declare module 'dodopayments' {
    export type CountryCode = 
      | "US" | "GB" | "CA" | "AU" | "DE" 
      | "FR" | "IT" | "ES" | "NL" | "JP"
      | "CN" | "BR" | "IN" | "RU" | "ZA"
      | "MX" | "AR" | "CL" | "CO" | "PE"
      | "AT" | "BE" | "BG" | "HR" | "CY"
      | "CZ" | "DK" | "EE" | "FI" | "GR"
      | "HU" | "IE" | "LV" | "LT" | "LU"
      | "MT" | "PL" | "PT" | "RO" | "SK"
      | "SI" | "SE" | "CH" | "NO" | "NZ";
  
    export interface BillingAddress {
      city: string;
      country: CountryCode;
      state: string;
      street: string;
      zipcode: string;
    }
  
    export interface CustomerInfo {
      customer_id?: string;
      email?: string;
      name?: string;
    }
  
    export interface CreateSubscriptionParams {
      billing: BillingAddress;
      customer: CustomerInfo;
      product_id: string;
      quantity: number;
      payment_link?: boolean;
      return_url?: string;
      discount_id?: string;
      metadata?: Record<string, any>;
    }
  
    export interface CreatePaymentParams {
      billing: BillingAddress;
      customer: CustomerInfo;
      product_cart: {
        product_id: string;
        quantity: number;
      }[];
      payment_link?: boolean;
      return_url?: string;
      discount_id?: string;
      metadata?: Record<string, any>;
    }
  
    export interface CancelSubscriptionParams {
      cancel_now: boolean;
      reason?: string;
    }
  
    export interface SubscriptionResponse {
      subscription_id: string;
      customer: CustomerInfo;
      payment_link?: string;
      client_secret?: string;
      recurring_pre_tax_amount?: number;
      status?: string;
      current_period_end?: number;
    }
  
    export interface PaymentResponse {
      payment_id: string;
      customer: CustomerInfo;
      payment_link?: string;
      client_secret?: string;
      amount?: number;
      status: string;
    }
  
    export class Subscriptions {
      create(params: CreateSubscriptionParams): Promise<SubscriptionResponse>;
      cancel(subscriptionId: string, params: CancelSubscriptionParams): Promise<any>;
      get(subscriptionId: string): Promise<any>;
      list(params?: any): Promise<any>;
    }
  
    export class Payments {
      create(params: CreatePaymentParams): Promise<PaymentResponse>;
      get(paymentId: string): Promise<any>;
      list(params?: any): Promise<any>;
      refund(paymentId: string, params?: any): Promise<any>;
    }

    export class Products {
      list(params?: any): Promise<{ items: Product[] }>;
    }
}
