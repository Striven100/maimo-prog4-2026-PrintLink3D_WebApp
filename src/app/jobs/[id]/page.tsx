"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bookmark, Check, MessageCircle, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { Badge, Button, Field, Panel, inputClass, selectClass } from "@/components/UI";
import { acceptOffer, createOffer, saveJob, subscribeJob, subscribeMyOffers, subscribeOffersForJob, subscribeSavedJobIds, unsaveJob, updateJobStatus } from "@/lib/firestore";
import { formatMoney } from "@/lib/pricing";
import type { Offer, PrintJob } from "@/types";

const labels: Record<string,string> = { published:"Publicada", with_offers:"Con propuestas", accepted:"Propuesta aceptada", in_production:"En producción", ready:"Lista para entrega", delivered:"Entregada", cancelled:"Cancelada" };

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { user, profile } = useAuth();
  const [job, setJob] = useState<PrintJob | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [price, setPrice] = useState(0);
  const [material, setMaterial] = useState("PLA");
  const [deliveryDays, setDeliveryDays] = useState(4);
  const [deliveryMethod, setDeliveryMethod] = useState("A coordinar");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => subscribeJob(params.id, setJob), [params.id]);
  useEffect(() => {
    if (!user || !profile) return;
    if (profile.role === "client") return subscribeOffersForJob(params.id, setOffers);
    const unsubOffers = subscribeMyOffers(user.uid, (all) => setOffers(all.filter(offer => offer.jobId === params.id)));
    const unsubSaved = subscribeSavedJobIds(user.uid, setSavedIds);
    return () => { unsubOffers(); unsubSaved(); };
  }, [user, profile, params.id]);

  useEffect(() => {
    if (job) {
      setMaterial(job.material === "A definir" ? "PLA" : job.material);
      setPrice(job.budgetMin || 5000);
    }
  }, [job]);

  const ownOffer = useMemo(() => user ? offers.find(offer => offer.workerId === user.uid) : undefined, [offers, user]);
  const isSaved = job ? savedIds.includes(job.id) : false;

  if (!job) return <AppShell><div className="grid min-h-64 place-items-center text-paper/50">Cargando trabajo…</div></AppShell>;

  async function toggleSaved() {
    if (!user) return;
    if (isSaved) await unsaveJob(user.uid, job!.id); else await saveJob(user.uid, job!.id);
  }

  async function submitOffer(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !profile || profile.role !== "worker") return;
    setBusy(true); setError("");
    try {
      await createOffer({
        jobId: job!.id,
        workerId: user.uid,
        workerName: profile.name,
        workerStudioName: profile.studioName,
        price,
        material,
        deliveryDays,
        deliveryMethod,
        notes,
      });
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo enviar la propuesta."); }
    finally { setBusy(false); }
  }

  async function choose(offer: Offer) {
    setBusy(true);
    try { await acceptOffer(job!, offer); }
    catch (err) { setError(err instanceof Error ? err.message : "No se pudo aceptar la propuesta."); }
    finally { setBusy(false); }
  }

  return (
    <AppShell>
      <Link href="/jobs" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-paper/50 hover:text-paper"><ArrowLeft size={16}/>Volver a trabajos</Link>
      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <div className="grid content-start gap-5">
          <Panel className="overflow-hidden p-0">
            {job.modelImageUrl && <div className="relative aspect-[16/7] min-h-[250px]"><Image src={job.modelImageUrl} alt={job.title} fill className="object-cover"/></div>}
            <div className="p-6">
              <Badge tone={job.status === "accepted" || job.status === "in_production" || job.status === "delivered" ? "green" : job.status === "with_offers" ? "orange" : "cyan"}>{labels[job.status] || job.status}</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-[-.055em] lg:text-5xl">{job.title}</h1>
              <p className="mt-4 leading-relaxed text-paper/60">{job.description}</p>
              <div className="mt-5 flex flex-wrap gap-2"><Badge>{job.material}</Badge><Badge>{job.quantity} unidad/es</Badge><Badge>{job.color}</Badge><Badge>{job.deliveryMethod}</Badge><Badge tone="orange">{formatMoney(job.budgetMin)}–{formatMoney(job.budgetMax)}</Badge></div>
              <div className="mt-5 border-t border-paper/10 pt-4 text-sm text-paper/45">Publicado por <strong className="text-paper/75">{job.clientName}</strong> · {job.location || "Ubicación a coordinar"}</div>
            </div>
          </Panel>

          {profile?.role === "client" && (
            <div>
              <div className="mb-3 flex items-end justify-between"><div><h2 className="text-2xl font-black">Propuestas</h2><p className="mt-1 text-sm text-paper/45">Compará precio, material y plazo antes de aceptar.</p></div><span className="text-sm font-black text-cyanLink">{offers.length} recibidas</span></div>
              <div className="grid gap-4 lg:grid-cols-2">
                {offers.map(offer => <Panel key={offer.id}><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.08em] text-steel">{offer.workerStudioName || offer.workerName}</p><h3 className="mt-1 text-3xl font-black text-cyanLink">{formatMoney(offer.price)}</h3></div><Badge tone={offer.status === "accepted" ? "green" : "orange"}>{offer.status === "accepted" ? "Aceptada" : `${offer.deliveryDays} días`}</Badge></div><p className="mt-4 text-sm text-paper/55">{offer.notes}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{offer.material}</Badge><Badge>{offer.deliveryMethod}</Badge></div>{job.status !== "accepted" && <Button className="mt-5 w-full" tone="orange" onClick={()=>choose(offer)} disabled={busy}><Check size={16}/>Aceptar propuesta</Button>}{offer.status === "accepted" && <Link href={`/messages/${job.id}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyanLink px-4 font-black text-ink"><MessageCircle size={16}/>Abrir conversación</Link>}</Panel>)}
                {!offers.length && <Panel><h3 className="text-xl font-black">Todavía no hay propuestas</h3><p className="mt-2 text-sm text-paper/50">Los talleres interesados aparecerán acá.</p></Panel>}
              </div>
            </div>
          )}
        </div>

        <div className="grid content-start gap-5">
          {profile?.role === "worker" ? (
            <>
              <Button tone={isSaved ? "cyan" : "ghost"} onClick={toggleSaved}><Bookmark size={16}/>{isSaved ? "Trabajo guardado" : "Guardar para después"}</Button>
              <Panel>
                <h2 className="text-2xl font-black">{ownOffer ? "Tu propuesta" : "Enviar propuesta"}</h2>
                {ownOffer ? <><div className="mt-4 text-4xl font-black text-cyanLink">{formatMoney(ownOffer.price)}</div><p className="mt-2 text-paper/55">{ownOffer.material} · {ownOffer.deliveryDays} días</p><div className="mt-4"><Badge tone={ownOffer.status === "accepted" ? "green" : "orange"}>{ownOffer.status === "accepted" ? "Aceptada" : "Enviada"}</Badge></div>{ownOffer.status === "accepted" && <Link href={`/messages/${job.id}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyanLink px-4 font-black text-ink"><MessageCircle size={16}/>Abrir conversación</Link>}</> : <form onSubmit={submitOffer} className="mt-5 grid gap-4">{error && <div className="rounded-2xl border border-alert/30 bg-alert/10 p-3 text-sm text-red-100">{error}</div>}<Field label="Precio total"><input className={inputClass} type="number" min={1} value={price} onChange={e=>setPrice(Number(e.target.value))} required/></Field><Field label="Material"><select className={selectClass} value={material} onChange={e=>setMaterial(e.target.value)}><option>PLA</option><option>PETG</option><option>Resina</option><option>TPU</option><option>ABS</option></select></Field><div className="grid grid-cols-2 gap-3"><Field label="Entrega en días"><input className={inputClass} type="number" min={1} value={deliveryDays} onChange={e=>setDeliveryDays(Number(e.target.value))}/></Field><Field label="Modalidad"><select className={selectClass} value={deliveryMethod} onChange={e=>setDeliveryMethod(e.target.value)}><option>A coordinar</option><option>Retiro</option><option>Envío</option></select></Field></div><Field label="Observaciones"><textarea className={`${inputClass} min-h-28 py-3`} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Terminación, relleno, ajustes, condiciones..."/></Field><Button type="submit" tone="orange" className="w-full" disabled={busy}><Send size={16}/>{busy ? "Enviando…" : "Enviar propuesta"}</Button></form>}
              </Panel>
              {job.workerId === user?.uid && <Panel><h3 className="text-xl font-black">Gestionar trabajo</h3><p className="mt-2 text-sm text-paper/50">Actualizá el estado una vez aceptada tu propuesta.</p><div className="mt-4 grid gap-2"><Button tone="ghost" onClick={()=>updateJobStatus(job.id,"in_production")}>Marcar en producción</Button><Button tone="ghost" onClick={()=>updateJobStatus(job.id,"ready")}>Marcar listo para entrega</Button><Button onClick={()=>updateJobStatus(job.id,"delivered")}>Marcar entregado</Button></div></Panel>}
            </>
          ) : (
            <Panel><h3 className="text-xl font-black">Resumen</h3><div className="mt-4 grid gap-3 text-sm text-paper/55"><Row label="Material" value={job.material}/><Row label="Cantidad" value={String(job.quantity)}/><Row label="Entrega" value={job.deliveryMethod}/><Row label="Presupuesto" value={`${formatMoney(job.budgetMin)}–${formatMoney(job.budgetMax)}`}/></div>{job.status === "accepted" && <Link href={`/messages/${job.id}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyanLink px-4 font-black text-ink"><MessageCircle size={16}/>Abrir conversación</Link>}</Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label:string; value:string }) { return <div className="flex items-center justify-between border-b border-paper/10 pb-2"><span>{label}</span><strong className="text-paper">{value}</strong></div>; }
