import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";
import type { ParticipanteIniciativa } from "@/lib/tipos";

/** Só o Oráculo ajusta a Vida de um monstro em cena — personagens usam a própria rota. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || !ehOraculo) {
    return NextResponse.json({ erro: "Só o Oráculo pode ajustar a Vida de um monstro." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  const index: number = corpo?.index;
  const vidaAtual: number = corpo?.vidaAtual;
  if (typeof index !== "number" || typeof vidaAtual !== "number") {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const mesa = await db.sessaoAoVivo.findUnique({ where: { campanhaId: id } });
  if (!mesa) return NextResponse.json({ erro: "Mesa ainda não iniciada." }, { status: 404 });

  const ordem: ParticipanteIniciativa[] = JSON.parse(mesa.ordemIniciativa);
  const alvo = ordem[index];
  if (!alvo || alvo.tipo !== "monstro" || alvo.vidaMax == null) {
    return NextResponse.json({ erro: "Participante inválido." }, { status: 400 });
  }

  alvo.vidaAtual = Math.max(0, Math.min(alvo.vidaMax, vidaAtual));

  const atualizada = await db.sessaoAoVivo.update({
    where: { campanhaId: id },
    data: { ordemIniciativa: JSON.stringify(ordem) },
  });

  return NextResponse.json({ ordemIniciativa: JSON.parse(atualizada.ordemIniciativa) });
}
