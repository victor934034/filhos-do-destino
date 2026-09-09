import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variante = "dourado" | "fantasma" | "terracota";

const VARIANTES: Record<Variante, string> = {
  dourado:
    "bg-gradient-to-b from-ouro-claro to-ouro text-tinta border border-bronze/70 hover:brightness-105 shadow-[0_2px_0_rgba(201,134,47,0.6)]",
  fantasma:
    "bg-transparent text-foreground border border-[var(--border-sutil)] hover:border-ouro hover:text-bronze",
  terracota:
    "bg-gradient-to-b from-terracota-clara to-terracota text-pergaminho border border-terracota hover:brightness-105",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 font-titulo text-sm uppercase tracking-[0.12em] transition-all duration-150 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none";

export function Botao({
  children,
  variante = "dourado",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; children: ReactNode }) {
  return (
    <button className={`${base} ${VARIANTES[variante]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function BotaoLink({
  children,
  href,
  variante = "dourado",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variante?: Variante;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${VARIANTES[variante]} ${className}`}>
      {children}
    </Link>
  );
}
