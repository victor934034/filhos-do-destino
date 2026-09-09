"use client";

import { useEffect, useState } from "react";
import { ouvirRolagens, type RolagemToast } from "@/lib/toastRolagens";

const DURACAO_MS = 5000;
const MAX_VISIVEIS = 3;

/**
 * Pilha de toasts no canto inferior direito, no estilo "card de revelação":
 * pergaminho, selo de total em forma de escudo e detalhe dos dados.
 * Montado uma vez no layout raiz — qualquer tela dispara via dispararRolagem().
 */
export function ToastRolagens() {
  const [toasts, setToasts] = useState<RolagemToast[]>([]);

  useEffect(() => {
    return ouvirRolagens((toast) => {
      setToasts((atual) => [...atual, toast].slice(-MAX_VISIVEIS));
      setTimeout(() => {
        setToasts((atual) => atual.filter((t) => t.id !== toast.id));
      }, DURACAO_MS);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[22rem] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-sm border bg-pergaminho p-4 text-tinta shadow-[0_10px_28px_rgba(20,44,44,0.45)] animate-[toastEntra_0.25s_ease-out] ${
            toast.resultado.critico ? "border-ouro shadow-[0_0_24px_-4px_rgba(224,151,58,0.7)]" : "border-ouro/60"
          }`}
        >
          <p className="truncate font-titulo text-xs uppercase tracking-wide text-tinta">
            {toast.titulo} {toast.resultado.critico && <span className="text-terracota">· CRÍTICO</span>}
          </p>
          <div className="mt-1 flex items-end gap-4">
            <span
              className={`font-titulo text-5xl font-bold leading-none ${
                toast.resultado.critico ? "text-terracota animate-pulse" : "text-noite"
              }`}
            >
              {toast.resultado.total}
            </span>
            <div className="min-w-0 pb-1">
              <p className="truncate text-sm leading-snug text-tinta/70">{toast.resultado.detalhe}</p>
              <p className="mt-1 font-gravado text-[11px] uppercase tracking-[0.1em] text-bronze">
                {toast.resultado.usouMito ? "Regra do Mito · 2d20" : toast.nota}
              </p>
            </div>
          </div>
        </div>
      ))}
      <style jsx global>{`
        @keyframes toastEntra {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
