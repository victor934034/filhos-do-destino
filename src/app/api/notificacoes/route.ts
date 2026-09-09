import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const [amizadesPendentes, solicitacoesCampanha] = await Promise.all([
    db.amizade.count({ where: { destinatarioId: sessao.usuarioId, status: "pendente" } }),
    db.campanhaJogador.count({
      where: { status: "pendente", campanha: { oraculoId: sessao.usuarioId } },
    }),
  ]);

  return NextResponse.json({ amizadesPendentes, solicitacoesCampanha });
}
