"use client";

import { useEffect, useState } from "react";
import type { FichaPersonagem } from "@/lib/tipos";

interface PersonagemMesa extends FichaPersonagem {
  donoUsuarioId: string;
  bloqueado?: false;
}
interface PersonagemMesaOculto {
  id: string;
  nome: string;
  ilustracaoUrl: string | null;
  donoUsuarioId: string;
  bloqueado: true;
}
export type PersonagemNaMesa = PersonagemMesa | PersonagemMesaOculto;

/**
 * O Personagem tem UM registro no banco — a ficha (/app/personagens/:id) é onde o
 * jogador edita, e toda tela que mostra os personagens de uma campanha (Hub, Escudo,
 * Mesa Ao Vivo) precisa ler desse mesmo registro ao vivo, não de um snapshot carregado
 * só no load da página. Sem WebSocket na stack atual, isso é feito por polling curto.
 */
export function usePersonagensAoVivo(campanhaId: string, seed: PersonagemNaMesa[]) {
  const [personagens, setPersonagens] = useState<PersonagemNaMesa[]>(seed);

  useEffect(() => {
    let cancelado = false;
    async function buscar() {
      const res = await fetch(`/api/campanhas/${campanhaId}/semideuses`);
      if (res.ok && !cancelado) setPersonagens(await res.json());
    }
    const t = setInterval(buscar, 4000);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, [campanhaId]);

  return [personagens, setPersonagens] as const;
}
