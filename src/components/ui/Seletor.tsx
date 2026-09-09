"use client";

import { useEffect, useRef, useState } from "react";

export interface OpcaoSeletor {
  valor: string;
  rotulo: string;
}

/**
 * Dropdown estilizado — substitui o <select> nativo em todo o app. Mesmo
 * comportamento (controlado, value/onChange por string), visual próprio:
 * painel flutuante com o mesmo verniz das colunas jônicas (ColunaFrame).
 */
export function Seletor({
  value,
  onChange,
  opcoes,
  placeholder = "Selecionar…",
  className = "",
}: {
  value: string;
  onChange: (valor: string) => void;
  opcoes: OpcaoSeletor[];
  placeholder?: string;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, []);

  const selecionada = opcoes.find((o) => o.valor === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-sm border bg-background/60 px-3 py-2.5 text-left text-sm outline-none transition ${
          aberto ? "border-ouro" : "border-[var(--border-sutil)] hover:border-ouro/60"
        }`}
      >
        <span className={selecionada ? "text-foreground" : "text-foreground/45"}>
          {selecionada?.rotulo ?? placeholder}
        </span>
        <svg
          viewBox="0 0 12 8"
          className={`h-2.5 w-3 shrink-0 fill-none stroke-current text-bronze transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M1 1.5L6 6.5L11 1.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute z-30 mt-1.5 max-h-64 w-full min-w-max overflow-y-auto rounded-sm border border-ouro/50 bg-[var(--surface)] shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6)]">
          {opcoes.map((o) => {
            const ativa = o.valor === value;
            return (
              <button
                key={o.valor}
                type="button"
                onClick={() => {
                  onChange(o.valor);
                  setAberto(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                  ativa ? "bg-ouro-claro/15 text-ouro" : "text-foreground/85 hover:bg-ouro-claro/10 hover:text-ouro-claro"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rotate-45 ${ativa ? "bg-ouro" : "bg-transparent"}`} />
                {o.rotulo}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Variante de múltipla escolha (checkboxes num painel flutuante) — substitui <select multiple>. */
export function SeletorMultiplo({
  value,
  onChange,
  opcoes,
  placeholder = "Selecionar…",
  className = "",
}: {
  value: string[];
  onChange: (valores: string[]) => void;
  opcoes: OpcaoSeletor[];
  placeholder?: string;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function alternar(valor: string) {
    onChange(value.includes(valor) ? value.filter((v) => v !== valor) : [...value, valor]);
  }

  const rotulo =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (opcoes.find((o) => o.valor === value[0])?.rotulo ?? placeholder)
        : `${value.length} selecionados`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-sm border bg-background/60 px-3 py-2.5 text-left text-sm outline-none transition ${
          aberto ? "border-ouro" : "border-[var(--border-sutil)] hover:border-ouro/60"
        }`}
      >
        <span className={value.length ? "text-foreground" : "text-foreground/45"}>{rotulo}</span>
        <svg
          viewBox="0 0 12 8"
          className={`h-2.5 w-3 shrink-0 fill-none stroke-current text-bronze transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M1 1.5L6 6.5L11 1.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute z-30 mt-1.5 max-h-64 w-full min-w-max overflow-y-auto rounded-sm border border-ouro/50 bg-[var(--surface)] shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6)]">
          {opcoes.map((o) => {
            const ativa = value.includes(o.valor);
            return (
              <button
                key={o.valor}
                type="button"
                onClick={() => alternar(o.valor)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                  ativa ? "bg-ouro-claro/15 text-ouro" : "text-foreground/85 hover:bg-ouro-claro/10 hover:text-ouro-claro"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border ${
                    ativa ? "border-ouro bg-ouro" : "border-[var(--border-sutil)]"
                  }`}
                >
                  {ativa && (
                    <svg viewBox="0 0 10 8" className="h-2 w-2.5 fill-none stroke-tinta" aria-hidden>
                      <path d="M1 4L4 7L9 1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {o.rotulo}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
