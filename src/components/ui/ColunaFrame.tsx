import { ReactNode } from "react";

/**
 * Moldura em estilo de coluna jônica: usada como container de fichas,
 * cards de campanha/monstro e qualquer bloco que precise de presença "arquitetônica".
 *
 * variante "pergaminho": card de "documento" — fundo creme com faixas de
 * meandro grego dourado no topo e na base, texto em tinta escura.
 */
export function ColunaFrame({
  children,
  className = "",
  titulo,
  variante = "padrao",
}: {
  children: ReactNode;
  className?: string;
  titulo?: string;
  variante?: "padrao" | "pergaminho";
}) {
  const ehPergaminho = variante === "pergaminho";

  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-[var(--border-sutil)] shadow-[0_1px_0_rgba(224,151,58,0.35),0_12px_28px_-16px_rgba(0,0,0,0.5)] ${
        ehPergaminho ? "bg-pergaminho text-tinta" : "bg-[var(--surface)]"
      } ${className}`}
    >
      {ehPergaminho ? (
        <div className="faixa-meandro" />
      ) : (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-ouro to-transparent opacity-70" />
      )}
      <div className="pointer-events-none absolute -top-1 left-3 h-2 w-2 rotate-45 border-t border-l border-ouro/60" />
      <div className="pointer-events-none absolute -top-1 right-3 h-2 w-2 rotate-45 border-t border-r border-ouro/60" />
      {titulo && (
        <div
          className={`border-b px-5 py-3 ${ehPergaminho ? "border-tinta/15" : "border-[var(--border-sutil)]"}`}
        >
          <h3
            className={`font-titulo text-sm uppercase tracking-[0.18em] ${
              ehPergaminho ? "text-bronze" : "text-bronze"
            }`}
          >
            {titulo}
          </h3>
        </div>
      )}
      <div>{children}</div>
      {ehPergaminho ? (
        <div className="faixa-meandro rotate-180" />
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-ouro/50 to-transparent" />
      )}
    </div>
  );
}
