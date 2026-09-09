import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

/** O Oráculo desta campanha liga/desliga um item do próprio Compêndio no Mercado dela, com preço opcional. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id, itemId } = await params;
  const campanha = await db.campanha.findUnique({ where: { id } });
  if (!campanha || campanha.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Só o Oráculo desta campanha pode gerenciar o Mercado." }, { status: 403 });
  }

  const item = await db.itemCompendio.findUnique({ where: { id: itemId } });
  if (!item || item.oraculoId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Item não encontrado no seu Compêndio." }, { status: 404 });
  }

  const corpo = await req.json().catch(() => ({}));
  const disponivelNoMercado = !!corpo.disponivelNoMercado;
  const precoNestaCampanha =
    corpo.precoNestaCampanha === null || corpo.precoNestaCampanha === undefined || corpo.precoNestaCampanha === ""
      ? null
      : Number(corpo.precoNestaCampanha);

  const vinculo = await db.itemDeCampanha.upsert({
    where: { campanhaId_itemId: { campanhaId: id, itemId } },
    update: { disponivelNoMercado, precoNestaCampanha },
    create: { campanhaId: id, itemId, disponivelNoMercado, precoNestaCampanha },
  });

  return NextResponse.json(vinculo);
}
