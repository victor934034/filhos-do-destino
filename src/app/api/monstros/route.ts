import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraMonstro, monstroParaDb } from "@/lib/monstroDb";
import type { FichaMonstro } from "@/lib/tipos";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const monstros = await db.monstro.findMany({
    where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(monstros.map(paraMonstro));
}

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const ficha = (await req.json()) as FichaMonstro;
  if (!ficha.nome?.trim()) {
    return NextResponse.json({ erro: "O monstro precisa de um nome." }, { status: 400 });
  }

  // Toda criação começa privada — publicar para a comunidade e marcar como
  // oficial são ações separadas, feitas depois via PUT (a segunda exige admin).
  const criado = await db.monstro.create({
    data: { ...monstroParaDb(ficha), oraculoId: sessao.usuarioId, publico: false, oficial: false },
  });

  return NextResponse.json(paraMonstro(criado), { status: 201 });
}
