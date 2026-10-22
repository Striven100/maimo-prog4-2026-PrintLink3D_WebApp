import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Scale } from "lucide-react";
import { Badge, Panel } from "@/components/UI";
import { formatMoney } from "@/lib/pricing";
import type { Model3D } from "@/types";

export function ModelCard({ model }: { model: Model3D }) {
  return (
    <Link href={`/models/${model.id}`} className="group block h-full">
      <Panel className="h-full overflow-hidden p-0 transition duration-200 group-hover:-translate-y-1 group-hover:border-cyanLink/35">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink3">
          <Image src={model.imageUrl} alt={model.name} fill className="object-cover transition duration-300 group-hover:scale-[1.025]" sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute left-3 top-3"><Badge tone="cyan">{model.material}</Badge></div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.09em] text-steel">{model.category}</p><h3 className="mt-1 text-xl font-black leading-tight">{model.name}</h3></div>
            <ArrowUpRight className="mt-1 shrink-0 text-paper/35 transition group-hover:text-cyanLink" size={20} />
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-paper/55">{model.description}</p>
          <div className="mt-4 flex gap-2 text-xs text-paper/60"><span className="flex items-center gap-1.5"><Scale size={14}/>{model.weightGrams} g</span><span className="flex items-center gap-1.5"><Clock3 size={14}/>{Math.round(model.printTimeMinutes / 6) / 10} h</span></div>
          <div className="mt-4 border-t border-paper/10 pt-4"><span className="text-xs text-paper/45">Estimado desde</span><div className="text-2xl font-black text-cyanLink">{formatMoney(model.pricing.finalPrice)}</div></div>
        </div>
      </Panel>
    </Link>
  );
}
