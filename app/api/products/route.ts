import { NextResponse } from "next/server";
import { dodopayments } from "@/lib/dodopayments";
import { Product } from "@/types/billing";

export async function GET() {
  try {
    const products = await dodopayments.products.list();
    return NextResponse.json(products.items as Product[]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}