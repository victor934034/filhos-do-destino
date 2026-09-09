import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

/**
 * O Oráculo convida diretamente um amigo para a campanha (única forma de entrar
 * numa campanha privada). Como já são amigos, o vínculo entra direto como aprovado.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id }, include: { jogadores: true } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  const usuarioId = corpo?.usuarioId as string | undefined;
  if (!usuarioId) return NextResponse.json({ erro: "Escolha quem convidar." }, { status: 400 });

  const amizade = await db.amizade.findFirst({
    where: {
      status: "aceita",
      OR: [
        { solicitanteId: sessao.usuarioId, destinatarioId: usuarioId },
        { solicitanteId: usuarioId, destinatarioId: sessao.usuarioId },
      ],
    },
  });
  if (!amizade) {
    return NextResponse.json({ erro: "Só é possível convidar amigos." }, { status: 403 });
  }

  const aprovados = campanha.jogadores.filter((j) => j.status === "aprovado").length;
  const jaEsta = campanha.jogadores.find((j) => j.usuarioId === usuarioId);
  if (!jaEsta && aprovados >= campanha.vagasMaximas) {
    return NextResponse.json({ erro: "Não há mais vagas nesta campanha." }, { status: 409 });
  }

  await db.campanhaJogador.upsert({
    where: { campanhaId_usuarioId: { campanhaId: id, usuarioId } },
    update: { status: "aprovado" },
    create: { campanhaId: id, usuarioId, status: "aprovado" },
  });

  return NextResponse.json({ ok: true });
}
