#!/usr/bin/env node
/**
 * Servidor MCP do Filhos do Destino.
 *
 * Embrulha a API pública /api/mcp/* (ver README.md do projeto principal) em tools MCP,
 * pra um agente conversar em linguagem natural e criar campanhas, monstros, itens e
 * poderes na plataforma. Autentica com uma chave gerada em /app/configuracoes.
 *
 * Endpoints de criação de conteúdo público (monstro/item/poder) exigem chave de conta
 * admin — a API retorna 403 pra qualquer outra, e as tools devolvem esse erro como está.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { API_KEY, CHARACTER_LIMIT } from "./constants.js";
import { fddRequest, formatarErro } from "./client.js";
import {
  ListarCampanhasSchema,
  CriarCampanhaSchema,
  AdicionarMissaoSchema,
  ListarCompendioSchema,
  CriarMonstroSchema,
  CriarItemSchema,
  CriarPoderSchema,
} from "./schemas.js";

const server = new McpServer({
  name: "filhos-do-destino-mcp-server",
  version: "1.0.0",
});

function truncar(json: unknown): string {
  const texto = JSON.stringify(json, null, 2);
  if (texto.length <= CHARACTER_LIMIT) return texto;
  return (
    texto.slice(0, CHARACTER_LIMIT) +
    `\n\n[...resposta truncada — ${texto.length} caracteres no total. Use "categoria" ou refine a busca.]`
  );
}

// ---------- Identidade ----------

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

// ---------- Campanhas ----------

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

// ---------- Bestiário (monstros) ----------

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

// ---------- Compêndio (itens) ----------

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

// ---------- Compêndio (poderes) ----------

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

// ---------- Boot ----------

async function main() {
  if (!API_KEY) {
    console.error(
      "ERRO: variável de ambiente FDD_API_KEY não definida. Gere uma chave em /app/configuracoes " +
        "no Filhos do Destino e configure-a no cliente MCP (ver README.md deste servidor)."
    );
    process.exit(1);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("filhos-do-destino-mcp-server rodando via stdio");
}

main().catch((error) => {
  console.error("Erro fatal:", error);
  process.exit(1);
});
