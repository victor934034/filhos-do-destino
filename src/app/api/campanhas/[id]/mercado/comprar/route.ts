import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import type { ItemPersonagem } from "@/lib/tipos";

/** Compra no Mercado desta campanha específica — só itens que o Oráculo dela liberou. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id: campanhaId } = await params;
  const corpo = await req.json().catch(() => null);
  const personagemId: string | undefined = corpo?.personagemId;
  const itemId: string | undefined = corpo?.itemId;
  if (!personagemId || !itemId) {
    return NextResponse.json({ erro: "Escolha o personagem e o item." }, { status: 400 });
  }

  const vinculoJogador = await db.campanhaJogador.findFirst({
    where: { campanhaId, personagemId, usuarioId: sessao.usuarioId, status: "aprovado" },
  });
  if (!vinculoJogador) {
    return NextResponse.json({ erro: "Esse personagem não está aprovado nesta campanha." }, { status: 403 });
  }

  const itemDeCampanha = await db.itemDeCampanha.findUnique({
    where: { campanhaId_itemId: { campanhaId, itemId } },
    include: { item: true },
  });
  if (!itemDeCampanha || !itemDeCampanha.disponivelNoMercado) {
    return NextResponse.json({ erro: "Este item não está à venda nesta campanha." }, { status: 404 });
  }

  const personagem = await db.personagem.findUnique({ where: { id: personagemId } });
  if (!personagem) return NextResponse.json({ erro: "Personagem não encontrado." }, { status: 404 });

  const preco = itemDeCampanha.precoNestaCampanha ?? itemDeCampanha.item.preco;
  if (personagem.dracmas < preco) {
    return NextResponse.json({ erro: "Dracmas insuficientes." }, { status: 400 });
  }

  const item = itemDeCampanha.item;
  const itensAtuais: ItemPersonagem[] = JSON.parse(personagem.itens);
  const novoItem: ItemPersonagem = {
    nome: item.nome,
    tipo: item.tipo === "legado" ? "narrativo" : (item.tipo as ItemPersonagem["tipo"]),
    dadoDeDano: item.dadoDeDano ?? undefined,
    multiplicadorCritico: item.multiplicadorCritico,
    descricao: item.efeito,
    precoCompra: preco,
  };

  const novoSaldo = personagem.dracmas - preco;
  const [atualizado] = await db.$transaction([
    db.personagem.update({
      where: { id: personagemId },
      data: { dracmas: novoSaldo, itens: JSON.stringify([...itensAtuais, novoItem]) },
    }),
    db.transacao.create({
      data: {
        personagemId,
        campanhaId,
        tipo: "compra",
        valor: -preco,
        motivo: `Compra no Mercado: ${item.nome}`,
        autorId: sessao.usuarioId,
      },
    }),
  ]);

  return NextResponse.json({ saldo: atualizado.dracmas, item: novoItem }, { status: 201 });
}
