import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";

/** Relatórios de sessão — visíveis a todos da campanha, escritos pelo Oráculo ou qualquer jogador aprovado. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso a esta campanha." }, { status: 403 });
  }

  const relatorios = await db.relatorio.findMany({ where: { campanhaId: id }, orderBy: { criadoEm: "desc" } });
  return NextResponse.json(relatorios);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso a esta campanha." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  if (!corpo?.titulo?.trim()) return NextResponse.json({ erro: "O relatório precisa de um título." }, { status: 400 });

  const relatorio = await db.relatorio.create({
    data: {
      campanhaId: id,
      titulo: corpo.titulo.trim(),
      conteudo: corpo.conteudo ?? "",
      autorId: sessao.usuarioId,
      autorNome: sessao.nome,
    },
  });

  return NextResponse.json(relatorio, { status: 201 });
}
