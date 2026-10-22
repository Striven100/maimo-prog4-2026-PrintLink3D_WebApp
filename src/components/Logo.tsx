import Link from "next/link";

export function Logo({ darkText = false }: { darkText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <svg viewBox="0 0 260 210" className="h-11 w-14 shrink-0">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="18">
          <path stroke={darkText ? "#101A20" : "#20D6C7"} d="M28 67 88 32l60 35v70l-60 35-60-35z" />
          <path stroke={darkText ? "#101A20" : "#20D6C7"} d="M28 67l60 35 60-35M88 102v70" />
          <path stroke="#FF7A45" d="M112 78l55-32 55 32v64l-55 32-55-32z" />
          <path stroke="#FF7A45" d="M112 78l55 32 55-32M167 110v64" />
        </g>
      </svg>
      <span className={`text-2xl font-black leading-none tracking-[-0.06em] ${darkText ? "text-ink" : "text-paper"}`}>
        PrintLink<span className="ml-1 rounded-lg bg-printOrange px-1.5 py-1 align-top text-xs tracking-normal text-ink">3D</span>
      </span>
    </Link>
  );
}
