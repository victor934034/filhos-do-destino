"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/** Número que conta suavemente até o novo valor, com um brilho dourado (ganho) ou vermelho sutil (perda). */
export function ContadorDracmas({
  valor,
  className = "",
  tamanhoIcone = 26,
  semIcone = false,
}: {
  valor: number;
  className?: string;
  /** Tamanho do selo de Dracma exibido antes do número. */
  tamanhoIcone?: number;
  /** Omite o selo — útil quando o ícone já é exibido separadamente do lado de fora. */
  semIcone?: boolean;
}) {
  const [exibido, setExibido] = useState(valor);
  const [flash, setFlash] = useState<"ganho" | "perda" | null>(null);
  const anterior = useRef(valor);

  useEffect(() => {
    const de = anterior.current;
    const para = valor;
    anterior.current = para;
    if (de === para) return;

    setFlash(para > de ? "ganho" : "perda");
    const duracao = 650;
    const inicio = performance.now();
    let frame: number;

    function tick(agora: number) {
      const t = Math.min(1, (agora - inicio) / duracao);
      setExibido(Math.round(de + (para - de) * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    const limpar = setTimeout(() => setFlash(null), duracao + 500);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(limpar);
    };
  }, [valor]);

  return (
    <span className="inline-flex items-center gap-1.5">
      {!semIcone && (
        <span className="relative inline-block shrink-0" style={{ width: tamanhoIcone, height: tamanhoIcone }}>
          <Image src="/icons/selos/selo-dracma.png" alt="Dracmas" fill className="object-contain" />
        </span>
      )}
      <span
        className={`font-gravado transition-colors duration-300 ${
          flash === "ganho"
            ? "text-ouro-claro drop-shadow-[0_0_10px_rgba(224,151,58,0.65)]"
            : flash === "perda"
              ? "text-terracota"
              : "text-pergaminho"
        } ${className}`}
      >
        {exibido.toLocaleString("pt-BR")}
      </span>
    </span>
  );
}
