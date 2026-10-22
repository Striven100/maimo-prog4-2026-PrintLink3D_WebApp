"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button, Field, Panel, inputClass } from "@/components/UI";
import { updateUserProfile } from "@/lib/firestore";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [materials, setMaterials] = useState("");
  const [gramPrice, setGramPrice] = useState(250);
  const [hourPrice, setHourPrice] = useState(700);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setStudioName(profile.studioName || "");
    setBio(profile.bio || "");
    setLocation(profile.location || "");
    setMaterials((profile.materials || []).join(", "));
    setGramPrice(profile.baseGramPrice || 250);
    setHourPrice(profile.baseHourPrice || 700);
  }, [profile]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !profile) return;
    await updateUserProfile(user.uid, {
      name,
      studioName: profile.role === "worker" ? studioName : undefined,
      bio,
      location,
      materials: profile.role === "worker" ? materials.split(",").map(item=>item.trim()).filter(Boolean) : [],
      baseGramPrice: profile.role === "worker" ? gramPrice : undefined,
      baseHourPrice: profile.role === "worker" ? hourPrice : undefined,
    });
    await refreshProfile();
    setNotice("Perfil actualizado.");
  }

  return (
    <AppShell>
      <PageHeader title="Mi cuenta" subtitle="Actualizá los datos públicos de tu perfil. El email y la contraseña se gestionan desde Firebase Authentication." />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel>
          <form onSubmit={save} className="grid gap-4">
            {notice && <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-green-100">{notice}</div>}
            <Field label="Nombre"><input className={inputClass} value={name} onChange={e=>setName(e.target.value)}/></Field>
            <Field label="Email"><input className={`${inputClass} opacity-60`} value={profile?.email || ""} disabled/></Field>
            {profile?.role === "worker" && <Field label="Nombre del taller"><input className={inputClass} value={studioName} onChange={e=>setStudioName(e.target.value)}/></Field>}
            <Field label="Ubicación"><input className={inputClass} value={location} onChange={e=>setLocation(e.target.value)} placeholder="CABA, Palermo, zona norte..."/></Field>
            <Field label="Descripción"><textarea className={`${inputClass} min-h-32 py-3`} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Contá brevemente qué hacés o qué tipo de impresiones buscás."/></Field>
            {profile?.role === "worker" && <><Field label="Materiales disponibles"><input className={inputClass} value={materials} onChange={e=>setMaterials(e.target.value)} placeholder="PLA, PETG, Resina"/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Precio base por gramo"><input className={inputClass} type="number" min={0} value={gramPrice} onChange={e=>setGramPrice(Number(e.target.value))}/></Field><Field label="Valor hora máquina"><input className={inputClass} type="number" min={0} value={hourPrice} onChange={e=>setHourPrice(Number(e.target.value))}/></Field></div></>}
            <Button type="submit" tone={profile?.role === "worker" ? "orange" : "cyan"} className="mt-2 w-full sm:w-auto">Guardar cambios</Button>
          </form>
        </Panel>
        <Panel className="h-fit"><p className="text-xs font-black uppercase tracking-[.09em] text-steel">Tipo de cuenta</p><h3 className="mt-2 text-2xl font-black">{profile?.role === "worker" ? "Taller / impresor" : "Cliente"}</h3><p className="mt-3 text-sm leading-relaxed text-paper/50">El rol se define al registrarse para evitar cambiar accidentalmente permisos de publicación, propuestas o aceptación.</p></Panel>
      </div>
    </AppShell>
  );
}
