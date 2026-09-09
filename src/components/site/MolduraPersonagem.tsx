import type { ReactNode } from "react";

/**
 * Moldura de madeira/ouro com cantos de louro + faixa de pergaminho com o nome —
 * réplica do enquadramento visto na live de referência (câmera do jogador + arte do personagem).
 */
export function MolduraPersonagem({
  nome,
  classe,
  children,
  tamanho = 128,
  className = "",
}: {
  nome: string;
  classe?: string;
  children: ReactNode;
  tamanho?: number;
  className?: string;
}) {
  return (
    <div className={`relative flex flex-col items-center ${className}`} style={{ width: tamanho }}>
      <div
        className="relative overflow-visible rounded-[6px] p-[5px]"
        style={{
          width: tamanho,
          height: tamanho,
          background: "linear-gradient(155deg,#f0c070 0%,#e0973a 55%,#8a5a1f 100%)",
          boxShadow: "0 10px 22px -10px rgba(20,44,44,0.65), inset 0 0 0 1px rgba(0,0,0,0.25)",
        }}
      >
        <div className="h-full w-full overflow-hidden rounded-[3px] bg-[#f6ecd9]">{children}</div>

        {/* louros nos quatro cantos */}
        <RamoLouro className="absolute -left-2 -top-2 h-6 w-6 -scale-x-100 text-ouro-claro" />
        <RamoLouro className="absolute -right-2 -top-2 h-6 w-6 text-ouro-claro" />
        <RamoLouro className="absolute -left-2 -bottom-2 h-6 w-6 -scale-x-100 -scale-y-100 text-ouro-claro" />
        <RamoLouro className="absolute -right-2 -bottom-2 h-6 w-6 -scale-y-100 text-ouro-claro" />
      </div>

      {/* faixa de pergaminho com o nome */}
      <svg
        viewBox="0 0 140 34"
        className="-mt-2 w-[92%] drop-shadow-[0_4px_6px_rgba(20,44,44,0.35)]"
        aria-hidden
      >
        <path
          d="M4 6 L14 2 H126 L136 6 V22 L126 28 H14 L4 22 Z"
          fill="#f6ecd9"
          stroke="#c9862f"
          strokeWidth="1.4"
        />
        <path d="M4 6 L14 10 V18 L4 22 Z" fill="#e9dcb9" opacity="0.7" />
        <path d="M136 6 L126 10 V18 L136 22 Z" fill="#e9dcb9" opacity="0.7" />
      </svg>
      <span className="-mt-[26px] px-3 text-center font-titulo text-[11px] uppercase leading-none tracking-[0.08em] text-tinta">
        {nome}
      </span>
      {classe && (
        <span className="mt-[2px] text-center text-[9px] uppercase tracking-[0.14em] text-bronze/80">
          {classe}
        </span>
      )}
    </div>
  );
}

function RamoLouro({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M2 22c4-1 7-3 9-6M3.5 17c2.2 0 4-.8 5-2.3M3 13c1.8.3 3.4-.3 4.3-1.6M3 9.2c1.5.6 3 .4 4-.7M4 5.5c1.2.9 2.7 1 3.8.2"
        stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="3" cy="21.2" r="1.1" />
      <circle cx="5.5" cy="17.6" r="1" />
      <circle cx="5.6" cy="13.2" r="1" />
      <circle cx="5.4" cy="9.1" r="0.9" />
      <circle cx="6" cy="5.4" r="0.9" />
    </svg>
  );
}
