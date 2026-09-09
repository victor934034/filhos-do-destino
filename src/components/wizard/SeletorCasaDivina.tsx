"use client";

import { useState } from "react";
import Image from "next/image";
import { ATRIBUTOS, CASAS_DIVINAS } from "@/lib/regras";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { SeloDeus } from "@/components/ui/SeloDeus";

function nomeAtributo(chave: string) {
  return ATRIBUTOS.find((a) => a.chave === chave)?.nome ?? chave;
}

/**
 * Galeria de casas divinas em vez de um dropdown simples — clicar abre um
 * painel de detalhe (domínio, foco, tema, sugestões) com setas pra navegar
 * entre os deuses sem fechar e reabrir. "Selecionar" é uma ação separada de
 * só visualizar, então dá pra passear olhando vários antes de decidir.
 */
export function SeletorCasaDivina({ value, onChange }: { value: string; onChange: (nome: string) => void }) {
  const [detalheAberto, setDetalheAberto] = useState<number | null>(null);

  const indiceAtual = detalheAberto ?? 0;
  const casa = CASAS_DIVINAS[indiceAtual];

  function abrirDetalhe(nome: string) {
    setDetalheAberto(CASAS_DIVINAS.findIndex((c) => c.nome === nome));
  }

  function navegar(delta: number) {
    setDetalheAberto((i) => {
      const atual = i ?? 0;
      return (atual + delta + CASAS_DIVINAS.length) % CASAS_DIVINAS.length;
    });
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {CASAS_DIVINAS.map((c) => {
          const ativa = c.nome === value;
          return (
            <button
              key={c.nome}
              type="button"
              onClick={() => abrirDetalhe(c.nome)}
              className={`flex flex-col items-center gap-1.5 rounded-sm border p-3 transition ${
                ativa
                  ? "border-ouro bg-ouro-claro/15"
                  : "border-[var(--border-sutil)] hover:border-ouro/50 hover:bg-ouro-claro/5"
              }`}
            >
              <SeloDeus nome={c.nome} fallbackUrl={c.ilustracaoCompletaUrl} size={60} />
              <span className={`font-titulo text-xs uppercase tracking-wide ${ativa ? "text-ouro" : "text-foreground/80"}`}>
                {c.nome}
              </span>
            </button>
          );
        })}
      </div>

      {detalheAberto !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <ColunaFrame className="w-full max-w-md overflow-hidden">
            <div className="relative h-64 w-full bg-noite-alta sm:h-80">
              <Image
                src={casa.ilustracaoCompletaUrl}
                alt={casa.nome}
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
              <button
                onClick={() => setDetalheAberto(null)}
                aria-label="Fechar"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-pergaminho hover:bg-black/70"
              >
                ✕
              </button>
            </div>

            <div className="p-6 pt-0">
              <p className="-mt-2 font-titulo text-2xl text-pergaminho">{casa.nome}</p>
              <p className="font-gravado text-[11px] uppercase tracking-widest text-egeu">{casa.dominio}</p>

              <p className="mt-4 text-sm leading-relaxed text-foreground/80">{casa.tema}</p>

            <div className="mt-4 rounded-sm border border-[var(--border-sutil)] bg-background/40 p-3">
              <p className="font-titulo text-[11px] uppercase tracking-wide text-bronze">
                Atributo Foco: {nomeAtributo(casa.foco)}
              </p>
              <p className="mt-1 text-xs text-foreground/60">Combina bem com: {casa.sugestoes.join(", ")}</p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => navegar(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-sutil)] hover:border-ouro"
                  aria-label="Deus anterior"
                >
                  ‹
                </button>
                <button
                  onClick={() => navegar(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-sutil)] hover:border-ouro"
                  aria-label="Próximo deus"
                >
                  ›
                </button>
              </div>
              <Botao
                onClick={() => {
                  onChange(casa.nome);
                  setDetalheAberto(null);
                }}
              >
                Selecionar este deus
              </Botao>
              </div>
            </div>
          </ColunaFrame>
        </div>
      )}
    </div>
  );
}
