"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, Field, inputClass } from "@/components/UI";
import { useAuth } from "@/components/AuthProvider";
import { registerUser } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [studioName, setStudioName] = useState("");
  const [location, setLocation] = useState("CABA");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (role === "worker" && !studioName.trim()) {
      setError("Ingresá el nombre del taller o servicio.");
      return;
    }

    setBusy(true);

    try {
      await registerUser({ name, email, password, role, studioName, location });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-5 py-10">
      <section className="w-full max-w-5xl overflow-hidden rounded-[34px] border border-paper/10 bg-ink2 shadow-brand">
        <div className="grid lg:grid-cols-[.78fr_1.22fr]">
          <div className="bg-gradient-to-br from-cyanLink to-cyanSoft p-8 text-ink lg:p-10">
            <Logo darkText />
            <h1 className="mt-20 text-5xl font-black leading-[.92] tracking-[-.07em]">
              Una cuenta. Un rol claro dentro de la plataforma.
            </h1>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-ink/70">
              El tipo de cuenta se define al registrarse y queda guardado localmente en este navegador.
            </p>
          </div>

          <div className="p-7 lg:p-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-paper/50 hover:text-paper">
              <ArrowLeft size={16}/>Volver
            </Link>

            <h2 className="mt-8 text-4xl font-black tracking-[-.055em]">Crear cuenta</h2>
            <p className="mt-2 text-paper/55">Elegí cómo vas a usar PrintLink 3D.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button onClick={()=>setRole("client")} className={`rounded-3xl border p-4 text-left transition ${role === "client" ? "border-cyanLink/45 bg-cyanLink/10" : "border-paper/10 bg-paper/[0.035]"}`}>
                <ShoppingBag className="text-cyanLink"/>
                <h3 className="mt-3 font-black">Quiero imprimir</h3>
                <p className="mt-1 text-sm text-paper/50">Publicar pedidos y contratar talleres.</p>
              </button>

              <button onClick={()=>setRole("worker")} className={`rounded-3xl border p-4 text-left transition ${role === "worker" ? "border-printOrange/45 bg-printOrange/10" : "border-paper/10 bg-paper/[0.035]"}`}>
                <BriefcaseBusiness className="text-printOrange"/>
                <h3 className="mt-3 font-black">Quiero ofrecer impresiones</h3>
                <p className="mt-1 text-sm text-paper/50">Guardar trabajos y enviar propuestas.</p>
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-alert/30 bg-alert/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre">
                  <input className={inputClass} value={name} onChange={e=>setName(e.target.value)} required/>
                </Field>
                <Field label="Ubicación">
                  <input className={inputClass} value={location} onChange={e=>setLocation(e.target.value)} placeholder="CABA"/>
                </Field>
              </div>

              {role === "worker" && (
                <Field label="Nombre del taller / servicio">
                  <input className={inputClass} value={studioName} onChange={e=>setStudioName(e.target.value)} placeholder="Ej. Taller Mislej 3D" required/>
                </Field>
              )}

              <Field label="Email">
                <input className={inputClass} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required/>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contraseña">
                  <input className={inputClass} type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
                </Field>
                <Field label="Repetir contraseña">
                  <input className={inputClass} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required/>
                </Field>
              </div>

              <Button type="submit" tone={role === "worker" ? "orange" : "cyan"} className="mt-2 w-full" disabled={busy}>
                {busy ? "Creando cuenta…" : "Crear cuenta"}
              </Button>
            </form>

            <p className="mt-5 text-xs leading-relaxed text-paper/40">
              La contraseña se transforma en un hash local antes de guardarse. Este sistema está pensado para una demo local, no para una plataforma pública con datos sensibles.
            </p>

            <p className="mt-7 text-sm text-paper/50">
              ¿Ya tenés cuenta? <Link href="/login" className="font-black text-paper">Ingresá</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
