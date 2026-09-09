import type { Personagem as PersonagemDb } from "@prisma/client";
import type { FichaPersonagem } from "@/lib/tipos";

export function paraFicha(p: PersonagemDb): FichaPersonagem {
  return {
    id: p.id,
    nome: p.nome,
    historia: p.historia,
    ilustracaoUrl: p.ilustracaoUrl,
    ilustracaoCompletaUrl: p.ilustracaoCompletaUrl,
    parenteDivino: p.parenteDivino,
    armamento: p.armamento as FichaPersonagem["armamento"],
    forca: p.forca,
    destreza: p.destreza,
    vigor: p.vigor,
    inteligencia: p.inteligencia,
    carisma: p.carisma,
    aparencia: p.aparencia,
    vidaAtual: p.vidaAtual,
    vidaMax: p.vidaMax,
    estaminaAtual: p.estaminaAtual,
    estaminaMax: p.estaminaMax,
    aspis: p.aspis,
    nivel: p.nivel,
    deslocamento: p.deslocamento,
    especialidades: JSON.parse(p.especialidades),
    estilosCombate: JSON.parse(p.estilosCombate),
    poderes: JSON.parse(p.poderes),
    itens: JSON.parse(p.itens),
    bloqueadoParaJogadores: p.bloqueadoParaJogadores,
    permiteControleMestre: p.permiteControleMestre,
    dracmas: p.dracmas,
  };
}

/** Versão enxuta da ficha — nome e ilustração — para quem não tem permissão de ver o resto. */
export function paraFichaLimitada(p: Pick<PersonagemDb, "id" | "nome" | "ilustracaoUrl">) {
  return { id: p.id, nome: p.nome, ilustracaoUrl: p.ilustracaoUrl, bloqueado: true as const };
}

export function paraDb(f: FichaPersonagem) {
  return {
    nome: f.nome,
    historia: f.historia,
    ilustracaoUrl: f.ilustracaoUrl ?? null,
    ilustracaoCompletaUrl: f.ilustracaoCompletaUrl ?? null,
    parenteDivino: f.parenteDivino,
    armamento: f.armamento,
    forca: f.forca,
    destreza: f.destreza,
    vigor: f.vigor,
    inteligencia: f.inteligencia,
    carisma: f.carisma,
    aparencia: f.aparencia,
    vidaAtual: f.vidaAtual,
    vidaMax: f.vidaMax,
    estaminaAtual: f.estaminaAtual,
    estaminaMax: f.estaminaMax,
    aspis: f.aspis,
    nivel: f.nivel,
    deslocamento: f.deslocamento,
    especialidades: JSON.stringify(f.especialidades),
    estilosCombate: JSON.stringify(f.estilosCombate),
    poderes: JSON.stringify(f.poderes),
    itens: JSON.stringify(f.itens),
    bloqueadoParaJogadores: f.bloqueadoParaJogadores ?? false,
    permiteControleMestre: f.permiteControleMestre ?? false,
  };
}
