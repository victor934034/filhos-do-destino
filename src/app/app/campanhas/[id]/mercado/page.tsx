import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";
import { paraItemCompendio } from "@/lib/itemCompendioDb";
import { PainelMercadoCampanha } from "@/components/mercado/PainelMercadoCampanha";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaMercadoCampanha({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) notFound();

  const [disponiveis, meusPersonagensAqui, meusItens, vinculos] = await Promise.all([
    db.itemDeCampanha.findMany({
      where: { campanhaId: id, disponivelNoMercado: true },
      include: { item: true },
      orderBy: { criadoEm: "asc" },
    }),
    db.campanhaJogador.findMany({
      where: { campanhaId: id, usuarioId: sessao.usuarioId, status: "aprovado", personagemId: { not: null } },
      include: { personagem: true },
    }),
    ehOraculo
      ? db.itemCompendio.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } })
      : Promise.resolve([]),
    ehOraculo ? db.itemDeCampanha.findMany({ where: { campanhaId: id } }) : Promise.resolve([]),
  ]);

  const itensDaLoja = disponiveis.map((d) => ({
    ...paraItemCompendio(d.item),
    preco: d.precoNestaCampanha ?? d.item.preco,
  }));

  const vinculoPorItem = new Map(vinculos.map((v) => [v.itemId, v]));
  const itensParaGerenciar = meusItens.map((it) => {
    const v = vinculoPorItem.get(it.id);
    return {
      item: paraItemCompendio(it),
      disponivelNoMercado: v?.disponivelNoMercado ?? false,
      precoNestaCampanha: v?.precoNestaCampanha ?? null,
    };
  });

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref={`/app/campanhas/${id}`} />
      </div>
      <PainelMercadoCampanha
        campanhaId={id}
        ehOraculo={ehOraculo}
        itensDaLoja={itensDaLoja}
        itensParaGerenciar={itensParaGerenciar}
        meusPersonagens={meusPersonagensAqui
          .filter((j) => j.personagem)
          .map((j) => ({ id: j.personagem!.id, nome: j.personagem!.nome, dracmas: j.personagem!.dracmas }))}
      />
    </>
  );
}
