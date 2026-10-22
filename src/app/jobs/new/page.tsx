"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { Button, Field, Panel, inputClass, selectClass } from "@/components/UI";
import { models } from "@/data/models";
import { createJob } from "@/lib/firestore";
import { formatMoney } from "@/lib/pricing";

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const model = useMemo(() => models.find(item => item.id === searchParams.get("model")), [searchParams]);
  const [title, setTitle] = useState(model?.name || "");
  const [description, setDescription] = useState(model ? `Quiero imprimir ${model.name}. Necesito confirmar terminación y entrega.` : "");
  const [material, setMaterial] = useState<string>(model?.material || "PLA");
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("A definir");
  const [deliveryMethod, setDeliveryMethod] = useState("A coordinar");
  const [location, setLocation] = useState(profile?.location || "CABA");
  const [budgetMin, setBudgetMin] = useState(model ? Math.round(model.pricing.finalPrice * .9) : 5000);
  const [budgetMax, setBudgetMax] = useState(model ? Math.round(model.pricing.finalPrice * 1.15) : 15000);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !profile || profile.role !== "client") { setError("Solo las cuentas que buscan una impresión pueden publicar solicitudes."); return; }
    setBusy(true); setError("");
    try {
      const id = await createJob({
        clientId: user.uid,
        clientName: profile.name,
        title,
        description,
        material,
        quantity,
        color,
        deliveryMethod,
        location,
        budgetMin,
        budgetMax,
        modelId: model?.id,
        modelImageUrl: model?.imageUrl,
      });
      router.push(`/jobs/${id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo publicar la solicitud."); }
    finally { setBusy(false); }
  }

  return (
    <AppShell>
      <Link href={model ? `/models/${model.id}` : "/jobs"} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-paper/50 hover:text-paper"><ArrowLeft size={16}/>Volver</Link>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel>
          <h1 className="text-4xl font-black tracking-[-.055em]">Publicar solicitud</h1>
          <p className="mt-2 text-paper/55">Cuanto más clara sea la información, más comparables serán las propuestas.</p>
          {error && <div className="mt-5 rounded-2xl border border-alert/30 bg-alert/10 p-4 text-sm text-red-100">{error}</div>}
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <Field label="Título"><input className={inputClass} value={title} onChange={e=>setTitle(e.target.value)} required/></Field>
            <Field label="Descripción"><textarea className={`${inputClass} min-h-32 py-3`} value={description} onChange={e=>setDescription(e.target.value)} required/></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Material"><select className={selectClass} value={material} onChange={e=>setMaterial(e.target.value)}><option>PLA</option><option>PETG</option><option>Resina</option><option>TPU</option><option>ABS</option><option>A definir</option></select></Field><Field label="Cantidad"><input className={inputClass} type="number" min={1} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Color"><input className={inputClass} value={color} onChange={e=>setColor(e.target.value)}/></Field><Field label="Entrega"><select className={selectClass} value={deliveryMethod} onChange={e=>setDeliveryMethod(e.target.value)}><option>A coordinar</option><option>Retiro</option><option>Envío</option></select></Field></div>
            <Field label="Ubicación"><input className={inputClass} value={location} onChange={e=>setLocation(e.target.value)} placeholder="Barrio, ciudad o zona"/></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Presupuesto mínimo"><input className={inputClass} type="number" min={0} value={budgetMin} onChange={e=>setBudgetMin(Number(e.target.value))}/></Field><Field label="Presupuesto máximo"><input className={inputClass} type="number" min={0} value={budgetMax} onChange={e=>setBudgetMax(Number(e.target.value))}/></Field></div>
            <Button type="submit" tone="orange" className="mt-2 w-full" disabled={busy}>{busy ? "Publicando…" : "Publicar solicitud"}</Button>
          </form>
        </Panel>
        <div className="grid content-start gap-5">
          {model && <Panel className="overflow-hidden p-0"><div className="relative aspect-[16/10]"><Image src={model.imageUrl} alt={model.name} fill className="object-cover"/></div><div className="p-5"><p className="text-xs font-bold uppercase tracking-[.08em] text-steel">Modelo de referencia</p><h3 className="mt-2 text-xl font-black">{model.name}</h3><p className="mt-2 text-sm text-paper/50">{model.material} · {model.weightGrams} g · estimado {formatMoney(model.pricing.finalPrice)}</p></div></Panel>}
          <Panel><h3 className="text-xl font-black">Resumen</h3><div className="mt-4 grid gap-3 text-sm text-paper/55"><div className="flex justify-between"><span>Material</span><strong className="text-paper">{material}</strong></div><div className="flex justify-between"><span>Cantidad</span><strong className="text-paper">{quantity}</strong></div><div className="flex justify-between"><span>Presupuesto</span><strong className="text-cyanLink">{formatMoney(budgetMin)}–{formatMoney(budgetMax)}</strong></div></div></Panel>
        </div>
      </div>
    </AppShell>
  );
}


export default function NewJobPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="grid min-h-64 place-items-center text-paper/50">
          Cargando formulario…
        </div>
      </AppShell>
    }>
      <NewJobForm />
    </Suspense>
  );
}
