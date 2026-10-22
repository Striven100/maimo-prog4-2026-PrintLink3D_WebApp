"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { Button, Panel, inputClass } from "@/components/UI";
import { getJob, sendMessage, subscribeMessages } from "@/lib/firestore";
import { formatMoney } from "@/lib/pricing";
import type { ChatMessage, PrintJob } from "@/types";

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [job, setJob] = useState<PrintJob | null>(null);
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => subscribeMessages(params.id, setMessages), [params.id]);
  useEffect(() => { getJob(params.id).then(setJob); }, [params.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !profile || !body.trim()) return;
    await sendMessage(params.id, user.uid, profile.role === "worker" ? profile.studioName || profile.name : profile.name, body);
    setBody("");
  }

  return (
    <AppShell>
      <Link href="/messages" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-paper/50 hover:text-paper"><ArrowLeft size={16}/>Volver a mensajes</Link>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel className="flex min-h-[700px] flex-col p-0">
          <div className="border-b border-paper/10 p-5"><h1 className="text-2xl font-black">{job?.title || "Conversación"}</h1><p className="mt-1 text-sm text-paper/45">Chat privado asociado al trabajo aceptado.</p></div>
          <div className="flex-1 overflow-y-auto p-5">
            {messages.map(message=><div key={message.id} className={`mb-3 flex ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-3xl px-4 py-3 ${message.senderId === user?.uid ? "bg-cyanLink/15 text-cyanSoft" : "bg-paper/[0.07] text-paper/80"}`}><p className="mb-1 text-[11px] font-black uppercase tracking-[.06em] opacity-55">{message.senderName}</p><p className="text-sm leading-relaxed">{message.body}</p></div></div>)}
            <div ref={endRef}/>
          </div>
          <form onSubmit={submit} className="grid gap-3 border-t border-paper/10 p-4 sm:grid-cols-[1fr_auto]"><input className={inputClass} value={body} onChange={e=>setBody(e.target.value)} placeholder="Escribir mensaje..."/><Button type="submit"><Send size={16}/>Enviar</Button></form>
        </Panel>
        <Panel className="h-fit"><h3 className="text-xl font-black">Resumen del trabajo</h3>{job ? <><div className="mt-4 grid gap-3 text-sm"><Row label="Material" value={job.material}/><Row label="Cantidad" value={String(job.quantity)}/><Row label="Entrega" value={job.deliveryMethod}/><Row label="Presupuesto" value={`${formatMoney(job.budgetMin)}–${formatMoney(job.budgetMax)}`}/><Row label="Estado" value={job.status}/></div><Link href={`/jobs/${job.id}`} className="mt-5 inline-flex font-black text-cyanLink">Abrir trabajo →</Link></> : <p className="mt-3 text-sm text-paper/45">Cargando…</p>}</Panel>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label:string; value:string }) { return <div className="flex items-start justify-between gap-4 border-b border-paper/10 pb-2"><span className="text-paper/45">{label}</span><strong className="text-right text-paper">{value}</strong></div>; }
