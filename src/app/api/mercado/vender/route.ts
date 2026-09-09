import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { regrasDaCasaPadrao, type ItemPersonagem } from "@/lib/tipos";

/** Vende de volta um item do inventário do próprio personagem por uma fração do preço de compra
 * (regra da casa da campanha em que ele joga — cai no padrão de 50% se não achar nenhuma). */
export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const corpo = await req.json().catch(() => null);
  const personagemId: string | undefined = corpo?.personagemId;
  const indice: number | undefined = corpo?.indice;
  if (!personagemId || typeof indice !== "number") {
    return NextResponse.json({ erro: "Escolha o item a vender." }, { status: 400 });
  }

  const personagem = await db.personagem.findUnique({ where: { id: personagemId } });
  if (!personagem || personagem.usuarioId !== sessao.usuarioId) {
    return NextResponse.json({ erro: "Personagem não encontrado." }, { status: 404 });
  }

  const itens: ItemPersonagem[] = JSON.parse(personagem.itens);
  const item = itens[indice];
  if (!item) return NextResponse.json({ erro: "Item não encontrado no inventário." }, { status: 404 });

  const vinculo = await db.campanhaJogador.findFirst({
    where: { personagemId, status: "aprovado" },
    include: { campanha: true },
  });
  let fracaoVenda = regrasDaCasaPadrao().fracaoVendaMercado;
  if (vinculo) {
    try {
      fracaoVenda = { ...regrasDaCasaPadrao(), ...JSON.parse(vinculo.campanha.regrasDaCasa) }.fracaoVendaMercado;
    } catch {
      // mantém o padrão
    }
  }

  const reembolso = item.precoCompra ? Math.round(item.precoCompra * fracaoVenda) : 0;
  const restantes = itens.filter((_, i) => i !== indice);
  const novoSaldo = personagem.dracmas + reembolso;

  const [atualizado] = await db.$transaction([
    db.personagem.update({
      where: { id: personagemId },
      data: { dracmas: novoSaldo, itens: JSON.stringify(restantes) },
    }),
    db.transacao.create({
      data: {
        personagemId,
        campanhaId: vinculo?.campanhaId ?? null,
        tipo: "venda",
        valor: reembolso,
        motivo: `Venda no Mercado: ${item.nome}`,
        autorId: sessao.usuarioId,
      },
    }),
  ]);

  return NextResponse.json({ saldo: atualizado.dracmas, reembolso });
}
