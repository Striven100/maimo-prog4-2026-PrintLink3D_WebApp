import { NextResponse } from "next/server";
import { models } from "@/data/models";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const model = models.find((item) => item.id === params.id);
  if (!model) return NextResponse.json({ ok: false, error: "Modelo no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true, model });
}
