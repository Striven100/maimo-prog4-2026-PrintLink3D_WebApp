"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { JobCard } from "@/components/JobCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/UI";
import { saveJob, subscribeMyJobs, subscribeOpenJobs, subscribeSavedJobIds, unsaveJob } from "@/lib/firestore";
import type { PrintJob } from "@/types";

export default function JobsPage() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !profile) return;
    const unsubJobs = profile.role === "client" ? subscribeMyJobs(user.uid, setJobs) : subscribeOpenJobs(setJobs);
    const unsubSaved = profile.role === "worker" ? subscribeSavedJobIds(user.uid, setSavedIds) : undefined;
    return () => { unsubJobs(); unsubSaved?.(); };
  }, [user, profile]);

  async function toggleSaved(job: PrintJob) {
    if (!user) return;
    if (savedIds.includes(job.id)) await unsaveJob(user.uid, job.id);
    else await saveJob(user.uid, job.id);
  }

  return (
    <AppShell>
      <PageHeader
        title={profile?.role === "client" ? "Mis solicitudes" : "Trabajos disponibles"}
        subtitle={profile?.role === "client" ? "Seguí el estado de tus pedidos y abrí las propuestas recibidas." : "Explorá solicitudes activas, guardá las interesantes y enviá una propuesta cuando quieras tomar el trabajo."}
        action={profile?.role === "client" ? <Link href="/jobs/new" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-printOrange px-5 font-black text-ink"><Plus size={17}/>Publicar solicitud</Link> : undefined}
      />
      <div className="grid gap-4">
        {jobs.length ? jobs.map(job => <JobCard key={job.id} job={job} saved={savedIds.includes(job.id)} onSave={profile?.role === "worker" ? toggleSaved : undefined}/>) : <EmptyState title={profile?.role === "client" ? "Todavía no publicaste solicitudes" : "No hay trabajos abiertos ahora"} body={profile?.role === "client" ? "Podés empezar desde un modelo o publicar una solicitud desde cero." : "Cuando un cliente publique una nueva solicitud aparecerá acá."} action={profile?.role === "client" ? <Link href="/jobs/new" className="inline-flex rounded-2xl bg-cyanLink px-5 py-3 font-black text-ink">Publicar primer pedido</Link> : undefined}/>} 
      </div>
    </AppShell>
  );
}
