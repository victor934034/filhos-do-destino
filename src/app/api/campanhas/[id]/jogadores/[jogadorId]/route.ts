import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; jogadorId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, jogadorId } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({}));
  if (!["aprovado", "recusado", "pendente"].includes(corpo.status)) {
    return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
  }

  await db.campanhaJogador.update({
    where: { id: jogadorId },
    data: { status: corpo.status },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; jogadorId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, jogadorId } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  await db.campanhaJogador.delete({ where: { id: jogadorId } });
  return NextResponse.json({ ok: true });
}
