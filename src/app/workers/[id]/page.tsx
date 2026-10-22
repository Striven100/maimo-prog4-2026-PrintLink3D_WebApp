"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, EmptyState, Panel } from "@/components/UI";
import { getUserProfile, subscribePortfolio } from "@/lib/firestore";
import { formatMoney } from "@/lib/pricing";
import type { PortfolioItem, UserProfile } from "@/types";

export default function WorkerProfilePage({ params }: { params: { id: string } }) {
  const [worker, setWorker] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => { getUserProfile(params.id).then(setWorker); return subscribePortfolio(params.id, setItems); }, [params.id]);

  return (
    <AppShell>
      <Link href="/workers" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-paper/50 hover:text-paper"><ArrowLeft size={16}/>Volver a talleres</Link>
      {!worker ? <div className="text-paper/50">Cargando perfil…</div> : <>
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <Panel className="h-fit"><div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyanLink to-printOrange text-3xl font-black text-ink">{(worker.studioName || worker.name).slice(0,1)}</div><h1 className="mt-5 text-4xl font-black tracking-[-.055em]">{worker.studioName || worker.name}</h1><p className="mt-3 flex items-center gap-2 text-paper/45"><MapPin size={16}/>{worker.location || "Ubicación no indicada"}</p><p className="mt-5 leading-relaxed text-paper/60">{worker.bio || "Servicio de impresión 3D disponible para nuevos trabajos."}</p><div className="mt-5 flex flex-wrap gap-2">{(worker.materials || []).map(item=><Badge key={item}>{item}</Badge>)}</div><div className="mt-6 grid grid-cols-2 gap-3"><Metric label="Desde" value={`${formatMoney(worker.baseGramPrice || 0)}/g`}/><Metric label="Hora máquina" value={formatMoney(worker.baseHourPrice || 0)}/></div></Panel>
          <div><h2 className="text-3xl font-black tracking-[-.04em]">Trabajos anteriores</h2><p className="mt-2 text-paper/45">Portfolio publicado por el taller.</p><div className="mt-5">{items.length ? <div className="grid gap-4 md:grid-cols-2">{items.map(item=><Panel key={item.id} className="overflow-hidden p-0"><div className="relative aspect-[16/10]"><Image src={item.imageUrl} alt={item.title} fill className="object-cover"/></div><div className="p-5"><Badge>{item.material}</Badge><h3 className="mt-3 text-xl font-black">{item.title}</h3><p className="mt-2 text-sm text-paper/50">{item.description}</p></div></Panel>)}</div> : <EmptyState title="Sin trabajos publicados" body="Este taller todavía no cargó trabajos en su portfolio."/>}</div></div>
        </div>
      </>}
    </AppShell>
  );
}

function Metric({ label, value }: { label:string; value:string }) { return <div className="rounded-2xl border border-paper/10 bg-paper/5 p-4"><p className="text-xs font-black uppercase tracking-[.08em] text-steel">{label}</p><strong className="mt-2 block text-lg font-black">{value}</strong></div>; }
