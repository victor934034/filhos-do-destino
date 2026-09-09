"use client";

import { useRouter } from "next/navigation";

export function BotaoVoltar({
  label = "Voltar",
  fallbackHref,
  className = "",
}: {
  label?: string;
  /** Rota usada se não houver histórico de navegação (ex.: acesso direto pela URL). */
  fallbackHref?: string;
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
    <button
      onClick={voltar}
      className={`inline-flex items-center gap-1.5 font-gravado text-xs uppercase tracking-widest text-foreground/55 transition hover:text-ouro ${className}`}
    >
      <span aria-hidden>←</span> {label}
    </button>
  );
}
