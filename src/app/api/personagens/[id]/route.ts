import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraDb, paraFicha } from "@/lib/personagemDb";
import type { FichaPersonagem } from "@/lib/tipos";

async function carregarDoUsuario(id: string, usuarioId: string) {
  const p = await db.personagem.findUnique({ where: { id } });
  if (!p || p.usuarioId !== usuarioId) return null;
  return p;
}

/**
 * Um Oráculo só pode mexer na ficha de outro jogador se: o personagem está numa
 * campanha que ele mestra, o vínculo está aprovado, e o jogador deu consentimento
 * (permiteControleMestre). Mesmo assim, só Vida/Estamina — o resto da ficha é do dono.
 */
async function carregarComoOraculoAutorizado(id: string, oraculoId: string) {
  const p = await db.personagem.findUnique({ where: { id } });
  if (!p || !p.permiteControleMestre) return null;

  const vinculo = await db.campanhaJogador.findFirst({
    where: { personagemId: id, status: "aprovado", campanha: { oraculoId } },
  });
  return vinculo ? p : null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const p = await carregarDoUsuario(id, sessao.usuarioId);
  if (!p) return NextResponse.json({ erro: "Personagem não encontrado." }, { status: 404 });

  return NextResponse.json(paraFicha(p));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const corpo = (await req.json()) as FichaPersonagem;

  const dono = await carregarDoUsuario(id, sessao.usuarioId);
  if (dono) {
    const atualizado = await db.personagem.update({ where: { id }, data: paraDb(corpo) });
    return NextResponse.json(paraFicha(atualizado));
  }

  const autorizadoComoOraculo = await carregarComoOraculoAutorizado(id, sessao.usuarioId);
  if (autorizadoComoOraculo) {
    const max = { vida: autorizadoComoOraculo.vidaMax, estamina: autorizadoComoOraculo.estaminaMax };
    const vidaAtual = Math.max(0, Math.min(max.vida, corpo.vidaAtual ?? autorizadoComoOraculo.vidaAtual));
    const estaminaAtual = Math.max(
      0,
      Math.min(max.estamina, corpo.estaminaAtual ?? autorizadoComoOraculo.estaminaAtual)
    );
    const atualizado = await db.personagem.update({
      where: { id },
      data: { vidaAtual, estaminaAtual },
    });
    return NextResponse.json(paraFicha(atualizado));
  }

  return NextResponse.json({ erro: "Personagem não encontrado." }, { status: 404 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await carregarDoUsuario(id, sessao.usuarioId);
  if (!existente) return NextResponse.json({ erro: "Personagem não encontrado." }, { status: 404 });

  await db.personagem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
