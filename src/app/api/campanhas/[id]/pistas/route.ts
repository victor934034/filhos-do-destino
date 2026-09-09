import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";

/** Investigação: pistas que o Oráculo cria e revela aos poucos. Jogadores só veem as reveladas. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso a esta campanha." }, { status: 403 });
  }

  const pistas = await db.pista.findMany({
    where: { campanhaId: id, ...(ehOraculo ? {} : { revelada: true }) },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(pistas);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Só o Oráculo pode criar pistas." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  if (!corpo?.titulo?.trim()) return NextResponse.json({ erro: "A pista precisa de um título." }, { status: 400 });

  const pista = await db.pista.create({
    data: { campanhaId: id, titulo: corpo.titulo.trim(), conteudo: corpo.conteudo ?? "" },
  });

  return NextResponse.json(pista, { status: 201 });
}
