import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

async function autorizarOraculo(campanhaId: string, usuarioId: string) {
  const campanha = await db.campanha.findUnique({ where: { id: campanhaId } });
  return campanha?.oraculoId === usuarioId;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; encontroId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, encontroId } = await params;
  if (!(await autorizarOraculo(id, sessao.usuarioId))) {
    return NextResponse.json({ erro: "Só o Oráculo pode editar combates." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({}));
  const encontro = await db.encontroCampanha.update({
    where: { id: encontroId },
    data: {
      ...(typeof corpo.nome === "string" ? { nome: corpo.nome } : {}),
      ...(Number.isFinite(corpo.vida) ? { vida: Math.max(0, Math.round(corpo.vida)) } : {}),
    },
  });

  return NextResponse.json(encontro);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; encontroId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, encontroId } = await params;
  if (!(await autorizarOraculo(id, sessao.usuarioId))) {
    return NextResponse.json({ erro: "Só o Oráculo pode remover combates." }, { status: 403 });
  }

  await db.encontroCampanha.delete({ where: { id: encontroId } });
  return NextResponse.json({ ok: true });
}
