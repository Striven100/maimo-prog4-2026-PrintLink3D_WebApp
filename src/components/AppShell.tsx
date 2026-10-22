"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Boxes, BriefcaseBusiness, LayoutDashboard, LogOut, MessageCircle, Search, Send, Store, UserRound, UsersRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/UI";
import { useAuth } from "@/components/AuthProvider";
import { logoutUser } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login");
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="max-w-2xl rounded-[30px] border border-printOrange/30 bg-ink2 p-8 shadow-brand">
          <Logo />
          <h1 className="mt-8 text-4xl font-black tracking-[-.055em]">Falta conectar Firebase</h1>
          <p className="mt-4 leading-relaxed text-paper/65">Copiá <code>.env.example</code> como <code>.env.local</code> y completá los valores del proyecto Firebase. Las instrucciones están en <code>FIREBASE_SETUP.md</code>.</p>
        </div>
      </main>
    );
  }

  if (loading || !user || !profile) {
    return <main className="grid min-h-screen place-items-center text-paper/60">Cargando cuenta…</main>;
  }

  const clientLinks = [
    ["/dashboard", "Inicio", LayoutDashboard],
    ["/models", "Modelos 3D", Search],
    ["/jobs", "Mis solicitudes", BriefcaseBusiness],
    ["/workers", "Talleres", UsersRound],
    ["/messages", "Mensajes", MessageCircle],
    ["/profile", "Mi cuenta", UserRound],
  ] as const;

  const workerLinks = [
    ["/dashboard", "Inicio", LayoutDashboard],
    ["/jobs", "Trabajos", BriefcaseBusiness],
    ["/saved", "Guardados", Bookmark],
    ["/offers", "Mis propuestas", Send],
    ["/messages", "Mensajes", MessageCircle],
    ["/portfolio", "Portfolio", Store],
    ["/profile", "Mi cuenta", UserRound],
  ] as const;

  const links = profile.role === "client" ? clientLinks : workerLinks;

  async function handleLogout() {
    await logoutUser();
    router.replace("/");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[278px_1fr]">
      <aside className="border-b border-paper/10 bg-black/20 px-5 py-5 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
        <Logo />
        <nav className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {links.map(([href, label, Icon]) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link key={href} href={href} className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold transition ${active ? "border border-cyanLink/30 bg-cyanLink/10 text-cyanSoft" : "text-paper/65 hover:bg-paper/5 hover:text-paper"}`}>
                <Icon size={17}/><span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 hidden rounded-3xl border border-paper/10 bg-paper/[0.045] p-4 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyanLink to-printOrange font-black text-ink">{profile.name.slice(0,1).toUpperCase()}</div>
            <div className="min-w-0"><p className="truncate font-black">{profile.role === "worker" ? profile.studioName || profile.name : profile.name}</p><p className="truncate text-xs text-paper/45">{profile.email}</p></div>
          </div>
          <Button tone="ghost" className="mt-4 w-full" onClick={handleLogout}><LogOut size={15}/>Cerrar sesión</Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-paper/10 px-5 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-paper/45"><Boxes size={16}/><span>PrintLink 3D</span></div>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-paper/55 sm:block">{profile.role === "worker" ? profile.studioName || profile.name : profile.name}</span><Link href="/profile" className="grid h-9 w-9 place-items-center rounded-xl border border-paper/10 bg-paper/5"><UserRound size={16}/></Link></div>
        </header>
        <main className="mx-auto w-full max-w-[1540px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
