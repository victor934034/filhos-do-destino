import type { Campanha as CampanhaDb, CampanhaJogador, Missao, Usuario, Personagem } from "@prisma/client";
import { regrasDaCasaPadrao, type Campanha, type RegrasDaCasa } from "@/lib/tipos";

type CampanhaCompleta = CampanhaDb & {
  oraculo: Usuario;
  jogadores: (CampanhaJogador & { usuario: Usuario; personagem: Personagem | null })[];
  missoes: Missao[];
};

export function paraCampanha(c: CampanhaCompleta): Campanha {
  let regras: RegrasDaCasa;
  try {
    regras = { ...regrasDaCasaPadrao(), ...JSON.parse(c.regrasDaCasa) };
  } catch {
    regras = regrasDaCasaPadrao();
  }

  return {
    id: c.id,
    oraculoId: c.oraculoId,
    oraculoNome: c.oraculo.nome,
    nome: c.nome,
    sinopse: c.sinopse,
    capaUrl: c.capaUrl,
    visibilidade: c.visibilidade as Campanha["visibilidade"],
    vagasMaximas: c.vagasMaximas,
    tom: c.tom,
    regrasDaCasa: regras,
    oficial: c.oficial,
    origemMcp: c.origemMcp,
    ocultarSemideusesParaJogadores: c.ocultarSemideusesParaJogadores,
    criadoEm: c.criadoEm.toISOString(),
    jogadores: c.jogadores.map((j) => ({
      id: j.id,
      usuarioId: j.usuarioId,
      usuarioNome: j.usuario.nome,
      personagemId: j.personagemId,
      personagemNome: j.personagem?.nome ?? null,
      personagemDracmas: j.personagem?.dracmas ?? null,
      status: j.status as "pendente" | "aprovado" | "recusado",
    })),
    missoes: c.missoes.map((m) => ({
      id: m.id,
      titulo: m.titulo,
      descricao: m.descricao,
      status: m.status as "aberta" | "concluida",
    })),
  };
}

export const INCLUDE_CAMPANHA_COMPLETA = {
  oraculo: true,
  jogadores: { include: { usuario: true, personagem: true } },
  missoes: true,
} as const;
