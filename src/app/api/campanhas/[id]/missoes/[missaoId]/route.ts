import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; missaoId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, missaoId } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({}));
  const missao = await db.missao.update({
    where: { id: missaoId },
    data: { status: corpo.status === "concluida" ? "concluida" : "aberta" },
  });

  return NextResponse.json(missao);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; missaoId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, missaoId } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  await db.missao.delete({ where: { id: missaoId } });
  return NextResponse.json({ ok: true });
}
