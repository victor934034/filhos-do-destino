import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";

export default async function PaginaBestiario() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const monstros = await db.monstro.findMany({
    where: { OR: [{ oraculoId: sessao.usuarioId }, { publico: true }] },
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Bestiário</p>
          <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">
            Ameaças de Lua Nova
          </h1>
          <Divisor className="mt-3" />
          <p className="mt-3 max-w-xl text-sm text-foreground/70">
            Suas criações ficam privadas até você compartilhar com a comunidade. Monstros{" "}
            <span className="text-ouro">Oficiais</span> são curados pelos admins.
          </p>
        </div>
        <BotaoLink href="/app/oraculo/monstros/novo">+ Criar Monstro</BotaoLink>
      </div>

      {monstros.length === 0 ? (
        <ColunaFrame className="mt-10 p-14 text-center">
          <p className="font-titulo text-lg text-pergaminho">Nenhuma ameaça cadastrada ainda</p>
          <p className="mt-2 text-sm text-foreground/60">
            Crie o primeiro monstro da sua mesa — ele fica só com você até você decidir compartilhar.
          </p>
        </ColunaFrame>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {monstros.map((m) => {
            const editavel = m.oraculoId === sessao.usuarioId;
            const rotulo = m.oficial ? "Oficial" : m.oraculoId === sessao.usuarioId ? "Seu monstro" : "Comunidade";
            const corRotulo = m.oficial ? "text-ouro" : "text-egeu";
            return (
              <Link key={m.id} href={editavel ? `/app/oraculo/monstros/${m.id}` : "#"}>
                <ColunaFrame className={`overflow-hidden p-0 ${editavel ? "transition hover:-translate-y-0.5 hover:border-ouro" : "opacity-90"}`}>
                  <div className="relative h-36 w-full bg-noite-alta">
                    {m.ilustracaoUrl ? (
                      <Image src={m.ilustracaoUrl} alt={m.nome} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="h-8 w-8 rotate-45 border border-ouro/50" />
                      </div>
                    )}
                    <span className={`absolute left-3 top-3 rounded-full border border-current bg-noite/80 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest ${corRotulo}`}>
                      {rotulo}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-titulo text-lg text-pergaminho">{m.nome}</h3>
                    <p className="mt-2 text-xs text-foreground/60">
                      Vida {m.vida} · Áspis {m.aspis} · Ataque por {m.atributoAtaque}
                    </p>
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
