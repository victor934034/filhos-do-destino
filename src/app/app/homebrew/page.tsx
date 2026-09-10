import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { Divisor } from "@/components/ui/Divisor";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";
import { PainelHomebrew } from "@/components/homebrew/PainelHomebrew";

export default async function PaginaHomebrew() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const [monstros, itens, poderes] = await Promise.all([
    db.monstro.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } }),
    db.itemCompendio.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } }),
    db.poderCompendio.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="px-0 pb-2">
        <BotaoVoltar fallbackHref="/app" />
      </div>
      <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Sua oficina</p>
      <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">Homebrew</h1>
      <Divisor className="mt-3" />
      <p className="mt-3 max-w-xl text-sm text-foreground/70">
        Tudo o que você criou — monstros que só o Oráculo usa nas suas mesas, itens e poderes sob
        medida. Fica privado até você decidir compartilhar com a comunidade (veja no Bestiário/Compêndio).
      </p>

      <PainelHomebrew monstros={monstros} itens={itens} poderes={poderes} />
    </div>
  );
}
