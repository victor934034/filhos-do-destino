import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" é só pro Dockerfile/EasyPanel — na Vercel (que já seta VERCEL=1 no
  // ambiente de build) essa opção quebra o build dela: ela espera achar
  // `.next/next-server.js.nft.json`, arquivo que o modo standalone não gera, já que
  // produz seu próprio bundle autocontido em vez dos arquivos de trace normais.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  images: {
    // Otimização real do next/image (via `sharp`, agora instalado). O
    // wildcard de host é necessário porque o app deixa colar qualquer URL de
    // imagem (personagens, campanhas, monstros, itens) — sem isso, next/image
    // bloqueia hosts remotos não listados por padrão.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
