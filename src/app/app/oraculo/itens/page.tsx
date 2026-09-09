import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";

export default async function PaginaCompendioItens() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const itens = await db.itemCompendio.findMany({
    where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] },
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Compêndio</p>
          <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">
            Armas, relíquias e legados
          </h1>
          <Divisor className="mt-3" />
        </div>
        <BotaoLink href="/app/oraculo/itens/novo">+ Criar Item</BotaoLink>
      </div>

      {itens.length === 0 ? (
        <ColunaFrame className="mt-10 p-14 text-center">
          <p className="font-titulo text-lg text-pergaminho">O compêndio está vazio</p>
          <p className="mt-2 text-sm text-foreground/60">
            Cadastre a primeira arma ou relíquia da sua mesa.
          </p>
        </ColunaFrame>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((it) => {
            const editavel = it.oraculoId === sessao.usuarioId;
            const rotulo = it.oficial ? "Oficial" : it.oraculoId === sessao.usuarioId ? "Seu item" : "Comunidade";
            const corRotulo = it.oficial ? "text-ouro" : "text-egeu";
            return (
              <Link key={it.id} href={editavel ? `/app/oraculo/itens/${it.id}` : "#"}>
                <ColunaFrame className={`overflow-hidden p-0 ${editavel ? "transition hover:-translate-y-0.5 hover:border-ouro" : "opacity-90"}`}>
                  <div className="relative h-32 w-full bg-noite-alta">
                    {it.ilustracaoUrl ? (
                      <Image src={it.ilustracaoUrl} alt={it.nome} fill className="object-cover" />
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
                      {it.tipo}
                    </span>
                    <h3 className="mt-1 font-titulo text-lg text-pergaminho">{it.nome}</h3>
                    {it.dadoDeDano && <p className="mt-1 font-gravado text-xs text-terracota">{it.dadoDeDano}</p>}
                    {it.preco > 0 && (
                      <p className="mt-1 flex items-center gap-1 font-gravado text-xs text-ouro">
                        <span className="relative h-5 w-5 shrink-0">
                          <Image src="/icons/selos/selo-dracma.png" alt="" fill className="object-contain" />
                        </span>
                        {it.preco} Dracmas
                      </p>
                    )}
                    {it.efeito && <p className="mt-2 text-xs text-foreground/60">{it.efeito}</p>}
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
