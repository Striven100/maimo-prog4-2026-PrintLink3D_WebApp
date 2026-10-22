import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock3, Scale } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Panel } from "@/components/UI";
import { models } from "@/data/models";
import { formatMoney } from "@/lib/pricing";
import { notFound } from "next/navigation";

export default function ModelDetailPage({ params }: { params: { id: string } }) {
  const model = models.find(item=>item.id === params.id);
  if (!model) notFound();

  return (
    <AppShell>
      <Link href="/models" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-paper/50 hover:text-paper"><ArrowLeft size={16}/>Volver a modelos</Link>
      <div className="grid gap-5 xl:grid-cols-[.92fr_1.08fr]">
        <Panel className="overflow-hidden p-0"><div className="relative aspect-[16/11] min-h-[360px]"><Image src={model.imageUrl} alt={model.name} fill className="object-cover" priority/></div></Panel>
        <div className="grid content-start gap-5">
          <Panel>
            <div className="flex flex-wrap gap-2"><Badge tone="cyan">{model.material}</Badge><Badge>{model.category}</Badge><Badge>{model.license}</Badge></div>
            <h1 className="mt-5 text-4xl font-black leading-[.95] tracking-[-.055em] lg:text-5xl">{model.name}</h1>
            <p className="mt-4 leading-relaxed text-paper/60">{model.description}</p>
            <p className="mt-4 text-sm text-paper/40">Modelo publicado por {model.author}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric icon={<Scale size={16}/>} label="Peso" value={`${model.weightGrams} g`}/><Metric icon={<Clock3 size={16}/>} label="Tiempo" value={`${Math.round(model.printTimeMinutes/6)/10} h`}/><Metric label="Material" value={model.material}/></div>
          </Panel>
          <Panel>
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-paper/45">Estimación total</p><div className="mt-1 text-4xl font-black text-cyanLink">{formatMoney(model.pricing.finalPrice)}</div></div><Badge tone="orange">Incluye 12% de comisión</Badge></div>
            <div className="mt-5 grid gap-2 text-sm text-paper/60"><Row label="Material" value={formatMoney(model.pricing.materialCost)}/><Row label="Tiempo de máquina" value={formatMoney(model.pricing.timeCost)}/><Row label="Adicionales demo" value={formatMoney(model.pricing.extras)}/><Row label="Comisión" value={formatMoney(model.pricing.platformFee)}/></div>
            <Link href={`/jobs/new?model=${model.id}`} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-printOrange px-5 font-black text-ink">Solicitar impresión</Link>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-paper/10 bg-paper/5 p-4"><div className="flex items-center gap-2 text-paper/40">{icon}<span className="text-xs font-bold uppercase tracking-[.08em]">{label}</span></div><strong className="mt-2 block text-xl font-black">{value}</strong></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-paper/10 py-2"><span>{label}</span><strong className="text-paper">{value}</strong></div>; }
