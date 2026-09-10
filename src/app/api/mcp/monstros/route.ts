import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { autenticarChaveApi } from "@/lib/auth";
import { paraMonstro, monstroParaDb } from "@/lib/monstroDb";
import type { FichaMonstro } from "@/lib/tipos";

/**
 * GET  /api/mcp/monstros?categoria=original|comunidade — lista o bestiário público
 * POST /api/mcp/monstros — cria um monstro em nome do dono da chave. `oficial: true`
 *   só é aceito se a chave for de um admin — vira a categoria "Original".
 */
export async function GET(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  const url = new URL(req.url);
  const categoria = url.searchParams.get("categoria");

  const monstros = await db.monstro.findMany({
    where: {
      publico: true,
      ...(categoria === "original" ? { oficial: true } : categoria === "comunidade" ? { oficial: false } : {}),
    },
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json(monstros.map(paraMonstro));
}

export async function POST(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });
  // Criar por aqui sempre entra público no Bestiário (visível pra todo mundo) — só uma
  // chave de conta admin pode fazer isso. Usuário comum cria pela própria interface
  // (Homebrew), o que já fica privado, só na Homebrew dele.
  if (!sessao.admin) {
    return NextResponse.json({ erro: "Só uma chave de conta admin pode criar monstros por aqui." }, { status: 403 });
  }

  const ficha = (await req.json().catch(() => null)) as FichaMonstro | null;
  if (!ficha?.nome?.trim()) {
    return NextResponse.json({ erro: "O monstro precisa de um nome." }, { status: 400 });
  }

  const oficial = !!ficha.oficial && sessao.admin;
  const criado = await db.monstro.create({
    data: { ...monstroParaDb(ficha), oraculoId: sessao.usuarioId, publico: true, oficial },
  });

  return NextResponse.json(paraMonstro(criado), { status: 201 });
}
