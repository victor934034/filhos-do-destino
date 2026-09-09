import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao, souAdmin } from "@/lib/auth";
import { paraPoderCompendio, poderCompendioParaDb } from "@/lib/poderCompendioDb";
import type { PoderCompendio } from "@/lib/tipos";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.poderCompendio.findUnique({ where: { id } });
  if (!existente || existente.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const ficha = (await req.json()) as PoderCompendio;
  const dados = poderCompendioParaDb(ficha);
  if (ficha.oficial && !(await souAdmin(sessao.usuarioId))) {
    dados.oficial = existente.oficial;
  }

  const atualizado = await db.poderCompendio.update({ where: { id }, data: dados });

  return NextResponse.json(paraPoderCompendio(atualizado));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.poderCompendio.findUnique({ where: { id } });
  if (!existente || existente.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  await db.poderCompendio.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
