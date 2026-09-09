import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraFicha } from "@/lib/personagemDb";
import { BotaoLink } from "@/components/ui/Botao";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { BarraEssencia } from "@/components/ui/BarraEssencia";
import { Divisor } from "@/components/ui/Divisor";
import { EntradaSuave } from "@/components/ui/EntradaSuave";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function PaginaPersonagens() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const personagens = (
    await db.personagem.findMany({
      where: { usuarioId: sessao.usuarioId },
      orderBy: { criadoEm: "desc" },
    })
  ).map(paraFicha);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-gravado text-xs uppercase tracking-widest text-egeu">Panteão pessoal</p>
          <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">Seus Semideuses</h1>
          <p className="mt-2 max-w-lg text-sm text-foreground/70">
            Os personagens que carregam seu sangue divino por Lua Nova.
          </p>
        </div>
        <BotaoLink href="/app/personagens/novo">Criar Personagem</BotaoLink>
      </div>
      <Divisor className="mt-5" />

      {personagens.length === 0 ? (
        <ColunaFrame variante="pergaminho" className="mt-10 px-10 py-20 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-bronze/40">
            <span className="h-7 w-7 rotate-45 border border-bronze" />
          </span>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-tinta/80">
            Você ainda não despertou nenhum semideus. Que tal descobrir de qual casa divina corre
            o seu sangue?
          </p>
          <BotaoLink href="/app/personagens/novo" className="mt-8 inline-flex">
            Criar meu primeiro personagem
          </BotaoLink>
        </ColunaFrame>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {personagens.map((p, i) => (
            <EntradaSuave key={p.id} atraso={Math.min(i * 0.05, 0.3)}>
              <Link href={`/app/personagens/${p.id}`}>
                <ColunaFrame className="p-5 transition hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(201,162,75,0.6),0_16px_32px_-16px_rgba(27,26,23,0.6)]">
                  <div className="flex items-center gap-3">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ouro/50 bg-noite">
                      {p.ilustracaoUrl ? (
                        <Image src={p.ilustracaoUrl} alt={p.nome} fill className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-ouro/40">
                          <span className="h-3.5 w-3.5 rotate-45 border border-ouro/60" />
                        </span>
                      )}
                    </span>
                    <div>
                      <span className="font-gravado text-[11px] uppercase tracking-widest text-egeu">
                        Filho(a) de {p.parenteDivino} · {p.armamento}
                      </span>
                      <h3 className="font-titulo text-xl text-pergaminho">{p.nome}</h3>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <BarraEssencia label="Vida" atual={p.vidaAtual} maximo={p.vidaMax} tipo="vida" />
                    <BarraEssencia label="Estamina" atual={p.estaminaAtual} maximo={p.estaminaMax} tipo="estamina" />
                  </div>
                </ColunaFrame>
              </Link>
            </EntradaSuave>
          ))}
        </div>
      )}
    </div>
  );
}
