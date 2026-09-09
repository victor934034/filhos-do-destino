import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";
import { EntradaSuave } from "@/components/ui/EntradaSuave";

export default async function PaginaCampanhas() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const [comoOraculo, comoJogador] = await Promise.all([
    db.campanha.findMany({
      where: { oraculoId: sessao.usuarioId },
      orderBy: { criadoEm: "desc" },
      include: { jogadores: true },
    }),
    db.campanhaJogador.findMany({
      where: { usuarioId: sessao.usuarioId },
      include: { campanha: { include: { jogadores: true } } },
      orderBy: { criadoEm: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-gravado text-xs uppercase tracking-widest text-egeu">Registro do Oráculo</p>
          <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">Suas Campanhas</h1>
          <p className="mt-2 max-w-lg text-sm text-foreground/70">Como Oráculo ou como semideus em jogo.</p>
        </div>
        <div className="flex gap-3">
          <BotaoLink href="/app/campanhas/buscar" variante="fantasma">
            Encontrar Mesa
          </BotaoLink>
          <BotaoLink href="/app/campanhas/nova">Nova Campanha</BotaoLink>
        </div>
      </div>
      <Divisor className="mt-5" />

      <section className="mt-10">
        <h2 className="font-titulo text-xs uppercase tracking-[0.16em] text-bronze">Como Oráculo</h2>
        {comoOraculo.length === 0 ? (
          <ColunaFrame className="mt-3 p-6 text-sm text-foreground/60">
            Você ainda não mestra nenhuma campanha.{" "}
            <Link href="/app/campanhas/nova" className="text-bronze hover:underline">
              Comece uma agora.
            </Link>
          </ColunaFrame>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {comoOraculo.map((c, i) => (
              <EntradaSuave key={c.id} atraso={Math.min(i * 0.05, 0.3)}>
                <CardCampanha
                  id={c.id}
                  nome={c.nome}
                  tom={c.tom}
                  capaUrl={c.capaUrl}
                  sub={`${c.jogadores.filter((j) => j.status === "aprovado").length}/${c.vagasMaximas} jogadores`}
                />
              </EntradaSuave>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-titulo text-xs uppercase tracking-[0.16em] text-bronze">Como Jogador</h2>
        {comoJogador.length === 0 ? (
          <ColunaFrame className="mt-3 p-6 text-sm text-foreground/60">
            Você ainda não entrou em nenhuma campanha.{" "}
            <Link href="/app/campanhas/buscar" className="text-bronze hover:underline">
              Procure uma mesa.
            </Link>
          </ColunaFrame>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {comoJogador.map((j, i) => (
              <EntradaSuave key={j.id} atraso={Math.min(i * 0.05, 0.3)}>
                <CardCampanha
                  id={j.campanha.id}
                  nome={j.campanha.nome}
                  tom={j.campanha.tom}
                  capaUrl={j.campanha.capaUrl}
                  sub={
                    j.status === "aprovado"
                      ? "Em jogo"
                      : j.status === "pendente"
                        ? "Aguardando aprovação do Oráculo"
                        : "Solicitação recusada"
                  }
                />
              </EntradaSuave>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CardCampanha({
  id,
  nome,
  tom,
  sub,
  capaUrl,
}: {
  id: string;
  nome: string;
  tom: string;
  sub: string;
  capaUrl: string | null;
}) {
  return (
    <Link href={`/app/campanhas/${id}`}>
      <ColunaFrame className="overflow-hidden p-0 transition hover:-translate-y-0.5">
        <div className="relative h-28 w-full bg-noite-alta">
          {capaUrl ? (
            <Image src={capaUrl} alt={nome} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="h-7 w-7 rotate-45 border border-ouro/50" />
            </div>
          )}
        </div>
        <div className="p-5">
          {tom && <span className="font-gravado text-[11px] uppercase tracking-widest text-egeu">{tom}</span>}
          <h3 className="mt-1 font-titulo text-lg text-pergaminho">{nome}</h3>
          <p className="mt-2 text-xs text-foreground/60">{sub}</p>
        </div>
      </ColunaFrame>
    </Link>
  );
}
