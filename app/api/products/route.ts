import { NextResponse } from "next/server";
import { dodopayments } from "@/lib/dodopayments";

export async function GET() {
    try {
        const products = await dodopayments.products.list();
        return NextResponse.json(products.items);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
