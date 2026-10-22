import { NextResponse } from "next/server";
import { models } from "@/data/models";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "";
  const material = searchParams.get("material") || "";

  let filtered = models;
  if (q) filtered = filtered.filter((model) => `${model.name} ${model.description} ${model.category} ${model.material} ${model.author} ${model.tags.join(" ")}`.toLowerCase().includes(q));
  if (category) filtered = filtered.filter((model) => model.category === category);
  if (material) filtered = filtered.filter((model) => model.material === material);

  return NextResponse.json({ ok: true, source: "PrintLink 3D Local API", count: filtered.length, models: filtered });
}
