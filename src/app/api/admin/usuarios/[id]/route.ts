import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao, souAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!(await souAdmin(sessao.usuarioId))) {
    return NextResponse.json({ erro: "Só admins podem alterar isso." }, { status: 403 });
  }

  const { id } = await params;
  if (id === sessao.usuarioId) {
    return NextResponse.json({ erro: "Você não pode alterar sua própria permissão de admin." }, { status: 400 });
  }

  const corpo = await req.json().catch(() => ({}));
  const atualizado = await db.usuario.update({
    where: { id },
    data: { admin: !!corpo.admin },
    select: { id: true, nome: true, email: true, admin: true, criadoEm: true },
  });

  return NextResponse.json(atualizado);
}
