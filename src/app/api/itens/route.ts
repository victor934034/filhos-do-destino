import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraItemCompendio, itemCompendioParaDb } from "@/lib/itemCompendioDb";
import type { ItemCompendio } from "@/lib/tipos";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const itens = await db.itemCompendio.findMany({
    where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(itens.map(paraItemCompendio));
}

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const ficha = (await req.json()) as ItemCompendio;
  if (!ficha.nome?.trim()) {
    return NextResponse.json({ erro: "O item precisa de um nome." }, { status: 400 });
  }

  const criado = await db.itemCompendio.create({
    data: { ...itemCompendioParaDb(ficha), oraculoId: sessao.usuarioId, publico: false, oficial: false },
  });

  return NextResponse.json(paraItemCompendio(criado), { status: 201 });
}
