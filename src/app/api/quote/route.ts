import { NextResponse } from "next/server";
import { calculatePrintPrice } from "@/lib/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quote = calculatePrintPrice({
    weightGrams: Number(searchParams.get("weightGrams") || 0),
    gramPrice: Number(searchParams.get("gramPrice") || 0),
    printHours: Number(searchParams.get("printHours") || 0),
    hourPrice: Number(searchParams.get("hourPrice") || 0),
    extras: Number(searchParams.get("extras") || 0),
    quantity: Number(searchParams.get("quantity") || 1),
    platformFeePercent: Number(searchParams.get("platformFeePercent") || 12),
  });
  return NextResponse.json({ ok: true, quote });
}
