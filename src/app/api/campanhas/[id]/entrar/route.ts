import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id }, include: { jogadores: true } });
  if (!campanha) return NextResponse.json({ erro: "Campanha não encontrada." }, { status: 404 });
  if (campanha.visibilidade !== "publica") {
    return NextResponse.json({ erro: "Esta campanha exige convite direto." }, { status: 403 });
  }
  if (campanha.jogadores.some((j) => j.usuarioId === sessao.usuarioId)) {
    return NextResponse.json({ erro: "Você já solicitou entrada nesta campanha." }, { status: 409 });
  }
  const aprovados = campanha.jogadores.filter((j) => j.status === "aprovado").length;
  if (aprovados >= campanha.vagasMaximas) {
    return NextResponse.json({ erro: "Não há mais vagas nesta campanha." }, { status: 409 });
  }

  const corpo = await req.json().catch(() => ({}));

  await db.campanhaJogador.create({
    data: {
      campanhaId: id,
      usuarioId: sessao.usuarioId,
      personagemId: corpo.personagemId ?? null,
      status: "pendente",
    },
  });

  return NextResponse.json({ ok: true });
}
