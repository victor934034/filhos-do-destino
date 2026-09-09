import type { ReactElement } from "react";
import Image from "next/image";
import type { Atributo } from "@/lib/regras";

const ICONES: Record<string, ReactElement> = {
  // Força — punho cerrado
  punho: (
    <path
      d="M9 13.5V9.2c0-.7.55-1.2 1.2-1.2s1.2.5 1.2 1.2v3.2M11.4 12.4V8.4c0-.7.55-1.2 1.2-1.2s1.2.5 1.2 1.2v4M13.8 12.6V9c0-.7.55-1.2 1.2-1.2s1.2.5 1.2 1.2v3.8M16.2 13v-2c0-.65.5-1.1 1.1-1.1s1.1.45 1.1 1.1v3.3c0 2.7-1.9 4.9-4.6 4.9h-1.7c-1.6 0-2.5-.5-3.4-1.6l-2.7-3.3c-.4-.5-.3-1.3.3-1.7.5-.3 1.2-.2 1.6.3l1.5 1.7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  // Destreza — pena estilizada
  pena: (
    <path
      d="M18 6c-4.5 0-9 3.2-9 9.5 0 1 .1 1.8.3 2.5M18 6c-1 3-2.7 5-4.6 6.4M18 6c-2.6 1-5.7 3-7.2 6M9.3 18l2-2M6 21l3.3-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  // Vigor — escudo (ainda sem selo definitivo — pendente de regeração, ver manifesto de ícones)
  escudo: (
    <path
      d="M12 5l5.5 2v4.3c0 4-2.4 6.8-5.5 7.9-3.1-1.1-5.5-3.9-5.5-7.9V7L12 5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  ),
  // Inteligência — coruja
  coruja: (
    <path
      d="M12 6c-3.2 0-5.2 2.3-5.2 5.6 0 2.6 1.2 4.6 2.9 5.7l-.6 1.4 2-1c.9.3 1.9.3 2.8 0l2 1-.6-1.4c1.7-1.1 2.9-3.1 2.9-5.7C17.2 8.3 15.2 6 12 6zM9.5 11.2a1 1 0 100-2 1 1 0 000 2zM14.5 11.2a1 1 0 100-2 1 1 0 000 2zM11 13.4l1 1 1-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  // Carisma — lira
  lira: (
    <path
      d="M9 19V9.5c-1.8-.3-3-1.8-3-3.8M15 19V9.5c1.8-.3 3-1.8 3-3.8M9 19h6M9 9.5C9 7 9.6 5 12 5s3 2 3 4.5M10.4 12.5v4M12 12v4.8M13.6 12.5v4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  // Aparência — espelho de mão com louro
  espelho: (
    <path
      d="M12 15.5a4.3 4.3 0 100-8.6 4.3 4.3 0 000 8.6zM12 15.5V20M9.7 20h4.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

// Selos ilustrados (fundo transparente, moldura já embutida na arte) — ver
// "Filhos do Destino — Manifesto de Ícones". Os 6 atributos têm selo dedicado agora.
const IMAGENS: Partial<Record<Atributo, string>> = {
  forca: "/icons/selos/selo-atributo-forca.png",
  destreza: "/icons/selos/selo-atributo-destreza.png",
  vigor: "/icons/selos/selo-atributo-vigor.png",
  inteligencia: "/icons/selos/selo-atributo-inteligencia.png",
  carisma: "/icons/selos/selo-atributo-carisma.png",
  aparencia: "/icons/selos/selo-atributo-aparencia.png",
};

export function SeloAtributo({
  atributo,
  icone,
  size = 64,
  className = "",
}: {
  /** Atributo do personagem (forca/destreza/...) — usa o selo ilustrado quando existir. */
  atributo?: Atributo;
  /** Chave do SVG de linha legado — usado como respaldo quando não há selo ilustrado ainda. */
  icone?: string;
  size?: number;
  className?: string;
}) {
  const imagem = atributo ? IMAGENS[atributo] : undefined;

  if (imagem) {
    return (
      <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
        <Image src={imagem} alt={atributo ?? ""} fill className="object-contain" />
      </span>
    );
  }

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ouro bg-gradient-to-b from-ouro-claro/25 to-transparent text-bronze ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58}>
        {ICONES[icone ?? ""] ?? ICONES.punho}
      </svg>
      <span className="absolute inset-0 rounded-full border border-ouro-claro/40" style={{ margin: 2 }} />
    </span>
  );
}
