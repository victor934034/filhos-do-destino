import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao, souAdmin } from "@/lib/auth";
import { paraMonstro, monstroParaDb } from "@/lib/monstroDb";
import type { FichaMonstro } from "@/lib/tipos";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.monstro.findUnique({ where: { id } });
  if (!existente || existente.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const ficha = (await req.json()) as FichaMonstro;
  const dados = monstroParaDb(ficha);
  // "Compartilhar com a comunidade" (publico) é autoatendido pelo dono; marcar
  // como "Oficial" (curadoria) só quem é admin pode.
  if (ficha.oficial && !(await souAdmin(sessao.usuarioId))) {
    dados.oficial = existente.oficial;
  }

  const atualizado = await db.monstro.update({ where: { id }, data: dados });

  return NextResponse.json(paraMonstro(atualizado));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.monstro.findUnique({ where: { id } });
  if (!existente || existente.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  await db.monstro.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
