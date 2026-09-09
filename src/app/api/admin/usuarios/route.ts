import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao, souAdmin } from "@/lib/auth";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!(await souAdmin(sessao.usuarioId))) {
    return NextResponse.json({ erro: "Só admins podem ver esta lista." }, { status: 403 });
  }

  const usuarios = await db.usuario.findMany({
    orderBy: { criadoEm: "desc" },
    select: { id: true, nome: true, email: true, admin: true, criadoEm: true },
  });

  return NextResponse.json(usuarios);
}
