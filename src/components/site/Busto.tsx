interface BustoProps {
  corPele?: string;
  corCabelo?: string;
  corRoupa?: string;
  corFundoA?: string;
  corFundoB?: string;
  estilo?: "longo" | "curto" | "coque" | "cacheado";
  detalhe?: "nenhum" | "coroa-louro" | "oculos" | "capuz";
}

/**
 * Busto ilustrado em estilo "webcomic" flat — usado como retrato de personagem
 * nas molduras de câmera/ficha até termos ilustrações encomendadas.
 */
export function Busto({
  corPele = "#e0ab7a",
  corCabelo = "#3b2a1e",
  corRoupa = "#2f5d74",
  corFundoA = "#7ec8d9",
  corFundoB = "#2f5d74",
  estilo = "curto",
  detalhe = "nenhum",
}: BustoProps) {
  const uid = `${corFundoA}${corFundoB}`.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={corFundoA} />
          <stop offset="100%" stopColor={corFundoB} />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#bg-${uid})`} />

      {/* ombros / torso */}
      <path d="M14 100c1-20 15-32 36-32s35 12 36 32z" fill={corRoupa} />
      <path d="M14 100c1-20 15-32 36-32s35 12 36 32z" fill="black" opacity="0.08" />

      {/* pescoço */}
      <rect x="42" y="55" width="16" height="16" fill={corPele} />

      {/* cabelo (parte de trás) */}
      {estilo === "longo" && (
        <path d="M22 45c-3 20 0 34 4 40h48c4-6 7-20 4-40-4-16-56-16-56 0z" fill={corCabelo} />
      )}
      {estilo === "coque" && <circle cx="50" cy="16" r="8" fill={corCabelo} />}

      {/* cabeça */}
      <circle cx="50" cy="42" r="22" fill={corPele} />

      {/* cabelo (franja / topo) */}
      {estilo === "curto" && (
        <path d="M27 38c-2-16 10-26 23-26s25 10 23 26c-3-4-8-3-8-9-4 4-10 3-13-1-3 4-9 5-13 1 0 6-6 5-12 9z" fill={corCabelo} />
      )}
      {estilo === "longo" && (
        <path d="M27 36c-2-15 9-24 23-24s25 9 23 24c-4-5-9-2-10-8-4 4-9 3-13-1-4 4-9 5-13 1-1 6-6 3-10 8z" fill={corCabelo} />
      )}
      {estilo === "coque" && (
        <path d="M28 36c-3-15 9-25 22-25s25 10 22 25c-4-5-8-2-9-8-4 4-9 3-13-1-4 4-9 5-13 1-1 6-6 3-9 8z" fill={corCabelo} />
      )}
      {estilo === "cacheado" && (
        <g fill={corCabelo}>
          <path d="M26 38c-3-16 9-27 24-27s27 11 24 27c-3-3-6-1-7-6-3 4-2-3-6-4-2 5-6 2-8-1-2 4-6 5-9 2-1 5-5 3-7-1-2 4-3 6-11 10z" />
          <circle cx="24" cy="34" r="5" />
          <circle cx="76" cy="34" r="5" />
        </g>
      )}

      {/* rosto simples */}
      <g stroke="#241f17" strokeWidth="1.6" strokeLinecap="round">
        <path d="M40 44c1.5-1.5 4-1.5 5 0" fill="none" />
        <path d="M55 44c1.5-1.5 4-1.5 5 0" fill="none" />
        <path d="M46 52c2 1.6 6 1.6 8 0" fill="none" />
      </g>

      {detalhe === "coroa-louro" && (
        <path
          d="M30 30c8-8 32-8 40 0"
          fill="none"
          stroke="#c9a24b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {detalhe === "oculos" && (
        <g stroke="#241f17" strokeWidth="1.6" fill="none">
          <circle cx="42" cy="43" r="6" />
          <circle cx="58" cy="43" r="6" />
          <path d="M48 43h4" />
        </g>
      )}
      {detalhe === "capuz" && (
        <path
          d="M24 40c0-18 12-30 26-30s26 12 26 30c-6-10-14-6-26-6s-20-4-26 6z"
          fill={corRoupa}
          opacity="0.92"
        />
      )}
    </svg>
  );
}
