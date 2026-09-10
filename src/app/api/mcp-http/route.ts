import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { criarMcpServer } from "@/lib/mcpServer";

/**
 * Servidor MCP remoto — embrulha as mesmas 10 tools de mcp-server/ (ver README do projeto),
 * mas rodando no próprio deploy (Vercel), sem precisar de nada instalado localmente.
 *
 * Cliente MCP HTTP configura direto:
 *   claude mcp add --transport http filhos-do-destino https://filhos-do-destino.vercel.app/api/mcp-http \
 *     --header "Authorization: Bearer <chave>"
 *
 * Stateless: cada request cria seu próprio McpServer/transport (sem sessão em memória),
 * compatível com funções serverless.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extrairChave(req: Request): string | null {
  const cabecalho = req.headers.get("authorization") ?? "";
  const [tipo, chave] = cabecalho.split(" ");
  if (tipo?.toLowerCase() !== "bearer" || !chave) return null;
  return chave;
}

async function tratar(req: Request): Promise<Response> {
  const chave = extrairChave(req);
  if (!chave) {
    return new Response(
      JSON.stringify({ erro: "Chave de API inválida. Envie Authorization: Bearer <chave> (gere uma em /app/configuracoes)." }),
      { status: 401, headers: { "content-type": "application/json", "www-authenticate": 'Bearer realm="filhos-do-destino"' } }
    );
  }

  const origem = new URL(req.url).origin;
  const server = criarMcpServer(origem, chave);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export const GET = tratar;
export const POST = tratar;
export const DELETE = tratar;
