import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Otimização real do next/image (via `sharp`, agora instalado). O
    // wildcard de host é necessário porque o app deixa colar qualquer URL de
    // imagem (personagens, campanhas, monstros, itens) — sem isso, next/image
    // bloqueia hosts remotos não listados por padrão.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
