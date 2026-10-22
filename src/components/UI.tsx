import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[26px] border border-paper/10 bg-paper/[0.045] p-5 shadow-card backdrop-blur ${className}`}>{children}</section>;
}

export function Button({ children, type = "button", tone = "cyan", className = "", disabled = false, onClick }: { children: ReactNode; type?: "button" | "submit"; tone?: "cyan" | "orange" | "ghost" | "danger"; className?: string; disabled?: boolean; onClick?: () => void }) {
  const tones = {
    cyan: "bg-cyanLink text-ink hover:brightness-110",
    orange: "bg-printOrange text-ink hover:brightness-110",
    ghost: "border border-paper/10 bg-paper/5 text-paper hover:bg-paper/10",
    danger: "border border-alert/25 bg-alert/10 text-red-100 hover:bg-alert/15",
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}>{children}</button>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "cyan" | "orange" | "green" | "red" }) {
  const tones = {
    neutral: "border-paper/10 bg-paper/5 text-paper/75",
    cyan: "border-cyanLink/30 bg-cyanLink/10 text-cyanSoft",
    orange: "border-printOrange/30 bg-printOrange/10 text-orange-100",
    green: "border-success/30 bg-success/10 text-green-100",
    red: "border-alert/30 bg-alert/10 text-red-100",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold ${tones[tone]}`}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[.08em] text-steel">{label}</span>{children}</label>;
}

export const inputClass = "min-h-12 w-full rounded-2xl border border-paper/10 bg-paper/5 px-4 text-paper outline-none transition placeholder:text-steel focus:border-cyanLink focus:ring-2 focus:ring-cyanLink/15";
export const selectClass = "min-h-12 w-full rounded-2xl border border-paper/10 bg-ink2 px-4 text-paper outline-none transition focus:border-cyanLink focus:ring-2 focus:ring-cyanLink/15";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <Panel className="grid min-h-64 place-items-center text-center"><div className="max-w-lg"><h3 className="text-2xl font-black">{title}</h3><p className="mt-2 text-paper/55">{body}</p>{action && <div className="mt-5">{action}</div>}</div></Panel>;
}
