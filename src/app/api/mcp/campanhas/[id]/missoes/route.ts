import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { autenticarChaveApi } from "@/lib/auth";

/** POST /api/mcp/campanhas/[id]/missoes — adiciona um capítulo/missão a uma campanha existente. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || (campanha.oraculoId !== sessao.usuarioId && !sessao.admin)) {
    return NextResponse.json({ erro: "Campanha não encontrada." }, { status: 404 });
  }

  const corpo = await req.json().catch(() => null);
  if (!corpo?.titulo?.trim()) {
    return NextResponse.json({ erro: "A missão precisa de um título." }, { status: 400 });
  }

  const missao = await db.missao.create({
    data: { campanhaId: id, titulo: corpo.titulo.trim(), descricao: corpo.descricao ?? "" },
  });

  return NextResponse.json(
    { id: missao.id, titulo: missao.titulo, descricao: missao.descricao, status: missao.status },
    { status: 201 }
  );
}
