import { NextResponse } from 'next/server';
import { models } from '../route';

export async function GET(_, { params }) {
  const model = models.find((m) => m.id === params.id);
  if (!model) return NextResponse.json({ ok:false, error:'Modelo no encontrado' }, { status:404 });
  return NextResponse.json({ ok:true, model });
}
