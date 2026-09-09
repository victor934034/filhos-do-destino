import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const usuarios = await db.usuario.findMany({
    where: {
      id: { not: sessao.usuarioId },
      OR: [{ nome: { contains: q } }, { email: { contains: q } }],
    },
    select: { id: true, nome: true, email: true },
    take: 12,
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(usuarios);
}
