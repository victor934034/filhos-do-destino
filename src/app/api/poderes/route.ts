import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraPoderCompendio, poderCompendioParaDb } from "@/lib/poderCompendioDb";
import type { PoderCompendio } from "@/lib/tipos";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const poderes = await db.poderCompendio.findMany({
    where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] },
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json(poderes.map(paraPoderCompendio));
}

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const ficha = (await req.json()) as PoderCompendio;
  if (!ficha.nome?.trim()) {
    return NextResponse.json({ erro: "O poder precisa de um nome." }, { status: 400 });
  }

  const criado = await db.poderCompendio.create({
    data: { ...poderCompendioParaDb(ficha), oraculoId: sessao.usuarioId, publico: false, oficial: false },
  });

  return NextResponse.json(paraPoderCompendio(criado), { status: 201 });
}
