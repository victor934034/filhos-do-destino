import type { ItemCompendio as ItemDb } from "@prisma/client";
import type { ItemCompendio } from "@/lib/tipos";

export function paraItemCompendio(i: ItemDb): ItemCompendio {
  return {
    id: i.id,
    publico: i.publico,
    oficial: i.oficial,
    nome: i.nome,
    ilustracaoUrl: i.ilustracaoUrl,
    tipo: i.tipo as ItemCompendio["tipo"],
    dadoDeDano: i.dadoDeDano,
    multiplicadorCritico: i.multiplicadorCritico,
    efeito: i.efeito,
    textoLore: i.textoLore,
    preco: i.preco,
  };
}

export function itemCompendioParaDb(f: ItemCompendio) {
  return {
    publico: f.publico,
    oficial: f.oficial,
    nome: f.nome,
    ilustracaoUrl: f.ilustracaoUrl ?? null,
    tipo: f.tipo,
    dadoDeDano: f.dadoDeDano ?? null,
    multiplicadorCritico: f.multiplicadorCritico,
    efeito: f.efeito,
    textoLore: f.textoLore,
    preco: f.preco,
  };
}
