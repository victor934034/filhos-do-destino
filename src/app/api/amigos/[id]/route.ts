import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraAmizade } from "@/lib/amizadeDb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.amizade.findUnique({ where: { id } });
  // Só quem recebeu o pedido pode aceitar ou recusar.
  if (!existente || existente.destinatarioId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const { status } = (await req.json()) as { status: "aceita" | "recusada" };
  if (status !== "aceita" && status !== "recusada") {
    return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
  }

  const atualizada = await db.amizade.update({
    where: { id },
    data: { status },
    include: { solicitante: true, destinatario: true },
  });

  return NextResponse.json(paraAmizade(atualizada, sessao.usuarioId));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.amizade.findUnique({ where: { id } });
  if (!existente || (existente.solicitanteId !== sessao.usuarioId && existente.destinatarioId !== sessao.usuarioId)) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  await db.amizade.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
