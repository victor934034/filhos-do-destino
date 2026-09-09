import { ButtonHTMLAttributes, ReactNode } from "react";

type VarianteAcao = "destaque" | "neutro" | "info" | "perigo";

const VARIANTES: Record<VarianteAcao, string> = {
  // Equipar, ativar, ações "positivas" em destaque.
  destaque: "bg-ouro-claro/15 text-bronze border-ouro/40 hover:bg-ouro-claro/25",
  // Editar e outras ações neutras de gestão.
  neutro: "bg-white/5 text-foreground/75 border-[var(--border-sutil)] hover:bg-white/10 hover:border-ouro",
  // Vender e outras ações de transação.
  info: "bg-egeu/10 text-egeu border-egeu/30 hover:bg-egeu/20",
  // Remover e outras ações destrutivas.
  perigo: "bg-terracota/10 text-terracota border-terracota/40 hover:bg-terracota/20",
};

/** Botão de ação pequeno e real (fundo + borda), pra listas de item/poder/ataque — nunca texto sublinhado solto. */
export function AcaoBotao({
  children,
  variante = "neutro",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteAcao; children: ReactNode }) {
  return (
    <button
      className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Wrapper padrão pra uma linha de AcaoBotao no rodapé de um card — separa do conteúdo com borda e quebra linha em telas estreitas. */
export function LinhaAcoes({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border-sutil)] pt-3 ${className}`}>
      {children}
    </div>
  );
}
