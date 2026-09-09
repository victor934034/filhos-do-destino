import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { PainelChavesApi } from "@/components/configuracoes/PainelChavesApi";
import { PainelPrivacidadePersonagens } from "@/components/configuracoes/PainelPrivacidadePersonagens";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaConfiguracoes() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const [chaves, personagens] = await Promise.all([
    db.chaveApi.findMany({
      where: { usuarioId: sessao.usuarioId },
      orderBy: { criadoEm: "desc" },
      select: { id: true, nome: true, prefixo: true, criadoEm: true, ultimoUsoEm: true },
    }),
    db.personagem.findMany({
      where: { usuarioId: sessao.usuarioId },
      orderBy: { criadoEm: "desc" },
      select: { id: true, nome: true, bloqueadoParaJogadores: true, permiteControleMestre: true },
    }),
  ]);

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app" />
      </div>
      <PainelChavesApi
        inicial={chaves.map((c) => ({
          ...c,
          criadoEm: c.criadoEm.toISOString(),
          ultimoUsoEm: c.ultimoUsoEm?.toISOString() ?? null,
        }))}
      />
      <div className="mx-auto max-w-3xl px-5">
        <PainelPrivacidadePersonagens inicial={personagens} />
      </div>
    </>
  );
}
