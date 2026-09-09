import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraCampanha, INCLUDE_CAMPANHA_COMPLETA } from "@/lib/campanhaDb";
import { paraFicha } from "@/lib/personagemDb";
import { paraMonstro } from "@/lib/monstroDb";
import { EscudoOraculo } from "@/components/campanha/EscudoOraculo";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

// Nível 3 — Escudo do Oráculo: só o mestre desta campanha entra aqui.
export default async function PaginaEscudoOraculo({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const c = await db.campanha.findUnique({ where: { id }, include: INCLUDE_CAMPANHA_COMPLETA });
  if (!c) notFound();

  const ehOraculo = c.oraculoId === sessao.usuarioId;
  if (!ehOraculo) notFound();

  const personagensEmJogo = c.jogadores
    .filter((j) => j.status === "aprovado" && j.personagem)
    .map((j) => ({ ...paraFicha(j.personagem!), donoUsuarioId: j.usuarioId }));

  const monstrosDisponiveis = (
    await db.monstro.findMany({ where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] } })
  ).map(paraMonstro);

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref={`/app/campanhas/${id}`} />
      </div>
      <EscudoOraculo
        campanhaInicial={paraCampanha(c)}
        usuarioId={sessao.usuarioId}
        nomeUsuario={sessao.nome}
        personagensIniciais={personagensEmJogo}
        monstrosDisponiveis={monstrosDisponiveis}
      />
    </>
  );
}
