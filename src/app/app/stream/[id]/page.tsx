import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { EstudioStream } from "@/components/stream/EstudioStream";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";
import type { CenaDeStream } from "@/lib/tipos";

export default async function PaginaEstudioStream({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const campanha = await db.campanha.findUnique({
    where: { id },
    include: { jogadores: { include: { usuario: true, personagem: true } } },
  });
  if (!campanha) notFound();

  const ehOraculo = campanha.oraculoId === sessao.usuarioId;
  const meuVinculo = campanha.jogadores.find((j) => j.usuarioId === sessao.usuarioId);
  if (!ehOraculo && meuVinculo?.status !== "aprovado") notFound();

  const jogadores = campanha.jogadores
    .filter((j) => j.status === "aprovado")
    .map((j) => ({
      usuarioId: j.usuarioId,
      nome: j.usuario.nome,
      personagemNome: j.personagem?.nome ?? null,
      personagemIlustracaoUrl: j.personagem?.ilustracaoCompletaUrl ?? j.personagem?.ilustracaoUrl ?? null,
      vidaAtual: j.personagem?.vidaAtual ?? null,
      vidaMax: j.personagem?.vidaMax ?? null,
      estaminaAtual: j.personagem?.estaminaAtual ?? null,
      estaminaMax: j.personagem?.estaminaMax ?? null,
    }));

  const cenaDb = await db.cenaDeStream.upsert({
    where: { campanhaId: id },
    update: {},
    create: { campanhaId: id },
  });

  const cenaInicial: CenaDeStream = {
    layout: cenaDb.layout as CenaDeStream["layout"],
    camerasConfig: JSON.parse(cenaDb.camerasConfig),
    fundoId: cenaDb.fundoId,
    fundoCustomUrl: cenaDb.fundoCustomUrl,
    tituloCena: cenaDb.tituloCena,
    overlayAtivo: cenaDb.overlayAtivo,
  };

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref={`/app/campanhas/${id}`} />
      </div>
      <EstudioStream
        campanhaId={id}
        usuarioId={sessao.usuarioId}
        ehOraculo={ehOraculo}
        jogadores={jogadores}
        cenaInicial={cenaInicial}
      />
    </>
  );
}
