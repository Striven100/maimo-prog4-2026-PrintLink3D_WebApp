import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const weightGrams = Math.max(0, Number(searchParams.get('weightGrams') || 0));
  const gramPrice = Math.max(0, Number(searchParams.get('gramPrice') || 0));
  const printHours = Math.max(0, Number(searchParams.get('printHours') || 0));
  const hourPrice = Math.max(0, Number(searchParams.get('hourPrice') || 0));
  const extras = Math.max(0, Number(searchParams.get('extras') || 0));
  const quantity = Math.max(1, Number(searchParams.get('quantity') || 1));
  const platformFeePercent = Math.max(0, Number(searchParams.get('platformFeePercent') || 12));
  const materialCost = Math.round(weightGrams * gramPrice * quantity);
  const timeCost = Math.round(printHours * hourPrice);
  const creatorSubtotal = Math.round(materialCost + timeCost + extras);
  const platformFee = Math.round(creatorSubtotal * (platformFeePercent / 100));
  return NextResponse.json({ ok:true, quote:{ materialCost, timeCost, extras, creatorSubtotal, platformFee, finalPrice:creatorSubtotal + platformFee } });
}
