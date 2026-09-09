import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

/** Só os dois campos de privacidade — endpoint dedicado pra não precisar mandar a ficha inteira. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await db.personagem.findUnique({ where: { id } });
  if (!existente || existente.usuarioId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Personagem não encontrado." }, { status: 404 });
  }

  const corpo = await req.json().catch(() => ({}));
  const data: { bloqueadoParaJogadores?: boolean; permiteControleMestre?: boolean } = {};
  if (typeof corpo.bloqueadoParaJogadores === "boolean") data.bloqueadoParaJogadores = corpo.bloqueadoParaJogadores;
  if (typeof corpo.permiteControleMestre === "boolean") data.permiteControleMestre = corpo.permiteControleMestre;

  const atualizado = await db.personagem.update({ where: { id }, data });
  return NextResponse.json({
    bloqueadoParaJogadores: atualizado.bloqueadoParaJogadores,
    permiteControleMestre: atualizado.permiteControleMestre,
  });
}
