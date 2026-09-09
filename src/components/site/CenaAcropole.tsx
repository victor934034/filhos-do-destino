/** Ilustração de fundo: acrópole ao entardecer, moldura de colunas jônicas. */
export function CenaAcropole({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 420"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec8d9" />
          <stop offset="55%" stopColor="#f0c070" />
          <stop offset="100%" stopColor="#f6ecd9" />
        </linearGradient>
        <linearGradient id="colina" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b5502f" />
          <stop offset="100%" stopColor="#4a2e5c" />
        </linearGradient>
      </defs>

      <rect width="800" height="420" fill="url(#ceu)" />
      <circle cx="650" cy="120" r="46" fill="#f6ecd9" opacity="0.85" />

      {/* colina distante */}
      <path d="M0 300 Q200 240 400 280 T800 260 V420 H0 Z" fill="url(#colina)" opacity="0.35" />

      {/* acrópole */}
      <g opacity="0.55" fill="#241a10">
        <rect x="330" y="230" width="220" height="14" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={340 + i * 24} y="150" width="10" height="80" />
        ))}
        <path d="M330 150 L440 110 L550 150 Z" />
      </g>

      {/* colunas de moldura, esquerda e direita */}
      {[40, 730].map((x, i) => (
        <g key={i} fill="#e0973a">
          <rect x={x} y="40" width="26" height="340" opacity="0.9" />
          <rect x={x - 8} y="30" width="42" height="14" />
          <rect x={x - 10} y="372" width="46" height="16" />
          {Array.from({ length: 12 }).map((_, j) => (
            <rect key={j} x={x + 2} y={48 + j * 26} width="22" height="4" fill="#c9862f" opacity="0.5" />
          ))}
        </g>
      ))}
    </svg>
  );
}
