"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ModelCard } from "@/components/ModelCard";
import { PageHeader } from "@/components/PageHeader";
import { Panel, inputClass, selectClass } from "@/components/UI";
import { categories, materials, models as fallbackModels } from "@/data/models";
import type { Model3D } from "@/types";

export default function ModelsPage() {
  const [models, setModels] = useState<Model3D[]>(fallbackModels);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");

  useEffect(() => { search(); }, []);

  async function search() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (material) params.set("material", material);
    const response = await fetch(`/api/models?${params.toString()}`);
    const data = await response.json();
    setModels(data.models || fallbackModels);
  }

  return (
    <AppShell>
      <PageHeader title="Modelos 3D" subtitle="Explorá una base de modelos con peso, tiempo estimado, material y precio orientativo." />
      <Panel>
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_180px_130px]">
          <input className={inputClass} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key === "Enter" && search()} placeholder="Buscar soporte, miniatura, repuesto..."/>
          <select className={selectClass} value={category} onChange={e=>setCategory(e.target.value)}><option value="">Categoría</option>{categories.map(item=><option key={item}>{item}</option>)}</select>
          <select className={selectClass} value={material} onChange={e=>setMaterial(e.target.value)}><option value="">Material</option>{materials.map(item=><option key={item}>{item}</option>)}</select>
          <button onClick={search} className="min-h-12 rounded-2xl bg-cyanLink px-4 font-black text-ink">Buscar</button>
        </div>
      </Panel>
      <div className="mt-5 flex items-center justify-between"><p className="text-sm text-paper/45">{models.length} modelos encontrados</p><p className="text-xs font-bold uppercase tracking-[.08em] text-steel">API local</p></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{models.map(model=><ModelCard key={model.id} model={model}/>)}</div>
    </AppShell>
  );
}
