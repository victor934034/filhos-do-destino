import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const chave = await db.chaveApi.findUnique({ where: { id } });
  if (!chave || chave.usuarioId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Chave não encontrada." }, { status: 404 });
  }

  await db.chaveApi.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
