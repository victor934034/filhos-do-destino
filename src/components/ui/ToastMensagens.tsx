"use client";

import { useEffect, useState } from "react";
import { ouvirMensagens, type MensagemToast } from "@/lib/toastMensagens";

const DURACAO_MS = 5000;
const MAX_VISIVEIS = 3;

/** Pilha de toasts de erro/sucesso no canto inferior esquerdo (não colide com os de rolagem, à direita). */
export function ToastMensagens() {
  const [toasts, setToasts] = useState<MensagemToast[]>([]);

  useEffect(() => {
    return ouvirMensagens((toast) => {
      setToasts((atual) => [...atual, toast].slice(-MAX_VISIVEIS));
      setTimeout(() => {
        setToasts((atual) => atual.filter((t) => t.id !== toast.id));
      }, DURACAO_MS);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-50 flex w-[19rem] flex-col gap-2.5">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-sm border p-3 text-sm shadow-[0_10px_28px_rgba(20,44,44,0.45)] animate-[toastMsgEntra_0.25s_ease-out] ${
            toast.tipo === "erro"
              ? "border-terracota bg-terracota/15 text-pergaminho"
              : "border-egeu bg-egeu/15 text-pergaminho"
          }`}
        >
          {toast.texto}
        </div>
      ))}
      <style jsx global>{`
        @keyframes toastMsgEntra {
          from {
            opacity: 0;
            transform: translateX(-16px);
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
