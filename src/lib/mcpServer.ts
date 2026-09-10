import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const CHARACTER_LIMIT = 25000;

// ---------- Cliente HTTP interno (chama as mesmas rotas /api/mcp/* já existentes) ----------

class FddApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`Filhos do Destino API respondeu ${status}: ${JSON.stringify(body)}`);
    this.name = "FddApiError";
  }
}

function criarClienteFdd(origem: string, chave: string) {
  async function fddRequest<T>(
    path: string,
    init: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string | undefined> } = {}
  ): Promise<T> {
    const url = new URL(`${origem}${path}`);
    if (init.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v !== undefined) url.searchParams.set(k, v);
      }
    }
    const resposta = await fetch(url, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${chave}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const corpo = await resposta.json().catch(() => null);
    if (!resposta.ok) throw new FddApiError(resposta.status, corpo);
    return corpo as T;
  }
  return fddRequest;
}

function formatarErro(error: unknown): string {
  if (error instanceof FddApiError) {
    const mensagem =
      typeof error.body === "object" && error.body && "erro" in error.body
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

function truncar(json: unknown): string {
  const texto = JSON.stringify(json, null, 2);
  if (texto.length <= CHARACTER_LIMIT) return texto;
  return (
    texto.slice(0, CHARACTER_LIMIT) +
    `\n\n[...resposta truncada — ${texto.length} caracteres no total. Use "categoria" ou refine a busca.]`
  );
}

// ---------- Schemas (mesmos do mcp-server/ local, ver mcp-server/src/schemas.ts) ----------

const CategoriaSchema = z
  .enum(["original", "comunidade"])
  .optional()
  .describe("Filtra por categoria: 'original' (curado por admins) ou 'comunidade' (enviado por qualquer chave admin). Omitir traz as duas.");

const AtributoSchema = z
  .enum(["forca", "destreza", "vigor", "inteligencia", "carisma", "aparencia"])
  .describe("Um dos 6 atributos do sistema.");

const ListarCampanhasSchema = z.object({ categoria: CategoriaSchema }).strict();

const MissaoInputSchema = z
  .object({
    titulo: z.string().min(1).describe("Título da missão/capítulo."),
    descricao: z.string().optional().describe("Descrição da missão."),
  })
  .strict();

const CriarCampanhaSchema = z
  .object({
    nome: z.string().min(1).max(80).describe("Nome da campanha."),
    sinopse: z.string().optional().describe("Sinopse/premissa da campanha."),
    tom: z.string().optional().describe("Tags de tom livres, separadas por vírgula (ex.: 'sombrio, investigação')."),
    capaUrl: z.string().url().optional().describe("URL de uma imagem de capa já hospedada."),
    visibilidade: z.enum(["publica", "privada"]).default("publica").describe("Se 'privada', só entra por convite."),
    vagasMaximas: z.number().int().min(1).max(20).default(5).describe("Número máximo de jogadores aprovados."),
    oficial: z
      .boolean()
      .default(false)
      .describe("Marca como 'Original' (curadoria oficial) — só tem efeito se a chave for de uma conta admin; senão é ignorado."),
    missoes: z.array(MissaoInputSchema).default([]).describe("Missões/capítulos iniciais já escritos, se houver."),
  })
  .strict();

const AdicionarMissaoSchema = z
  .object({
    campanhaId: z.string().min(1).describe("ID da campanha (dona da chave, ou qualquer uma se a chave for admin)."),
    titulo: z.string().min(1).describe("Título da missão/capítulo."),
    descricao: z.string().optional().describe("Descrição da missão."),
  })
  .strict();

const ListarCompendioSchema = z.object({ categoria: CategoriaSchema }).strict();

const HabilidadeAtivaSchema = z
  .object({
    nome: z.string().min(1),
    alcance: z.enum(["corpoACorpo", "linhaReta", "area"]),
    dadoDeDano: z.string().describe("Ex.: '2d6', '1d8+2'."),
  })
  .strict();

const HabilidadePassivaSchema = z.object({ nome: z.string().min(1), efeito: z.string() }).strict();

const CriarMonstroSchema = z
  .object({
    nome: z.string().min(1).max(80),
    ilustracaoUrl: z.string().url().optional(),
    vida: z.number().int().min(1),
    aspis: z.number().int().min(0),
    forca: z.number().int().min(1).max(5),
    destreza: z.number().int().min(1).max(5),
    vigor: z.number().int().min(1).max(5),
    inteligencia: z.number().int().min(1).max(5),
    carisma: z.number().int().min(1).max(5),
    aparencia: z.number().int().min(1).max(5),
    atributoAtaque: AtributoSchema.describe("Atributo usado pra rolar o ataque deste monstro."),
    habilidadesAtivas: z.array(HabilidadeAtivaSchema).default([]),
    habilidadesPassivas: z.array(HabilidadePassivaSchema).default([]),
    oficial: z.boolean().default(false).describe("Marca como 'Original' — só tem efeito com chave de conta admin."),
  })
  .strict();

const CriarItemSchema = z
  .object({
    nome: z.string().min(1).max(80),
    ilustracaoUrl: z.string().url().optional(),
    tipo: z.enum(["arma", "consumivel", "narrativo", "legado"]),
    dadoDeDano: z.string().optional().describe("Ex.: '1d8' — só faz sentido pra tipo 'arma'."),
    multiplicadorCritico: z.number().int().min(1).default(2),
    efeito: z.string().default("").describe("Efeito mecânico do item."),
    textoLore: z.string().default("").describe("Texto narrativo/flavor do item."),
    preco: z.number().int().min(0).default(0).describe("Preço em Dracmas no Mercado — 0 = não vendido lá."),
    oficial: z.boolean().default(false).describe("Marca como 'Original' — só tem efeito com chave de conta admin."),
  })
  .strict();

const CriarPoderSchema = z
  .object({
    nome: z.string().min(1).max(80),
    ilustracaoUrl: z.string().url().optional(),
    tipoAcao: z.enum(["Ação", "Reação", "Livre"]),
    custoEstamina: z.number().int().min(0).default(0),
    duracao: z.string().default("Instantânea"),
    efeito: z.string().describe("Efeito mecânico do poder."),
    oficial: z.boolean().default(false).describe("Marca como 'Original' — só tem efeito com chave de conta admin."),
  })
  .strict();

/**
 * Monta um McpServer completo (as mesmas 10 tools do mcp-server/ local), mas falando
 * HTTP direto com o próprio app (sem precisar de um processo Node rodando na máquina
 * do usuário) — usado pelo endpoint remoto em /api/mcp-http.
 */
export function criarMcpServer(origem: string, chave: string) {
  const fddRequest = criarClienteFdd(origem, chave);
  const server = new McpServer({ name: "filhos-do-destino-mcp-server", version: "1.0.0" });

  server.registerTool(
    "fdd_get_me",
    {
      title: "Identificar a chave de API",
      description: `Identifica a conta dona da chave de API configurada — nome, email, e se é uma conta admin.

Use isso primeiro, pra saber se as tools de criação de monstro/item/poder (que exigem admin) vão funcionar antes de tentar.

Retorna: { usuarioId, nome, email, admin }`,
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const dados = await fddRequest("/api/mcp/me");
        return { content: [{ type: "text", text: truncar(dados) }], structuredContent: dados as Record<string, unknown> };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_list_campanhas",
    {
      title: "Listar campanhas públicas",
      description: `Lista campanhas públicas do Filhos do Destino (visibilidade "publica"), mais recentes primeiro, curadas ("Original") antes das da comunidade.

Args:
  - categoria ('original' | 'comunidade', opcional): filtra por categoria. Omitir traz as duas.

Retorna: array de campanhas com id, nome, sinopse, tom, vagasMaximas, jogadores, missoes, etc.`,
      inputSchema: ListarCampanhasSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/campanhas", { query: { categoria: params.categoria } });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_create_campanha",
    {
      title: "Criar campanha",
      description: `Cria uma nova campanha em nome do dono da chave de API, com sinopse e missões/capítulos iniciais já escritos, se fornecidos.

Args:
  - nome (string, obrigatório)
  - sinopse (string, opcional)
  - tom (string, opcional): tags livres separadas por vírgula
  - capaUrl (string, opcional): URL de imagem já hospedada
  - visibilidade ('publica' | 'privada', default 'publica')
  - vagasMaximas (number, default 5)
  - oficial (boolean, default false): marca como "Original" — só funciona com chave admin, senão é ignorado silenciosamente pela API
  - missoes (array de { titulo, descricao? }, opcional)

Retorna a campanha criada, incluindo o "id" — guarde-o pra usar em fdd_add_missao depois.`,
      inputSchema: CriarCampanhaSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/campanhas", { method: "POST", body: params });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_add_missao",
    {
      title: "Adicionar missão a uma campanha",
      description: `Adiciona um capítulo/missão a uma campanha já existente, que a chave precisa possuir (ou ser de uma conta admin).

Args:
  - campanhaId (string, obrigatório): id retornado por fdd_create_campanha ou fdd_list_campanhas
  - titulo (string, obrigatório)
  - descricao (string, opcional)

Erro comum: 404 "Campanha não encontrada" — geralmente significa que a chave não é dona dessa campanha.`,
      inputSchema: AdicionarMissaoSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ campanhaId, ...corpo }) => {
      try {
        const dados = await fddRequest(`/api/mcp/campanhas/${campanhaId}/missoes`, { method: "POST", body: corpo });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_list_monstros",
    {
      title: "Listar monstros públicos do Bestiário",
      description: `Lista o Bestiário público — monstros/ameaças curados ("Original") ou enviados pela comunidade.

Args:
  - categoria ('original' | 'comunidade', opcional)

Retorna: array de monstros com atributos, vida, áspis, habilidades ativas/passivas, etc.`,
      inputSchema: ListarCompendioSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/monstros", { query: { categoria: params.categoria } });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_create_monstro",
    {
      title: "Criar monstro no Bestiário público",
      description: `Cria um monstro no Bestiário público (visível pra todo mundo, não é privado) — REQUER uma chave de conta admin, retorna 403 pra qualquer outra.

Args:
  - nome, vida, aspis, forca, destreza, vigor, inteligencia, carisma, aparencia (todos obrigatórios; atributos de 1 a 5)
  - atributoAtaque: qual dos 6 atributos rola o ataque deste monstro
  - habilidadesAtivas (array de { nome, alcance: 'corpoACorpo'|'linhaReta'|'area', dadoDeDano }, opcional)
  - habilidadesPassivas (array de { nome, efeito }, opcional)
  - oficial (boolean, default false): marca como "Original"

Se a chave não for admin, use fdd_get_me primeiro pra confirmar antes de tentar.`,
      inputSchema: CriarMonstroSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/monstros", { method: "POST", body: params });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_list_itens",
    {
      title: "Listar itens públicos do Compêndio",
      description: `Lista o Compêndio de itens público — armas, consumíveis, itens narrativos e legados.

Args:
  - categoria ('original' | 'comunidade', opcional)`,
      inputSchema: ListarCompendioSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/itens", { query: { categoria: params.categoria } });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_create_item",
    {
      title: "Criar item no Compêndio público",
      description: `Cria um item no Compêndio público — REQUER chave de conta admin, retorna 403 pra qualquer outra.

Args:
  - nome, tipo ('arma'|'consumivel'|'narrativo'|'legado') obrigatórios
  - dadoDeDano (ex.: '1d8', só relevante pra tipo 'arma')
  - multiplicadorCritico (default 2)
  - efeito, textoLore (texto livre)
  - preco (Dracmas no Mercado — 0 = não vendido)
  - oficial (boolean, default false): marca como "Original"`,
      inputSchema: CriarItemSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/itens", { method: "POST", body: params });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_list_poderes",
    {
      title: "Listar poderes públicos do Compêndio",
      description: `Lista o Compêndio de poderes/habilidades público.

Args:
  - categoria ('original' | 'comunidade', opcional)`,
      inputSchema: ListarCompendioSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/poderes", { query: { categoria: params.categoria } });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "fdd_create_poder",
    {
      title: "Criar poder no Compêndio público",
      description: `Cria um poder/habilidade no Compêndio público — REQUER chave de conta admin, retorna 403 pra qualquer outra.

Args:
  - nome, tipoAcao ('Ação'|'Reação'|'Livre'), efeito (texto mecânico) obrigatórios
  - custoEstamina (default 0), duracao (default 'Instantânea')
  - oficial (boolean, default false): marca como "Original"`,
      inputSchema: CriarPoderSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const dados = await fddRequest("/api/mcp/poderes", { method: "POST", body: params });
        return { content: [{ type: "text", text: truncar(dados) }] };
      } catch (error) {
        return { content: [{ type: "text", text: formatarErro(error) }], isError: true };
      }
    }
  );

  return server;
}
