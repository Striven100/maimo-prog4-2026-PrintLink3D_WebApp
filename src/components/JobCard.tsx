"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, MapPin, Package2 } from "lucide-react";
import { Badge, Button, Panel } from "@/components/UI";
import { formatMoney } from "@/lib/pricing";
import type { PrintJob } from "@/types";

const labels: Record<string, string> = {
  published: "Publicada",
  with_offers: "Con propuestas",
  accepted: "Propuesta aceptada",
  in_production: "En producción",
  ready: "Lista para entrega",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

export function JobCard({ job, saved = false, onSave }: { job: PrintJob; saved?: boolean; onSave?: (job: PrintJob) => void }) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="grid md:grid-cols-[190px_1fr]">
        <div className="relative min-h-40 bg-ink3">
          {job.modelImageUrl ? <Image src={job.modelImageUrl} alt={job.title} fill className="object-cover" sizes="190px"/> : <div className="grid h-full min-h-40 place-items-center"><Package2 className="text-paper/25" size={54}/></div>}
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div><Badge tone={job.status === "accepted" || job.status === "in_production" || job.status === "delivered" ? "green" : job.status === "with_offers" ? "orange" : "cyan"}>{labels[job.status] || job.status}</Badge><h3 className="mt-3 text-xl font-black">{job.title}</h3><p className="mt-2 text-sm text-paper/55">{job.description}</p></div>
            {onSave && <Button tone={saved ? "cyan" : "ghost"} onClick={() => onSave(job)}><Bookmark size={16}/>{saved ? "Guardado" : "Guardar"}</Button>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Badge>{job.material}</Badge><Badge>{job.quantity} unidad/es</Badge><Badge>{job.color}</Badge><Badge tone="orange">{formatMoney(job.budgetMin)}–{formatMoney(job.budgetMax)}</Badge></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 pt-4 text-sm text-paper/55"><span className="flex items-center gap-2"><MapPin size={15}/>{job.location || "Ubicación a coordinar"}</span><Link href={`/jobs/${job.id}`} className="font-black text-cyanLink">Ver trabajo →</Link></div>
        </div>
      </div>
    </Panel>
  );
}
