import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; relatorioId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, relatorioId } = await params;
  const [campanha, relatorio] = await Promise.all([
    db.campanha.findUnique({ where: { id } }),
    db.relatorio.findUnique({ where: { id: relatorioId } }),
  ]);
  if (!relatorio) return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });

  const podeApagar = campanha?.oraculoId === sessao.usuarioId || relatorio.autorId === sessao.usuarioId;
  if (!podeApagar) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });

  await db.relatorio.delete({ where: { id: relatorioId } });
  return NextResponse.json({ ok: true });
}
