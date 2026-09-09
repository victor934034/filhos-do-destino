import type { RolagemResultado } from "@/lib/regras";

export interface RolagemToast {
  id: number;
  titulo: string;
  nota: string;
  resultado: RolagemResultado;
}

type Ouvinte = (toast: RolagemToast) => void;

const ouvintes = new Set<Ouvinte>();

/** Dispara um toast de resultado de rolagem para qualquer componente montado. */
export function dispararRolagem(titulo: string, nota: string, resultado: RolagemResultado) {
  const toast: RolagemToast = { id: Date.now() + Math.random(), titulo, nota, resultado };
  ouvintes.forEach((fn) => fn(toast));
}

export function ouvirRolagens(fn: Ouvinte): () => void {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}
