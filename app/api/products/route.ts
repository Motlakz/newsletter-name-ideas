import { NextResponse } from "next/server";
import { dodopayments } from "@/lib/dodopayments";

export async function GET() {
    try {
        // Use type assertion to tell TypeScript that products exists
        const products = await (dodopayments as any).products.list();
        return NextResponse.json(products.items);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}