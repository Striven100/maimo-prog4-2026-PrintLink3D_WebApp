"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, Field, inputClass } from "@/components/UI";
import { useAuth } from "@/components/AuthProvider";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await loginUser(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-5">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[34px] border border-paper/10 bg-ink2 shadow-brand lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative min-h-[560px] bg-cyanLink p-8 text-ink lg:p-10">
          <Logo darkText />
          <h1 className="mt-24 text-5xl font-black leading-[.93] tracking-[-.07em] lg:text-6xl">
            Volvé a tus pedidos, propuestas y conversaciones.
          </h1>
          <p className="mt-5 max-w-lg text-lg font-semibold leading-relaxed text-ink/70">
            La cuenta y la sesión se guardan localmente en este navegador. La contraseña se almacena como hash, no como texto plano.
          </p>
        </div>

        <div className="p-7 lg:p-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-paper/50 hover:text-paper">
            <ArrowLeft size={16}/>Volver
          </Link>

          <h2 className="mt-10 text-4xl font-black tracking-[-.055em]">Ingresar</h2>
          <p className="mt-2 text-paper/55">Accedé con el email y contraseña de una cuenta creada en este navegador.</p>

          {error && (
            <div className="mt-5 rounded-2xl border border-alert/30 bg-alert/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-7 grid gap-4">
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" size={17}/>
                <input className={`${inputClass} pl-11`} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required/>
              </div>
            </Field>

            <Field label="Contraseña">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" size={17}/>
                <input className={`${inputClass} pl-11`} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
              </div>
            </Field>

            <Button type="submit" className="mt-2 w-full" disabled={busy}>
              {busy ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>

          <div className="mt-5 rounded-2xl border border-paper/10 bg-paper/[0.04] p-4 text-xs leading-relaxed text-paper/45">
            Si borrás los datos del navegador, también se eliminan las cuentas locales y su información.
          </div>

          <p className="mt-7 text-sm text-paper/50">
            ¿Todavía no tenés cuenta? <Link href="/register" className="font-black text-paper">Registrate</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
