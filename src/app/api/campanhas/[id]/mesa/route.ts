import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";
import { paraSessao } from "@/lib/sessaoDb";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso à mesa desta campanha." }, { status: 403 });
  }

  const mesa = await db.sessaoAoVivo.upsert({
    where: { campanhaId: id },
    update: {},
    create: { campanhaId: id },
    include: { eventos: true },
  });

  return NextResponse.json(paraSessao(mesa));
}
