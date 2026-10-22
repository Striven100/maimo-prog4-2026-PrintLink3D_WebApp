"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { Badge, EmptyState, Panel } from "@/components/UI";
import { subscribeMyOffers } from "@/lib/firestore";
import { formatMoney } from "@/lib/pricing";
import type { Offer } from "@/types";

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => user ? subscribeMyOffers(user.uid, setOffers) : undefined, [user]);

  return (
    <AppShell>
      <PageHeader title="Mis propuestas" subtitle="Revisá lo que cotizaste y si la propuesta sigue enviada, fue aceptada o rechazada." />
      <div className="grid gap-4 lg:grid-cols-2">{offers.length ? offers.map(offer=><Panel key={offer.id}><div className="flex items-start justify-between gap-4"><div><Badge tone={offer.status === "accepted" ? "green" : offer.status === "rejected" ? "red" : "orange"}>{offer.status === "accepted" ? "Aceptada" : offer.status === "rejected" ? "Rechazada" : "Enviada"}</Badge><h3 className="mt-3 text-2xl font-black">{formatMoney(offer.price)}</h3></div><span className="text-sm text-paper/45">{offer.deliveryDays} días</span></div><p className="mt-4 text-paper/55">{offer.notes}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{offer.material}</Badge><Badge>{offer.deliveryMethod}</Badge></div><Link href={`/jobs/${offer.jobId}`} className="mt-5 inline-flex font-black text-cyanLink">Abrir trabajo →</Link></Panel>) : <div className="lg:col-span-2"><EmptyState title="Todavía no enviaste propuestas" body="Abrí un trabajo disponible, completá precio, material y entrega, y tu propuesta aparecerá acá."/></div>}</div>
    </AppShell>
  );
}
