import { API_BASE_URL, API_KEY } from "./constants.js";

export class FddApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`Filhos do Destino API respondeu ${status}: ${JSON.stringify(body)}`);
    this.name = "FddApiError";
  }
}

/** Cliente HTTP compartilhado — autentica com a chave de API (Bearer) em todo request. */
export async function fddRequest<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string | undefined> } = {}
): Promise<T> {
  if (!API_KEY) {
    throw new Error(
      "FDD_API_KEY não configurada. Gere uma chave em /app/configuracoes no Filhos do Destino e defina " +
        "a variável de ambiente FDD_API_KEY na configuração deste servidor MCP."
    );
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  if (init.query) {
    for (const [chave, valor] of Object.entries(init.query)) {
      if (valor !== undefined) url.searchParams.set(chave, valor);
    }
  }

  const resposta = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new FddApiError(resposta.status, corpo);
  }
  return corpo as T;
}

/** Transforma um erro em texto acionável pra devolver como resultado da tool. */
export function formatarErro(error: unknown): string {
  if (error instanceof FddApiError) {
    const mensagem = typeof error.body === "object" && error.body && "erro" in error.body
      ? String((error.body as { erro: unknown }).erro)
      : JSON.stringify(error.body);
    switch (error.status) {
      case 401:
        return `Erro: chave de API inválida ou revogada (${mensagem}). Gere uma nova em /app/configuracoes.`;
      case 403:
        return `Erro: sem permissão (${mensagem}). Endpoints de criação de conteúdo público (monstros/itens/poderes) exigem uma chave de conta admin.`;
      case 404:
        return `Erro: não encontrado (${mensagem}).`;
      case 400:
        return `Erro: dados inválidos (${mensagem}).`;
      default:
        return `Erro: a API respondeu ${error.status} — ${mensagem}`;
    }
  }
  if (error instanceof Error) return `Erro: ${error.message}`;
  return `Erro inesperado: ${String(error)}`;
}
