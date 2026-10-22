"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, MessageCircle, Search, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Panel } from "@/components/UI";
import { subscribeAssignedJobs, subscribeConversations, subscribeMyJobs, subscribeMyOffers, subscribeOpenJobs, subscribeSavedJobIds } from "@/lib/firestore";
import type { Conversation, Offer, PrintJob } from "@/types";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [openJobs, setOpenJobs] = useState<PrintJob[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user || !profile) return;
    const unsubscribers = [subscribeConversations(user.uid, setConversations)];
    if (profile.role === "client") {
      unsubscribers.push(subscribeMyJobs(user.uid, setJobs));
    } else {
      unsubscribers.push(subscribeOpenJobs(setOpenJobs));
      unsubscribers.push(subscribeAssignedJobs(user.uid, setJobs));
      unsubscribers.push(subscribeMyOffers(user.uid, setOffers));
      unsubscribers.push(subscribeSavedJobIds(user.uid, setSavedIds));
    }
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [user, profile]);

  return (
    <AppShell>
      <PageHeader title={`Hola, ${profile?.role === "worker" ? profile.studioName || profile.name : profile?.name || ""}`} subtitle={profile?.role === "client" ? "Tus pedidos, propuestas recibidas y conversaciones en un solo lugar." : "Encontrá nuevos trabajos, revisá tus propuestas y continuá conversaciones activas."} />

      {profile?.role === "client" ? (
        <>
          <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
            <Panel className="relative min-h-[330px] overflow-hidden bg-gradient-to-br from-cyanLink/10 via-paper/[0.035] to-printOrange/5">
              <Badge tone="cyan">Acción rápida</Badge>
              <h2 className="mt-5 max-w-3xl text-5xl font-black leading-[.95] tracking-[-.065em] lg:text-6xl">Empezá por un modelo o publicá directamente lo que necesitás.</h2>
              <div className="mt-7 flex flex-wrap gap-3"><Link href="/models" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-cyanLink px-5 font-black text-ink"><Search size={17}/>Explorar modelos</Link><Link href="/jobs/new" className="inline-flex min-h-12 items-center rounded-2xl bg-printOrange px-5 font-black text-ink">Publicar pedido</Link></div>
            </Panel>
            <Panel><h3 className="text-2xl font-black">Tu actividad</h3><Metric label="Solicitudes" value={jobs.length}/><Metric label="Con propuestas" value={jobs.filter(j=>j.status === "with_offers").length}/><Metric label="Conversaciones" value={conversations.length}/></Panel>
          </div>
          <div className="mt-6 flex items-end justify-between"><div><h2 className="text-2xl font-black">Solicitudes recientes</h2><p className="mt-1 text-sm text-paper/45">Tus últimos pedidos publicados.</p></div><Link href="/jobs" className="text-sm font-black text-cyanLink">Ver todas →</Link></div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">{jobs.slice(0,3).map(job => <Link key={job.id} href={`/jobs/${job.id}`}><Panel className="h-full transition hover:border-cyanLink/30"><Badge tone={job.status === "with_offers" ? "orange" : job.status === "accepted" ? "green" : "cyan"}>{statusLabel(job.status)}</Badge><h3 className="mt-3 text-xl font-black">{job.title}</h3><p className="mt-2 text-sm text-paper/50">{job.material} · {job.quantity} unidad/es</p><div className="mt-5 flex items-center gap-2 text-sm font-black text-cyanLink">Abrir <ArrowRight size={15}/></div></Panel></Link>)}</div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={<Search/>} label="Trabajos abiertos" value={openJobs.length}/><MetricCard icon={<Bookmark/>} label="Guardados" value={savedIds.length}/><MetricCard icon={<Send/>} label="Propuestas enviadas" value={offers.length}/><MetricCard icon={<MessageCircle/>} label="Conversaciones" value={conversations.length}/></div>
          <Panel className="mt-5 bg-gradient-to-r from-printOrange/8 to-cyanLink/8"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><Badge tone="orange">Nuevas oportunidades</Badge><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.055em]">Revisá trabajos, guardá los interesantes y ofertá cuando tengas capacidad.</h2></div><Link href="/jobs" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-printOrange px-5 font-black text-ink">Ver trabajos</Link></div></Panel>
          <div className="mt-6 flex items-end justify-between"><div><h2 className="text-2xl font-black">Trabajos destacados</h2><p className="mt-1 text-sm text-paper/45">Solicitudes activas disponibles para cotizar.</p></div><Link href="/jobs" className="text-sm font-black text-cyanLink">Ver todos →</Link></div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">{openJobs.slice(0,3).map(job => <Link key={job.id} href={`/jobs/${job.id}`}><Panel className="h-full transition hover:border-printOrange/30"><Badge tone="cyan">{job.material}</Badge><h3 className="mt-3 text-xl font-black">{job.title}</h3><p className="mt-2 line-clamp-2 text-sm text-paper/50">{job.description}</p><div className="mt-5 text-sm font-black text-printOrange">Ver trabajo →</div></Panel></Link>)}</div>
        </>
      )}
    </AppShell>
  );
}

function statusLabel(status: PrintJob["status"]) {
  return ({ published: "Publicada", with_offers: "Con propuestas", accepted: "Aceptada", in_production: "En producción", ready: "Lista", delivered: "Entregada", cancelled: "Cancelada" } as Record<string,string>)[status] || status;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="mt-4 flex items-center justify-between border-b border-paper/10 pb-3"><span className="text-paper/55">{label}</span><strong className="text-2xl font-black text-cyanLink">{value}</strong></div>; }
function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <Panel><div className="flex items-center justify-between"><span className="text-cyanLink">{icon}</span><strong className="text-3xl font-black">{value}</strong></div><p className="mt-4 text-sm font-bold text-paper/50">{label}</p></Panel>; }
