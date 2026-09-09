import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";

export default async function PaginaCompendioPoderes() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const poderes = await db.poderCompendio.findMany({
    where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] },
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Compêndio</p>
          <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">
            Poderes e Habilidades
          </h1>
          <Divisor className="mt-3" />
        </div>
        <BotaoLink href="/app/oraculo/poderes/novo">+ Criar Poder</BotaoLink>
      </div>

      {poderes.length === 0 ? (
        <ColunaFrame className="mt-10 p-14 text-center">
          <p className="font-titulo text-lg text-pergaminho">Nenhum poder cadastrado ainda</p>
          <p className="mt-2 text-sm text-foreground/60">
            Crie habilidades sob medida para seus personagens ou para a comunidade.
          </p>
        </ColunaFrame>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {poderes.map((p) => {
            const editavel = p.oraculoId === sessao.usuarioId;
            const rotulo = p.oficial ? "Oficial" : p.oraculoId === sessao.usuarioId ? "Seu poder" : "Comunidade";
            const corRotulo = p.oficial ? "text-ouro" : "text-egeu";
            return (
              <Link key={p.id} href={editavel ? `/app/oraculo/poderes/${p.id}` : "#"}>
                <ColunaFrame className={`overflow-hidden p-0 ${editavel ? "transition hover:-translate-y-0.5 hover:border-ouro" : "opacity-90"}`}>
                  <div className="relative h-32 w-full bg-noite-alta">
                    {p.ilustracaoUrl ? (
                      <Image src={p.ilustracaoUrl} alt={p.nome} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="h-7 w-7 rotate-45 border border-ouro/50" />
                      </div>
                    )}
                    <span className={`absolute left-3 top-3 rounded-full border border-current bg-noite/80 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest ${corRotulo}`}>
                      {rotulo}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="font-gravado text-[11px] uppercase tracking-widest text-foreground/50">
                      {p.tipoAcao} · {p.custoEstamina} Est · {p.duracao}
                    </span>
                    <h3 className="mt-1 font-titulo text-lg text-pergaminho">{p.nome}</h3>
                    {p.efeito && <p className="mt-2 line-clamp-2 text-xs text-foreground/60">{p.efeito}</p>}
                  </div>
                </ColunaFrame>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
