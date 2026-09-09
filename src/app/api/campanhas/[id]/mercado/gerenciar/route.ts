import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraItemCompendio } from "@/lib/itemCompendioDb";

/** Só o Oráculo desta campanha: lista os próprios itens do Compêndio com o estado atual no Mercado dela. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Só o Oráculo desta campanha pode gerenciar o Mercado." }, { status: 403 });
  }

  const [itens, vinculos] = await Promise.all([
    db.itemCompendio.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } }),
    db.itemDeCampanha.findMany({ where: { campanhaId: id } }),
  ]);

  const vinculoPorItem = new Map(vinculos.map((v) => [v.itemId, v]));

  return NextResponse.json(
    itens.map((it) => {
      const vinculo = vinculoPorItem.get(it.id);
      return {
        item: paraItemCompendio(it),
        disponivelNoMercado: vinculo?.disponivelNoMercado ?? false,
        precoNestaCampanha: vinculo?.precoNestaCampanha ?? null,
      };
    })
  );
}
