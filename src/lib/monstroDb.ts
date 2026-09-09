import type { Monstro as MonstroDb } from "@prisma/client";
import type { FichaMonstro } from "@/lib/tipos";

export function paraMonstro(m: MonstroDb): FichaMonstro {
  return {
    id: m.id,
    publico: m.publico,
    oficial: m.oficial,
    nome: m.nome,
    ilustracaoUrl: m.ilustracaoUrl,
    vida: m.vida,
    aspis: m.aspis,
    forca: m.forca,
    destreza: m.destreza,
    vigor: m.vigor,
    inteligencia: m.inteligencia,
    carisma: m.carisma,
    aparencia: m.aparencia,
    atributoAtaque: m.atributoAtaque as FichaMonstro["atributoAtaque"],
    habilidadesAtivas: JSON.parse(m.habilidadesAtivas),
    habilidadesPassivas: JSON.parse(m.habilidadesPassivas),
  };
}

export function monstroParaDb(f: FichaMonstro) {
  return {
    publico: f.publico,
    oficial: f.oficial,
    nome: f.nome,
    ilustracaoUrl: f.ilustracaoUrl ?? null,
    vida: f.vida,
    aspis: f.aspis,
    forca: f.forca,
    destreza: f.destreza,
    vigor: f.vigor,
    inteligencia: f.inteligencia,
    carisma: f.carisma,
    aparencia: f.aparencia,
    atributoAtaque: f.atributoAtaque,
    habilidadesAtivas: JSON.stringify(f.habilidadesAtivas),
    habilidadesPassivas: JSON.stringify(f.habilidadesPassivas),
  };
}
