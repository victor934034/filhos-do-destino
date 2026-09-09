import type { SessaoAoVivo as SessaoDb, EventoSessao as EventoDb } from "@prisma/client";
import type { SessaoAoVivo } from "@/lib/tipos";

export function paraSessao(s: SessaoDb & { eventos: EventoDb[] }): SessaoAoVivo {
  return {
    id: s.id,
    campanhaId: s.campanhaId,
    ordemIniciativa: JSON.parse(s.ordemIniciativa),
    turnoAtual: s.turnoAtual,
    ativa: s.ativa,
    eventos: s.eventos
      .slice()
      .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime())
      .map((e) => ({
        id: e.id,
        tipo: e.tipo as SessaoAoVivo["eventos"][number]["tipo"],
        autorNome: e.autorNome,
        conteudo: e.conteudo,
        criadoEm: e.criadoEm.toISOString(),
      })),
  };
}
