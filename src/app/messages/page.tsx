"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, Panel } from "@/components/UI";
import { subscribeConversations } from "@/lib/firestore";
import type { Conversation } from "@/types";

export default function MessagesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  useEffect(() => user ? subscribeConversations(user.uid, setItems) : undefined, [user]);

  return (
    <AppShell>
      <PageHeader title="Mensajes" subtitle="Las conversaciones se crean cuando una propuesta es aceptada." />
      <div className="grid gap-4">{items.length ? items.map(item=>{ const other = user ? item.participants.find(id=>id!==user.uid) : undefined; return <Link key={item.id} href={`/messages/${item.id}`}><Panel className="transition hover:border-cyanLink/30"><div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyanLink/10 text-cyanLink"><MessageCircle size={20}/></div><div className="min-w-0"><h3 className="truncate text-xl font-black">{item.jobTitle}</h3><p className="mt-1 truncate text-sm text-paper/45">Conversación con {other ? item.participantNames[other] || "otro usuario" : "otro usuario"}</p></div></div></Panel></Link>; }) : <EmptyState title="No hay conversaciones todavía" body="Cuando una propuesta sea aceptada, el chat privado del trabajo aparecerá acá."/>}</div>
    </AppShell>
  );
}
