"use client";

import { useState } from "react";
import { ATRIBUTOS, dadoDoAtributo, rolarFormula, rolarTeste, type Atributo } from "@/lib/regras";
import { RodaAtributos } from "@/components/ui/RodaAtributos";
import { dispararRolagem } from "@/lib/toastRolagens";

const FICHA_DEMO = { forca: 3, destreza: 4, vigor: 2, inteligencia: 5, carisma: 2, aparencia: 3 };

const ESPECIALIDADES_DEMO: { nome: string; atributo: Atributo; nivel: "livre" | "treinado" | "mestre" }[] = [
  { nome: "Atletismo", atributo: "forca", nivel: "treinado" },
  { nome: "Furtividade", atributo: "destreza", nivel: "livre" },
  { nome: "Percepção", atributo: "inteligencia", nivel: "mestre" },
  { nome: "Diplomacia", atributo: "carisma", nivel: "treinado" },
  { nome: "Intimidação", atributo: "aparencia", nivel: "livre" },
];

const NIVEL_LABEL: Record<string, string> = { livre: "Livre", treinado: "Treinada", mestre: "Mestre" };

export function SecaoRolagens() {
  const [formula, setFormula] = useState("2d6+3");

  function rolarEspecialidade(nome: string, atributo: Atributo, nivel: "livre" | "treinado" | "mestre") {
    const valor = FICHA_DEMO[atributo];
    const resultado = rolarTeste(valor, nivel === "livre" ? "nenhum" : nivel);
    dispararRolagem(nome, `${ATRIBUTOS.find((a) => a.chave === atributo)!.nome} ${valor} · ${NIVEL_LABEL[nivel]}`, resultado);
  }

  function rolarAtributo(atributo: Atributo, nome: string) {
    const resultado = rolarTeste(FICHA_DEMO[atributo], "nenhum");
    dispararRolagem(nome, `Teste de ${nome}`, resultado);
  }

  function rolarLivre() {
    const resultado = rolarFormula(formula);
    if (!resultado) return;
    dispararRolagem("Rolagem livre", formula, resultado);
  }

  return (
    <section id="rolagens" className="border-t border-[var(--border-sutil)] py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-2xl">
            <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">01 · Rolagens</p>
            <h2 className="mt-2 font-titulo text-2xl uppercase tracking-wide text-pergaminho md:text-3xl">
              Um clique. A regra certa. Sem consultar tabela.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
              Clique no dado de qualquer especialidade: a plataforma sobe a categoria do dado por
              Treinada/Mestre e dispara a Regra do Mito quando o atributo é 5. O resultado aparece
              num toast no canto — nada bloqueia a tela.
            </p>
          </div>

          <div className="w-full max-w-xs shrink-0 rounded-sm border border-[var(--border-sutil)] bg-[var(--surface)]/60 p-4">
            <p className="font-gravado text-[10px] uppercase tracking-[0.16em] text-foreground/50">
              Rolagem livre
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-0 flex-1 rounded-sm border border-[var(--border-sutil)] bg-background px-3 py-2 font-gravado text-sm outline-none focus:border-ouro"
              />
              <button
                onClick={rolarLivre}
                className="shrink-0 rounded-sm bg-ouro px-4 font-titulo text-xs font-bold uppercase tracking-wide text-tinta hover:bg-ouro-claro"
              >
                Rolar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-sm border border-[var(--border-sutil)]">
            <div className="flex items-center justify-between border-b border-[var(--border-sutil)] px-5 py-3.5">
              <span className="font-titulo text-sm uppercase tracking-wide text-pergaminho">
                Especialidades · Demo
              </span>
              <span className="font-gravado text-[10px] uppercase tracking-wide text-foreground/50">
                1d20 + dado de atributo
              </span>
            </div>
            <ul>
              {ESPECIALIDADES_DEMO.map((e) => (
                <li
                  key={e.nome}
                  className="flex items-center justify-between gap-4 border-b border-[var(--border-sutil)]/50 px-5 py-3.5 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium">{e.nome}</p>
                    <p className="mt-0.5 text-xs text-foreground/55">
                      {ATRIBUTOS.find((a) => a.chave === e.atributo)!.nome} {FICHA_DEMO[e.atributo]} · {NIVEL_LABEL[e.nivel]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-gravado text-xs text-foreground/60">
                      1d20 + 1d{dadoDoAtributo(FICHA_DEMO[e.atributo])}
                    </span>
                    <button
                      onClick={() => rolarEspecialidade(e.nome, e.atributo, e.nivel)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-ouro text-ouro hover:bg-ouro-claro/15"
                      aria-label={`Rolar ${e.nome}`}
                    >
                      <span className="h-2.5 w-2.5 rotate-45 border border-current" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-sm border border-[var(--border-sutil)] p-6">
            <p className="mb-4 font-titulo text-sm uppercase tracking-wide text-pergaminho">Roda de Atributos</p>
            <div className="flex justify-center">
              <RodaAtributos ficha={FICHA_DEMO} onRolar={rolarAtributo} tamanho={220} />
            </div>
            <p className="mt-5 text-xs leading-relaxed text-foreground/65">
              Valor 1–5 define a categoria: D4 → D6 → D8 → D10 → D12. Treinada sobe uma categoria.
              Mestre, duas. <span className="text-ouro">Regra do Mito:</span> atributo 5 com
              especialidade aplicável rola 2d20 e mantém o melhor.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-4 rounded-sm border border-[var(--border-sutil)] bg-[var(--surface)]/60 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ouro text-ouro">
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
          </span>
          <div>
            <p className="font-titulo text-sm uppercase tracking-wide text-pergaminho">
              Onboarding que explica a regra na hora
            </p>
            <p className="mt-1.5 text-sm text-foreground/70">
              Cada campo da criação de personagem tem um &ldquo;O que isso significa?&rdquo; — o
              novato entende a mecânica sem parar a sessão para perguntar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
