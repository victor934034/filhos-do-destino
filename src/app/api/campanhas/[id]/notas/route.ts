import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

/**
 * Notas privadas do Oráculo — nunca expostas em nenhuma rota de jogador (nem
 * passam por paraCampanha). Só o próprio Oráculo desta campanha lê/escreve.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id }, select: { oraculoId: true, notasPrivadas: true } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  return NextResponse.json({ notas: campanha.notasPrivadas });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id }, select: { oraculoId: true } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({}));
  const atualizada = await db.campanha.update({
    where: { id },
    data: { notasPrivadas: typeof corpo.notas === "string" ? corpo.notas : "" },
    select: { notasPrivadas: true },
  });

  return NextResponse.json({ notas: atualizada.notasPrivadas });
}
