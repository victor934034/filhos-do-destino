import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

const ABAS = [
  { chave: "monstros", nome: "Monstros" },
  { chave: "itens", nome: "Itens" },
  { chave: "poderes", nome: "Poderes" },
] as const;

type Aba = (typeof ABAS)[number]["chave"];

export default async function PaginaHomebrew({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { tab } = await searchParams;
  const aba: Aba = tab === "itens" || tab === "poderes" ? tab : "monstros";

  const [monstros, itens, poderes] = await Promise.all([
    db.monstro.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } }),
    db.itemCompendio.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } }),
    db.poderCompendio.findMany({ where: { oraculoId: sessao.usuarioId }, orderBy: { criadoEm: "desc" } }),
  ]);

  const contagens: Record<Aba, number> = {
    monstros: monstros.length,
    itens: itens.length,
    poderes: poderes.length,
  };

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

      <nav className="mt-8 flex gap-6 border-b border-[var(--border-sutil)]">
        {ABAS.map((a) => (
          <Link
            key={a.chave}
            href={`/app/homebrew?tab=${a.chave}`}
            className={`pb-3 font-titulo text-sm uppercase tracking-widest ${
              aba === a.chave ? "border-b-2 border-ouro text-ouro" : "text-foreground/50 hover:text-bronze"
            }`}
          >
            {a.nome} ({contagens[a.chave]})
          </Link>
        ))}
      </nav>

      {aba === "monstros" && (
        <div className="mt-8">
          <div className="flex justify-end">
            <BotaoLink href="/app/oraculo/monstros/novo">+ Criar Monstro</BotaoLink>
          </div>
          {monstros.length === 0 ? (
            <ColunaFrame className="mt-6 p-14 text-center">
              <p className="font-titulo text-lg text-pergaminho">Nenhum monstro criado ainda</p>
              <p className="mt-2 text-sm text-foreground/60">
                Crie ameaças sob medida para suas campanhas — só você (o Oráculo) pode usá-las.
              </p>
            </ColunaFrame>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {monstros.map((m) => (
                <Link key={m.id} href={`/app/oraculo/monstros/${m.id}`}>
                  <ColunaFrame className="overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-ouro">
                    <div className="relative h-36 w-full bg-noite-alta">
                      {m.ilustracaoUrl ? (
                        <Image src={m.ilustracaoUrl} alt={m.nome} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="h-8 w-8 rotate-45 border border-ouro/50" />
                        </div>
                      )}
                      {m.publico && (
                        <span className="absolute left-3 top-3 rounded-full border border-egeu bg-noite/80 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest text-egeu">
                          Compartilhado
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-titulo text-lg text-pergaminho">{m.nome}</h3>
                      <p className="mt-2 text-xs text-foreground/60">
                        Vida {m.vida} · Áspis {m.aspis} · Ataque por {m.atributoAtaque}
                      </p>
                    </div>
                  </ColunaFrame>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === "itens" && (
        <div className="mt-8">
          <div className="flex justify-end">
            <BotaoLink href="/app/oraculo/itens/novo">+ Criar Item</BotaoLink>
          </div>
          {itens.length === 0 ? (
            <ColunaFrame className="mt-6 p-14 text-center">
              <p className="font-titulo text-lg text-pergaminho">Nenhum item criado ainda</p>
              <p className="mt-2 text-sm text-foreground/60">Cadastre armas, relíquias ou itens narrativos próprios.</p>
            </ColunaFrame>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((it) => (
                <Link key={it.id} href={`/app/oraculo/itens/${it.id}`}>
                  <ColunaFrame className="overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-ouro">
                    <div className="relative h-32 w-full bg-noite-alta">
                      {it.ilustracaoUrl ? (
                        <Image src={it.ilustracaoUrl} alt={it.nome} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="h-7 w-7 rotate-45 border border-ouro/50" />
                        </div>
                      )}
                      {it.publico && (
                        <span className="absolute left-3 top-3 rounded-full border border-egeu bg-noite/80 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest text-egeu">
                          Compartilhado
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="font-gravado text-[11px] uppercase tracking-widest text-foreground/50">
                        {it.tipo}
                      </span>
                      <h3 className="mt-1 font-titulo text-lg text-pergaminho">{it.nome}</h3>
                      {it.dadoDeDano && <p className="mt-1 font-gravado text-xs text-terracota">{it.dadoDeDano}</p>}
                    </div>
                  </ColunaFrame>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === "poderes" && (
        <div className="mt-8">
          <div className="flex justify-end">
            <BotaoLink href="/app/oraculo/poderes/novo">+ Criar Poder</BotaoLink>
          </div>
          {poderes.length === 0 ? (
            <ColunaFrame className="mt-6 p-14 text-center">
              <p className="font-titulo text-lg text-pergaminho">Nenhum poder criado ainda</p>
              <p className="mt-2 text-sm text-foreground/60">
                Crie habilidades próprias para dar aos seus personagens ou compartilhar.
              </p>
            </ColunaFrame>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {poderes.map((p) => (
                <Link key={p.id} href={`/app/oraculo/poderes/${p.id}`}>
                  <ColunaFrame className="overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-ouro">
                    <div className="relative h-32 w-full bg-noite-alta">
                      {p.ilustracaoUrl ? (
                        <Image src={p.ilustracaoUrl} alt={p.nome} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="h-7 w-7 rotate-45 border border-ouro/50" />
                        </div>
                      )}
                      {p.publico && (
                        <span className="absolute left-3 top-3 rounded-full border border-egeu bg-noite/80 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest text-egeu">
                          Compartilhado
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="font-gravado text-[11px] uppercase tracking-widest text-foreground/50">
                        {p.tipoAcao} · {p.custoEstamina} Est
                      </span>
                      <h3 className="mt-1 font-titulo text-lg text-pergaminho">{p.nome}</h3>
                    </div>
                  </ColunaFrame>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
