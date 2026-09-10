import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { autenticarChaveApi } from "@/lib/auth";
import { paraPoderCompendio, poderCompendioParaDb } from "@/lib/poderCompendioDb";
import type { PoderCompendio } from "@/lib/tipos";

/**
 * GET  /api/mcp/poderes?categoria=original|comunidade — lista poderes/habilidades públicas
 * POST /api/mcp/poderes — cria um poder em nome do dono da chave. `oficial: true`
 *   só é aceito se a chave for de um admin — vira a categoria "Original".
 */
export async function GET(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  const url = new URL(req.url);
  const categoria = url.searchParams.get("categoria");

  const poderes = await db.poderCompendio.findMany({
    where: {
      publico: true,
      ...(categoria === "original" ? { oficial: true } : categoria === "comunidade" ? { oficial: false } : {}),
    },
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json(poderes.map(paraPoderCompendio));
}

export async function POST(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });
  // Criar por aqui sempre entra público no Compêndio (visível pra todo mundo) — só uma
  // chave de conta admin pode fazer isso. Usuário comum cria pela própria interface
  // (Homebrew), o que já fica privado, só na Homebrew dele.
  if (!sessao.admin) {
    return NextResponse.json({ erro: "Só uma chave de conta admin pode criar poderes por aqui." }, { status: 403 });
  }

  const ficha = (await req.json().catch(() => null)) as PoderCompendio | null;
  if (!ficha?.nome?.trim()) {
    return NextResponse.json({ erro: "O poder precisa de um nome." }, { status: 400 });
  }

  const oficial = !!ficha.oficial && sessao.admin;
  const criado = await db.poderCompendio.create({
    data: { ...poderCompendioParaDb(ficha), oraculoId: sessao.usuarioId, publico: true, oficial },
  });

  return NextResponse.json(paraPoderCompendio(criado), { status: 201 });
}
