import type { PoderCompendio as PoderDb } from "@prisma/client";
import type { PoderCompendio } from "@/lib/tipos";

export function paraPoderCompendio(p: PoderDb): PoderCompendio {
  return {
    id: p.id,
    publico: p.publico,
    oficial: p.oficial,
    nome: p.nome,
    ilustracaoUrl: p.ilustracaoUrl,
    tipoAcao: p.tipoAcao as PoderCompendio["tipoAcao"],
    custoEstamina: p.custoEstamina,
    duracao: p.duracao,
    efeito: p.efeito,
  };
}

export function poderCompendioParaDb(f: PoderCompendio) {
  return {
    publico: f.publico,
    oficial: f.oficial,
    nome: f.nome,
    ilustracaoUrl: f.ilustracaoUrl ?? null,
    tipoAcao: f.tipoAcao,
    custoEstamina: f.custoEstamina,
    duracao: f.duracao,
    efeito: f.efeito,
  };
}
