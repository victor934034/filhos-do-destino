"use client";

import { motion } from "framer-motion";

const CORES: Record<string, { alta: string; media: string; baixa: string }> = {
  vida: { alta: "#7a8f4f", media: "#e0973a", baixa: "#b5502f" },
  estamina: { alta: "#2f5d74", media: "#7ec8d9", baixa: "#c9862f" },
  aspis: { alta: "#4a2e5c", media: "#c9862f", baixa: "#c9862f" },
};

export function BarraEssencia({
  label,
  atual,
  maximo,
  tipo,
}: {
  label: string;
  atual: number;
  maximo: number;
  tipo: "vida" | "estamina" | "aspis";
}) {
  const pct = maximo > 0 ? Math.max(0, Math.min(100, (atual / maximo) * 100)) : 0;
  const cores = CORES[tipo];
  const cor = pct > 55 ? cores.alta : pct > 25 ? cores.media : cores.baixa;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-titulo text-[11px] uppercase tracking-[0.16em] text-bronze">
          {label}
        </span>
        <span className="font-gravado text-xs text-foreground/80">
          {atual}/{maximo}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full border border-[var(--border-sutil)] bg-black/10">
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${pct}%`, backgroundColor: cor }}
          transition={{ width: { duration: 0.6, ease: "easeOut" }, backgroundColor: { duration: 0.4 } }}
        />
      </div>
    </div>
  );
}
