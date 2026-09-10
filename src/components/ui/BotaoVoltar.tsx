"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export function BotaoVoltar({
  label = "Voltar",
  fallbackHref,
  /** Se true, esconde o link "Início" ao lado (ex.: já está na tela principal). */
  semInicio = false,
  className = "",
}: {
  label?: string;
  /** Rota usada se não houver histórico de navegação (ex.: acesso direto pela URL). */
  fallbackHref?: string;
  semInicio?: boolean;
  className?: string;
}) {
  const router = useRouter();

  function voltar() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        onClick={voltar}
        className="inline-flex items-center gap-1.5 font-gravado text-xs uppercase tracking-widest text-foreground/55 transition hover:text-ouro"
      >
        <span aria-hidden>←</span> {label}
      </button>
      {!semInicio && (
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 font-gravado text-xs uppercase tracking-widest text-foreground/55 transition hover:text-ouro"
        >
          <span aria-hidden>⌂</span> Início
        </Link>
      )}
    </div>
  );
}
