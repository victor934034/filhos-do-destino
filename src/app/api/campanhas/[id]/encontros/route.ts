import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";

/** Encontros pré-montados (Nível 2, botão "Criar Combate") — não é a sessão ao vivo. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso a esta campanha." }, { status: 403 });
  }

  const encontros = await db.encontroCampanha.findMany({ where: { campanhaId: id }, orderBy: { criadoEm: "desc" } });
  return NextResponse.json(encontros);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Só o Oráculo pode criar combates." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  if (!corpo?.nome?.trim()) return NextResponse.json({ erro: "O combate precisa de um nome." }, { status: 400 });

  const encontro = await db.encontroCampanha.create({
    data: {
      campanhaId: id,
      monstroId: corpo.monstroId ?? null,
      nome: corpo.nome.trim(),
      vida: Number.isFinite(corpo.vida) ? Math.max(0, Math.round(corpo.vida)) : 1,
    },
  });

  return NextResponse.json(encontro, { status: 201 });
}
