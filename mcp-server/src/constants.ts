export const API_BASE_URL = (process.env.FDD_BASE_URL ?? "https://filhos-do-destino.vercel.app").replace(/\/$/, "");
export const API_KEY = process.env.FDD_API_KEY;

// Limite de caracteres numa resposta de tool antes de truncar — evita estourar o
// contexto do agente com uma lista gigante do Bestiário/Compêndio.
export const CHARACTER_LIMIT = 25000;
