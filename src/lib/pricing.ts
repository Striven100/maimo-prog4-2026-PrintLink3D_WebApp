export type PricingInput = {
  weightGrams: number;
  gramPrice: number;
  printHours: number;
  hourPrice: number;
  extras?: number;
  quantity?: number;
  platformFeePercent?: number;
};

export type PricingOutput = {
  materialCost: number;
  timeCost: number;
  extras: number;
  creatorSubtotal: number;
  platformFee: number;
  finalPrice: number;
};

const safe = (value: number | undefined, fallback = 0) =>
  Number.isFinite(value) && Number(value) >= 0 ? Number(value) : fallback;

export function calculatePrintPrice(input: PricingInput): PricingOutput {
  const weightGrams = safe(input.weightGrams);
  const gramPrice = safe(input.gramPrice);
  const printHours = safe(input.printHours);
  const hourPrice = safe(input.hourPrice);
  const extras = safe(input.extras);
  const quantity = Math.max(1, safe(input.quantity, 1));
  const platformFeePercent = safe(input.platformFeePercent, 12);

  const materialCost = Math.round(weightGrams * gramPrice * quantity);
  const timeCost = Math.round(printHours * hourPrice);
  const creatorSubtotal = Math.round(materialCost + timeCost + extras);
  const platformFee = Math.round(creatorSubtotal * (platformFeePercent / 100));

  return {
    materialCost,
    timeCost,
    extras,
    creatorSubtotal,
    platformFee,
    finalPrice: creatorSubtotal + platformFee,
  };
}

export const formatMoney = (value: number) =>
  `$${Math.round(value || 0).toLocaleString("es-AR")}`;
