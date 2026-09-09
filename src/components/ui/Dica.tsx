"use client";

import { ReactNode, useState } from "react";

/**
 * Tooltip temático: "O que isso significa?" — usado em toda ficha/wizard
 * para nunca deixar um número de regra sem explicação acessível.
 */
export function Dica({ texto, children }: { texto: string; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
    >
      <button
        type="button"
        className="cursor-help"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
      >
        {children}
      </button>
      {aberto && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-sm border border-ouro/60 bg-noite px-3 py-2 text-xs leading-relaxed text-pergaminho shadow-lg"
        >
          {texto}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-noite" />
        </span>
      )}
    </span>
  );
}
