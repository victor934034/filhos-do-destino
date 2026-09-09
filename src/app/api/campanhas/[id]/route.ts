import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraCampanha, INCLUDE_CAMPANHA_COMPLETA } from "@/lib/campanhaDb";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const c = await db.campanha.findUnique({ where: { id }, include: INCLUDE_CAMPANHA_COMPLETA });
  if (!c) return NextResponse.json({ erro: "Campanha não encontrada." }, { status: 404 });

  const ehOraculo = c.oraculoId === sessao.usuarioId;
  const ehJogador = c.jogadores.some((j) => j.usuarioId === sessao.usuarioId);
  if (!ehOraculo && !ehJogador && c.visibilidade !== "publica") {
    return NextResponse.json({ erro: "Sem acesso a esta campanha." }, { status: 403 });
  }

  return NextResponse.json(paraCampanha(c));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.campanha.findUnique({ where: { id } });
  if (!existente || existente.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({}));
  const atualizada = await db.campanha.update({
    where: { id },
    data: {
      nome: corpo.nome ?? existente.nome,
      sinopse: corpo.sinopse ?? existente.sinopse,
      capaUrl: corpo.capaUrl ?? existente.capaUrl,
      visibilidade: corpo.visibilidade ?? existente.visibilidade,
      vagasMaximas: corpo.vagasMaximas ?? existente.vagasMaximas,
      tom: corpo.tom ?? existente.tom,
      regrasDaCasa: corpo.regrasDaCasa ? JSON.stringify(corpo.regrasDaCasa) : existente.regrasDaCasa,
      ocultarSemideusesParaJogadores:
        typeof corpo.ocultarSemideusesParaJogadores === "boolean"
          ? corpo.ocultarSemideusesParaJogadores
          : existente.ocultarSemideusesParaJogadores,
    },
    include: INCLUDE_CAMPANHA_COMPLETA,
  });

  return NextResponse.json(paraCampanha(atualizada));
}
