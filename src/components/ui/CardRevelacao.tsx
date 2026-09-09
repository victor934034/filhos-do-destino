import type { ReactNode } from "react";
import { Divisor } from "@/components/ui/Divisor";

/**
 * Padrão de "revelação": ícone circular dourado + título Cinzel + subtítulo em
 * caps dourado + parágrafo narrativo. Usar sempre que o sistema revelar algo
 * ao jogador — resultado de teste crítico, level up, item raro, etc.
 */
export function CardRevelacao({
  icone,
  titulo,
  subtitulo,
  children,
}: {
  icone: ReactNode;
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-ouro bg-gradient-to-b from-ouro-claro/20 to-transparent text-ouro">
        {icone}
      </span>
      <h3 className="mt-4 font-titulo text-2xl uppercase tracking-wide text-pergaminho">{titulo}</h3>
      {subtitulo && (
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ouro">{subtitulo}</p>
      )}
      <Divisor centralizado className="my-4" />
      <p className="text-sm leading-relaxed text-foreground/80">{children}</p>
    </div>
  );
}
