"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button, EmptyState, Field, Panel, inputClass, selectClass } from "@/components/UI";
import { createPortfolioItem, deletePortfolioItem, subscribePortfolio } from "@/lib/firestore";
import type { PortfolioItem } from "@/types";

export default function PortfolioPage() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [imageUrl, setImageUrl] = useState("/models/pl3d-001.svg");

  useEffect(() => user ? subscribePortfolio(user.uid, setItems) : undefined, [user]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!user || profile?.role !== "worker") return;
    await createPortfolioItem({ workerId: user.uid, title, description, material, imageUrl });
    setTitle(""); setDescription("");
  }

  return (
    <AppShell>
      <PageHeader title="Portfolio" subtitle="Mostrá trabajos anteriores y capacidades del taller para respaldar tus propuestas." />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Panel className="h-fit">
          <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyanLink to-printOrange font-black text-ink">{(profile?.studioName || profile?.name || "T").slice(0,1)}</div><div><h3 className="text-xl font-black">{profile?.studioName || profile?.name}</h3><p className="text-sm text-paper/45">{profile?.location || "Sin ubicación"}</p></div></div>
          <form onSubmit={add} className="mt-6 grid gap-4"><Field label="Título"><input className={inputClass} value={title} onChange={e=>setTitle(e.target.value)} required/></Field><Field label="Material"><select className={selectClass} value={material} onChange={e=>setMaterial(e.target.value)}><option>PLA</option><option>PETG</option><option>Resina</option><option>TPU</option><option>ABS</option></select></Field><Field label="Descripción"><textarea className={`${inputClass} min-h-28 py-3`} value={description} onChange={e=>setDescription(e.target.value)} required/></Field><Field label="Imagen"><select className={selectClass} value={imageUrl} onChange={e=>setImageUrl(e.target.value)}>{Array.from({length:20},(_,i)=>`/models/pl3d-${String(i+1).padStart(3,"0")}.svg`).map(url=><option key={url} value={url}>{url.split("/").pop()}</option>)}</select></Field><Button type="submit" tone="orange"><Plus size={16}/>Agregar trabajo</Button></form>
        </Panel>
        <div>{items.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(item=><Panel key={item.id} className="overflow-hidden p-0"><div className="relative aspect-[16/10]"><Image src={item.imageUrl} alt={item.title} fill className="object-cover"/></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.08em] text-steel">{item.material}</p><h3 className="mt-1 text-xl font-black">{item.title}</h3></div><button onClick={()=>deletePortfolioItem(item.id)} className="rounded-xl border border-alert/20 bg-alert/10 p-2 text-alert"><Trash2 size={15}/></button></div><p className="mt-3 text-sm text-paper/50">{item.description}</p></div></Panel>)}</div> : <EmptyState title="Tu portfolio todavía está vacío" body="Agregá algunos trabajos anteriores para que los clientes puedan ver qué tipo de piezas producís."/>}</div>
      </div>
    </AppShell>
  );
}
