import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

/** O próprio jogador vincula (ou troca) qual dos seus personagens está levando para esta campanha. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const vinculo = await db.campanhaJogador.findUnique({
    where: { campanhaId_usuarioId: { campanhaId: id, usuarioId: sessao.usuarioId } },
  });
  if (!vinculo) return NextResponse.json({ erro: "Você não faz parte desta campanha." }, { status: 404 });

  const corpo = await req.json().catch(() => ({}));
  const personagemId: string | null = corpo.personagemId || null;

  if (personagemId) {
    const personagem = await db.personagem.findUnique({ where: { id: personagemId } });
    if (!personagem || personagem.usuarioId !== sessao.usuarioId) {
      return NextResponse.json({ erro: "Personagem não encontrado." }, { status: 404 });
    }
  }

  await db.campanhaJogador.update({ where: { id: vinculo.id }, data: { personagemId } });
  return NextResponse.json({ ok: true });
}
