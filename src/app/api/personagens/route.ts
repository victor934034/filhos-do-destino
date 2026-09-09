import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraDb, paraFicha } from "@/lib/personagemDb";
import type { FichaPersonagem } from "@/lib/tipos";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const personagens = await db.personagem.findMany({
    where: { usuarioId: sessao.usuarioId },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(personagens.map(paraFicha));
}

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const ficha = (await req.json()) as FichaPersonagem;
  if (!ficha.nome?.trim()) {
    return NextResponse.json({ erro: "O personagem precisa de um nome." }, { status: 400 });
  }

  const criado = await db.personagem.create({
    data: { ...paraDb(ficha), usuarioId: sessao.usuarioId },
  });

  return NextResponse.json(paraFicha(criado), { status: 201 });
}
