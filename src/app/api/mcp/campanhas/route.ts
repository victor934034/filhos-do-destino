import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { autenticarChaveApi } from "@/lib/auth";
import { paraCampanha, INCLUDE_CAMPANHA_COMPLETA } from "@/lib/campanhaDb";
import { regrasDaCasaPadrao } from "@/lib/tipos";

/**
 * API pública de campanhas, para integrações externas (ex.: um MCP) autenticadas
 * por chave de API (`Authorization: Bearer <chave>`, gerada em /app/configuracoes).
 *
 * GET  /api/mcp/campanhas?categoria=original|comunidade — lista campanhas públicas
 * POST /api/mcp/campanhas — cria uma campanha (com história/missões pré-escritas)
 *   em nome do dono da chave. `oficial: true` só é aceito se a chave for de um admin
 *   — vira a categoria "Original"; senão a campanha entra como "Comunidade".
 */
export async function GET(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  const url = new URL(req.url);
  const categoria = url.searchParams.get("categoria");

  const campanhas = await db.campanha.findMany({
    where: {
      visibilidade: "publica",
      ...(categoria === "original" ? { oficial: true } : categoria === "comunidade" ? { oficial: false } : {}),
    },
    include: INCLUDE_CAMPANHA_COMPLETA,
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json(campanhas.map(paraCampanha));
}

export async function POST(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  const corpo = await req.json().catch(() => null);
  if (!corpo?.nome?.trim()) {
    return NextResponse.json({ erro: "A campanha precisa de um nome." }, { status: 400 });
  }

  const missoes: { titulo: string; descricao?: string }[] = Array.isArray(corpo.missoes) ? corpo.missoes : [];

  const criada = await db.campanha.create({
    data: {
      oraculoId: sessao.usuarioId,
      nome: corpo.nome.trim(),
      sinopse: corpo.sinopse ?? "",
      capaUrl: corpo.capaUrl || null,
      visibilidade: corpo.visibilidade === "privada" ? "privada" : "publica",
      vagasMaximas: Number(corpo.vagasMaximas) || 5,
      tom: corpo.tom ?? "",
      regrasDaCasa: JSON.stringify(regrasDaCasaPadrao()),
      oficial: !!corpo.oficial && sessao.admin,
      origemMcp: true,
      missoes: {
        create: missoes
          .filter((m) => m?.titulo?.trim())
          .map((m) => ({ titulo: m.titulo.trim(), descricao: m.descricao ?? "" })),
      },
    },
    include: INCLUDE_CAMPANHA_COMPLETA,
  });

  return NextResponse.json(paraCampanha(criada), { status: 201 });
}
