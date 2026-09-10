import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraCampanha, INCLUDE_CAMPANHA_COMPLETA } from "@/lib/campanhaDb";
import { paraFicha, paraFichaLimitada } from "@/lib/personagemDb";
import { paraMonstro } from "@/lib/monstroDb";
import { HubCampanha } from "@/components/campanha/HubCampanha";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaHubCampanha({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const c = await db.campanha.findUnique({ where: { id }, include: INCLUDE_CAMPANHA_COMPLETA });
  if (!c) notFound();

  const ehOraculo = c.oraculoId === sessao.usuarioId;
  const meuVinculoDb = c.jogadores.find((j) => j.usuarioId === sessao.usuarioId) ?? null;

  if (!ehOraculo && !meuVinculoDb && c.visibilidade !== "publica") notFound();

  const acessoLiberado = ehOraculo || meuVinculoDb?.status === "aprovado";

  // Nenhuma das duas depende da outra — paralelas em vez de sequenciais poupa uma ida e
  // volta inteira ao banco remoto a cada carregamento desta página.
  const [meusPersonagens, monstrosRaw] = await Promise.all([
    ehOraculo
      ? Promise.resolve([])
      : db.personagem.findMany({ where: { usuarioId: sessao.usuarioId }, select: { id: true, nome: true } }),
    acessoLiberado && ehOraculo
      ? db.monstro.findMany({ where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] } })
      : Promise.resolve([]),
  ]);

  // Dados da Mesa (aba Combates) e do grid de Semideuses — só quem tem acesso liberado precisa.
  const personagensEmJogo = acessoLiberado
    ? c.jogadores
        .filter((j) => j.status === "aprovado" && j.personagem)
        .map((j) => {
          const p = j.personagem!;
          const vejoTudo = ehOraculo || j.usuarioId === sessao.usuarioId || !p.bloqueadoParaJogadores;
          return vejoTudo
            ? { ...paraFicha(p), donoUsuarioId: j.usuarioId }
            : { ...paraFichaLimitada(p), donoUsuarioId: j.usuarioId };
        })
    : [];

  const monstrosDisponiveis = monstrosRaw.map(paraMonstro);

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/campanhas" />
      </div>
      <HubCampanha
        campanhaInicial={paraCampanha(c)}
        ehOraculo={ehOraculo}
        meuVinculo={meuVinculoDb ? { status: meuVinculoDb.status, personagemId: meuVinculoDb.personagemId } : null}
        meusPersonagens={meusPersonagens}
        usuarioId={sessao.usuarioId}
        nomeUsuario={sessao.nome}
        acessoLiberado={acessoLiberado}
        personagensIniciais={personagensEmJogo}
        monstrosDisponiveis={monstrosDisponiveis}
      />
    </>
  );
}
