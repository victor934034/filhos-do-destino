import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || !ehOraculo) {
    return NextResponse.json({ erro: "Só o Oráculo pode avançar o turno." }, { status: 403 });
  }

  const mesa = await db.sessaoAoVivo.findUnique({ where: { campanhaId: id } });
  if (!mesa) return NextResponse.json({ erro: "Mesa ainda não iniciada." }, { status: 404 });

  const ordem: unknown[] = JSON.parse(mesa.ordemIniciativa);
  const proximo = ordem.length > 0 ? (mesa.turnoAtual + 1) % ordem.length : 0;

  const atualizada = await db.sessaoAoVivo.update({
    where: { campanhaId: id },
    data: { turnoAtual: proximo },
  });

  return NextResponse.json({ turnoAtual: atualizada.turnoAtual });
}
