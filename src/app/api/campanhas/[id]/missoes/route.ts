import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  if (!corpo?.titulo?.trim()) {
    return NextResponse.json({ erro: "A missão precisa de um título." }, { status: 400 });
  }

  const missao = await db.missao.create({
    data: { campanhaId: id, titulo: corpo.titulo.trim(), descricao: corpo.descricao ?? "" },
  });

  return NextResponse.json(missao, { status: 201 });
}
