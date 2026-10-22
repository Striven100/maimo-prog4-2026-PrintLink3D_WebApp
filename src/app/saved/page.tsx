"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { JobCard } from "@/components/JobCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/UI";
import { subscribeOpenJobs, subscribeSavedJobIds, unsaveJob } from "@/lib/firestore";
import type { PrintJob } from "@/types";

export default function SavedPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubJobs = subscribeOpenJobs(setJobs);
    const unsubSaved = subscribeSavedJobIds(user.uid, setSavedIds);
    return () => { unsubJobs(); unsubSaved(); };
  }, [user]);

  const savedJobs = jobs.filter(job=>savedIds.includes(job.id));

  async function remove(job: PrintJob) { if (user) await unsaveJob(user.uid, job.id); }

  return (
    <AppShell>
      <PageHeader title="Trabajos guardados" subtitle="Una lista corta para volver a las solicitudes que querés evaluar o cotizar más tarde." />
      <div className="grid gap-4">{savedJobs.length ? savedJobs.map(job=><JobCard key={job.id} job={job} saved onSave={remove}/>) : <EmptyState title="No guardaste trabajos" body="Cuando encuentres una solicitud interesante, usá Guardar para mantenerla en esta lista."/>}</div>
    </AppShell>
  );
}
