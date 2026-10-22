import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-4xl font-black tracking-[-.055em] lg:text-5xl">{title}</h1><p className="mt-2 max-w-3xl text-paper/55">{subtitle}</p></div>
      {action}
    </header>
  );
}
