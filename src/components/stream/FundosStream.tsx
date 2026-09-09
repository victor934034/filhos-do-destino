import { CenaAcropole } from "@/components/site/CenaAcropole";

export const FUNDOS = [
  { id: "acropole", nome: "Acrópole ao entardecer" },
  { id: "lua-nova", nome: "Lua Nova à noite" },
  { id: "labirinto", nome: "O Labirinto" },
  { id: "olimpo", nome: "Olimpo" },
] as const;

export function FundoStream({ fundoId, className = "" }: { fundoId: string; className?: string }) {
  if (fundoId === "acropole") {
    return <CenaAcropole className={className} />;
  }

  const estilos: Record<string, string> = {
    "lua-nova": "linear-gradient(180deg,#0d1b2a 0%,#1b1a17 55%,#241f17 100%)",
    labirinto: "linear-gradient(180deg,#3a2f22 0%,#1b1a17 100%)",
    olimpo: "linear-gradient(180deg,#dff1f5 0%,#7ec8d9 55%,#f3ecdd 100%)",
  };

  return (
    <div
      className={className}
      style={{ background: estilos[fundoId] ?? estilos["lua-nova"] }}
    >
      {fundoId === "lua-nova" && (
        <svg viewBox="0 0 800 420" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <circle cx="660" cy="90" r="38" fill="#f3ecdd" opacity="0.9" />
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={(i * 137) % 800} cy={(i * 71) % 260} r={1 + (i % 3)} fill="#e8c874" opacity="0.6" />
          ))}
        </svg>
      )}
    </div>
  );
}
