import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, MessageCircle, Search, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Badge, Panel } from "@/components/UI";
import { models } from "@/data/models";
import { formatMoney } from "@/lib/pricing";

export default function LandingPage() {
  const featured = models.slice(0, 3);
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-paper/10 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-bold text-paper/65 md:flex"><Link href="#modelos">Modelos</Link><Link href="#funciones">Cómo funciona</Link><Link href="#talleres">Talleres</Link></nav>
          <div className="flex items-center gap-2"><Link href="/login" className="rounded-2xl border border-paper/10 bg-paper/5 px-4 py-3 text-sm font-black">Ingresar</Link><Link href="/register" className="rounded-2xl bg-printOrange px-4 py-3 text-sm font-black text-ink">Crear cuenta</Link></div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-10 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-24">
        <div className="self-center">
          <Badge tone="cyan">Marketplace de impresión 3D</Badge>
          <h1 className="mt-6 max-w-4xl text-6xl font-black leading-[.91] tracking-[-.075em] lg:text-[88px]">De un modelo digital a una impresión real.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-paper/65 lg:text-xl">Buscá modelos, publicá lo que necesitás y recibí propuestas de talleres. Todo el acuerdo queda centralizado en una sola plataforma.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-cyanLink px-5 font-black text-ink">Empezar ahora <ArrowRight size={18}/></Link><Link href="/login" className="inline-flex min-h-12 items-center rounded-2xl border border-paper/10 bg-paper/5 px-5 font-black">Ya tengo cuenta</Link></div>
          <div className="mt-10 flex flex-wrap gap-5 text-sm text-paper/55"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success"/>Cuenta con email</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success"/>Propuestas comparables</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success"/>Chat en tiempo real</span></div>
        </div>

        <div className="relative rounded-[36px] border border-paper/10 bg-gradient-to-br from-cyanLink/10 via-paper/[0.035] to-printOrange/10 p-4 shadow-brand lg:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((model, index) => (
              <div key={model.id} className={`overflow-hidden rounded-3xl border border-paper/10 bg-ink2 ${index === 0 ? "md:col-span-2" : ""}`}>
                <div className={`relative ${index === 0 ? "aspect-[16/6]" : "aspect-[4/3]"}`}><Image src={model.imageUrl} alt={model.name} fill className="object-cover" sizes="50vw"/></div>
                <div className="p-4"><h3 className="font-black">{model.name}</h3><div className="mt-2 flex items-center justify-between text-sm"><span className="text-paper/45">{model.material} · {model.weightGrams} g</span><strong className="text-cyanLink">{formatMoney(model.pricing.finalPrice)}</strong></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="funciones" className="border-y border-paper/10 bg-black/10 py-20">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-8"><div className="grid gap-5 lg:grid-cols-4">
          {[ [Search,"Explorá modelos","Encontrá una base técnica antes de pedir una impresión."],[Sparkles,"Publicá un pedido","Definí material, cantidad, ubicación y presupuesto."],[Store,"Recibí propuestas","Los talleres pueden guardar el trabajo y cotizarlo."],[MessageCircle,"Acordá detalles","Al aceptar una propuesta se habilita una conversación privada."] ].map(([Icon,title,body]) => { const C=Icon as typeof Search; return <Panel key={String(title)}><C className="text-cyanLink"/><h3 className="mt-5 text-xl font-black">{String(title)}</h3><p className="mt-2 text-sm text-paper/55">{String(body)}</p></Panel>; })}
        </div></div>
      </section>

      <section id="modelos" className="mx-auto max-w-[1500px] px-5 py-20 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Badge tone="orange">Catálogo demo</Badge><h2 className="mt-4 text-4xl font-black tracking-[-.055em] lg:text-5xl">Modelos con datos técnicos claros.</h2></div><Link href="/register" className="font-black text-cyanLink">Crear cuenta para explorar →</Link></div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{models.slice(3,9).map(model => <div key={model.id} className="overflow-hidden rounded-3xl border border-paper/10 bg-paper/[0.04]"><div className="relative aspect-[16/10]"><Image src={model.imageUrl} alt={model.name} fill className="object-cover"/></div><div className="p-5"><h3 className="font-black">{model.name}</h3><p className="mt-2 text-sm text-paper/50">{model.material} · {model.weightGrams} g · {Math.round(model.printTimeMinutes/6)/10} h</p></div></div>)}</div>
      </section>

      <section id="talleres" className="mx-auto max-w-[1500px] px-5 pb-24 lg:px-8"><Panel className="grid gap-8 overflow-hidden bg-gradient-to-r from-cyanLink/10 to-printOrange/10 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-2 text-cyanSoft"><ShieldCheck size={18}/><span className="text-sm font-black uppercase tracking-[.1em]">Cuenta persistente</span></div><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.055em]">Registrate una sola vez y usá la plataforma desde cualquier dispositivo.</h2></div><Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-printOrange px-6 font-black text-ink">Crear cuenta</Link></Panel></section>
    </main>
  );
}
