"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Wrench } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Badge, EmptyState, Panel } from "@/components/UI";
import { subscribeWorkers } from "@/lib/firestore";
import { formatMoney } from "@/lib/pricing";
import type { UserProfile } from "@/types";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  useEffect(() => subscribeWorkers(setWorkers), []);

  return (
    <AppShell>
      <PageHeader title="Talleres" subtitle="Explorá perfiles de impresores antes de aceptar una propuesta o para conocer qué materiales trabajan." />
      {workers.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{workers.map(worker=><Link key={worker.uid} href={`/workers/${worker.uid}`}><Panel className="h-full transition hover:border-cyanLink/30"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyanLink to-printOrange text-xl font-black text-ink">{(worker.studioName || worker.name).slice(0,1)}</div><div className="min-w-0"><h3 className="truncate text-xl font-black">{worker.studioName || worker.name}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-paper/45"><MapPin size={14}/>{worker.location || "Ubicación no indicada"}</p></div></div><p className="mt-4 line-clamp-3 text-sm text-paper/55">{worker.bio || "Servicio de impresión 3D disponible para recibir trabajos."}</p><div className="mt-4 flex flex-wrap gap-2">{(worker.materials || []).slice(0,4).map(item=><Badge key={item}>{item}</Badge>)}</div><div className="mt-5 flex items-center justify-between border-t border-paper/10 pt-4"><span className="flex items-center gap-2 text-sm text-paper/45"><Wrench size={15}/>Desde</span><strong className="text-xl font-black text-cyanLink">{formatMoney(worker.baseGramPrice || 0)}/g</strong></div></Panel></Link>)}</div> : <EmptyState title="Todavía no hay talleres registrados" body="Cuando se registre una cuenta de impresor, aparecerá en esta sección."/>}
    </AppShell>
  );
}
