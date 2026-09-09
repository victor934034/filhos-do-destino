import type { Transacao as TransacaoDb } from "@prisma/client";
import type { Transacao } from "@/lib/tipos";

export function paraTransacao(t: TransacaoDb): Transacao {
  return {
    id: t.id,
    personagemId: t.personagemId,
    campanhaId: t.campanhaId,
    tipo: t.tipo as Transacao["tipo"],
    valor: t.valor,
    motivo: t.motivo,
    autorId: t.autorId,
    criadoEm: t.criadoEm.toISOString(),
  };
}
