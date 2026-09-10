import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraFicha, paraFichaLimitada } from "@/lib/personagemDb";
import { paraMonstro } from "@/lib/monstroDb";
import { MesaAoVivo } from "@/components/mesa/MesaAoVivo";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

// Nível 4 — Mesa Ao Vivo completa: narração, chat, fichas em tempo real, iniciativa.
export default async function PaginaMesaAoVivo({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const c = await db.campanha.findUnique({ where: { id }, include: { jogadores: true } });
  if (!c) notFound();

  const ehOraculo = c.oraculoId === sessao.usuarioId;
  const meuVinculo = c.jogadores.find((j) => j.usuarioId === sessao.usuarioId) ?? null;
  const acessoLiberado = ehOraculo || meuVinculo?.status === "aprovado";
  if (!acessoLiberado) notFound();

  const jogadoresComPersonagem = c.jogadores.filter((j) => j.status === "aprovado" && j.personagemId);

  // Antes buscava um personagem por vez (N idas e voltas ao banco, uma por jogador) — uma
  // única findMany com "in" resolve todo mundo numa consulta só, e roda em paralelo com a
  // busca de monstros (que não depende dela), já que o banco agora é remoto.
  const [personagensRaw, monstrosRaw] = await Promise.all([
    db.personagem.findMany({
      where: { id: { in: jogadoresComPersonagem.map((j) => j.personagemId!) } },
    }),
    ehOraculo
      ? db.monstro.findMany({ where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] } })
      : Promise.resolve([]),
  ]);

  const personagensPorId = new Map(personagensRaw.map((p) => [p.id, p]));
  const personagensEmJogo = jogadoresComPersonagem
    .map((j) => {
      const p = personagensPorId.get(j.personagemId!);
      if (!p) return null;
      const vejoTudo = ehOraculo || j.usuarioId === sessao.usuarioId || !p.bloqueadoParaJogadores;
      return vejoTudo
        ? { ...paraFicha(p), donoUsuarioId: j.usuarioId }
        : { ...paraFichaLimitada(p), donoUsuarioId: j.usuarioId };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const monstrosDisponiveis = monstrosRaw.map(paraMonstro);

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref={`/app/campanhas/${id}`} />
      </div>
      <MesaAoVivo
        campanhaId={id}
        campanhaNome={c.nome}
        usuarioId={sessao.usuarioId}
        nomeUsuario={sessao.nome}
        ehOraculo={ehOraculo}
        personagensIniciais={personagensEmJogo}
        monstrosDisponiveis={monstrosDisponiveis}
      />
    </>
  );
}
