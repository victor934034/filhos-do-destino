import Image from "next/image";

// Selos ilustrados por divindade (fundo transparente, moldura embutida na arte) —
// ver "Filhos do Destino — Manifesto de Ícones". Chave = nome da casa divina em minúsculo.
// Só os 10 primeiros deuses têm selo circular dedicado; os demais caem no retrato de
// corpo/busto (ilustracaoCompletaUrl) recortado em círculo via object-cover.
const IMAGENS: Record<string, string> = {
  zeus: "/icons/selos/selo-deus-zeus.png",
  apolo: "/icons/selos/selo-deus-apolo.png",
  hermes: "/icons/selos/selo-deus-hermes.png",
  atena: "/icons/selos/selo-deus-atena.png",
  afrodite: "/icons/selos/selo-deus-afrodite.png",
  ares: "/icons/selos/selo-deus-ares.png",
  demeter: "/icons/selos/selo-deus-demeter.png",
  poseidon: "/icons/selos/selo-deus-poseidon.png",
  hades: "/icons/selos/selo-deus-hades.png",
  artemis: "/icons/selos/selo-deus-artemis.png",
  hefesto: "/icons/selos/selo-deus-hefesto.png",
  tique: "/icons/selos/selo-deus-tique.png",
  iris: "/icons/selos/selo-deus-iris.png",
  hipnos: "/icons/selos/selo-deus-hipnos.png",
  nemesis: "/icons/selos/selo-deus-nemesis.png",
  nice: "/icons/selos/selo-deus-nice.png",
  hebe: "/icons/selos/selo-deus-hebe.png",
  hecate: "/icons/selos/selo-deus-hecate.png",
  dionisio: "/icons/selos/selo-deus-dionisio.png",
};

function normalizar(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function SeloDeus({
  nome,
  fallbackUrl,
  size = 56,
  className = "",
}: {
  /** Nome da casa divina (ex.: "Zeus", "Deméter", "Ártemis") — acentos são ignorados. */
  nome: string;
  /** Retrato de corpo/busto (casa.ilustracaoCompletaUrl) — usado quando não há selo circular dedicado. */
  fallbackUrl?: string;
  size?: number;
  className?: string;
}) {
  const selo = IMAGENS[normalizar(nome)];
  const imagem = selo ?? fallbackUrl;
  if (!imagem) return null;

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={imagem} alt={nome} fill className={selo ? "object-contain" : "object-cover"} />
    </span>
  );
}
