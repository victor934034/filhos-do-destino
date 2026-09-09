import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

async function autorizarOraculo(campanhaId: string, usuarioId: string) {
  const campanha = await db.campanha.findUnique({ where: { id: campanhaId } });
  return campanha?.oraculoId === usuarioId;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; pistaId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, pistaId } = await params;
  if (!(await autorizarOraculo(id, sessao.usuarioId))) {
    return NextResponse.json({ erro: "Só o Oráculo pode editar pistas." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({}));
  const pista = await db.pista.update({
    where: { id: pistaId },
    data: {
      ...(typeof corpo.titulo === "string" ? { titulo: corpo.titulo } : {}),
      ...(typeof corpo.conteudo === "string" ? { conteudo: corpo.conteudo } : {}),
      ...(typeof corpo.revelada === "boolean" ? { revelada: corpo.revelada } : {}),
    },
  });

  return NextResponse.json(pista);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; pistaId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, pistaId } = await params;
  if (!(await autorizarOraculo(id, sessao.usuarioId))) {
    return NextResponse.json({ erro: "Só o Oráculo pode remover pistas." }, { status: 403 });
  }

  await db.pista.delete({ where: { id: pistaId } });
  return NextResponse.json({ ok: true });
}
