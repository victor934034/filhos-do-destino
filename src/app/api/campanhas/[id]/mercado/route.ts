import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";
import { paraItemCompendio } from "@/lib/itemCompendioDb";

/**
 * GET — vitrine do Mercado desta campanha específica: só os itens que o Oráculo
 * desta campanha liberou (ItemDeCampanha.disponivelNoMercado), nunca o catálogo
 * inteiro do site. Jogadores e o próprio Oráculo podem ver.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso a esta campanha." }, { status: 403 });
  }

  const disponiveis = await db.itemDeCampanha.findMany({
    where: { campanhaId: id, disponivelNoMercado: true },
    include: { item: true },
    orderBy: { criadoEm: "asc" },
  });

  const itens = disponiveis.map((d) => ({
    ...paraItemCompendio(d.item),
    preco: d.precoNestaCampanha ?? d.item.preco,
  }));

  return NextResponse.json(itens);
}
