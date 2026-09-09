import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { autenticarChaveApi } from "@/lib/auth";
import { paraItemCompendio, itemCompendioParaDb } from "@/lib/itemCompendioDb";
import type { ItemCompendio } from "@/lib/tipos";

/**
 * GET  /api/mcp/itens?categoria=original|comunidade — lista o compêndio público
 * POST /api/mcp/itens — cria um item em nome do dono da chave. `oficial: true`
 *   só é aceito se a chave for de um admin — vira a categoria "Original".
 */
export async function GET(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  const url = new URL(req.url);
  const categoria = url.searchParams.get("categoria");

  const itens = await db.itemCompendio.findMany({
    where: {
      publico: true,
      ...(categoria === "original" ? { oficial: true } : categoria === "comunidade" ? { oficial: false } : {}),
    },
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json(itens.map(paraItemCompendio));
}

export async function POST(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  const ficha = (await req.json().catch(() => null)) as ItemCompendio | null;
  if (!ficha?.nome?.trim()) {
    return NextResponse.json({ erro: "O item precisa de um nome." }, { status: 400 });
  }

  const oficial = !!ficha.oficial && sessao.admin;
  const criado = await db.itemCompendio.create({
    data: { ...itemCompendioParaDb(ficha), oraculoId: sessao.usuarioId, publico: true, oficial },
  });

  return NextResponse.json(paraItemCompendio(criado), { status: 201 });
}
