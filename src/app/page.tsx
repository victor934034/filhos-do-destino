import Image from "next/image";
import Link from "next/link";
import { Cabecalho } from "@/components/site/Cabecalho";
import { BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";
import { SecaoRolagens } from "@/components/site/SecaoRolagens";
import { EntradaSuave } from "@/components/ui/EntradaSuave";

export default function PaginaInicial() {
  return (
    <>
      <Cabecalho />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-[var(--border-sutil)] text-pergaminho">
          <Image
            src="/imagens/hero-fundo.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noite via-noite/75 to-noite/40" />

          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end md:py-24">
            <EntradaSuave className="lg:pb-10">
              <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Filhos do Destino</p>

              <h1 className="mt-4 max-w-xl font-titulo text-4xl uppercase leading-[1.12] text-pergaminho md:text-5xl">
                As Moiras já teceram sua mesa.{" "}
                <span className="text-ouro-claro">Você só precisa sentar.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-pergaminho/75">
                Fichas de semideuses, rolagens automáticas com a Regra do Mito, rastreador de
                iniciativa e bestiário — tudo numa plataforma que parece pertencer ao Olimpo, não a
                um painel de SaaS.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/cadastro"
                  className="rounded-full bg-ouro px-6 py-3 font-titulo text-xs font-bold uppercase tracking-[0.1em] text-tinta transition hover:scale-[1.03] hover:bg-ouro-claro"
                >
                  Criar campanha
                </Link>
                <Link
                  href="/sistema"
                  className="rounded-full border border-pergaminho/30 px-6 py-3 font-titulo text-xs font-bold uppercase tracking-[0.1em] text-pergaminho transition hover:border-ouro hover:text-ouro-claro"
                >
                  Visitar o sistema
                </Link>
              </div>

              <Link href="/#rolagens" className="mt-5 inline-block font-gravado text-xs uppercase tracking-[0.1em] text-ouro-claro underline decoration-ouro/40 underline-offset-4 hover:text-ouro">
                Conferir a Regra do Mito →
              </Link>
            </EntradaSuave>

            <EntradaSuave atraso={0.15} className="relative mx-auto h-[420px] w-full max-w-md lg:h-[560px] lg:max-w-none">
              <Image
                src="/imagens/zeus.png"
                alt="Zeus, pai dos deuses"
                fill
                priority
                className="object-contain object-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]"
                sizes="(max-width: 1024px) 400px, 560px"
              />
              {/* Névoa na base — dissolve o corte reto da ilustração em vez de terminar seco */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-noite via-noite/70 to-transparent blur-sm md:h-36" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-noite to-transparent" />
            </EntradaSuave>
          </div>
        </section>

        {/* PROFECIA */}
        <section className="border-b border-[var(--border-sutil)] py-14">
          <EntradaSuave className="mx-auto max-w-3xl px-5 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ouro">
              <span className="h-2.5 w-2.5 rotate-45 bg-ouro" />
            </span>
            <p className="mt-3 font-gravado text-xs uppercase tracking-[0.2em] text-bronze">
              Profecia das Moiras
            </p>
            <h2 className="mt-1 font-titulo text-xl uppercase tracking-wide text-pergaminho">
              O fio já foi cortado
            </h2>
            <Divisor centralizado className="my-4" />
            <p className="text-sm italic leading-relaxed text-foreground/75">
              Você chegou tarde, como todos os heróis. O fio que te pertence já foi medido — resta
              descobrir onde ele se enrosca no fio de outra pessoa. Sente-se: a mesa está posta e o
              dado ainda não caiu.
            </p>
            <button className="mt-6 rounded-full border border-ouro px-5 py-2.5 font-titulo text-xs uppercase tracking-[0.12em] text-ouro hover:bg-ouro-claro/10">
              Tecer outra profecia
            </button>
          </EntradaSuave>
        </section>

        <SecaoRolagens />

        {/* ESCUDO DO ORÁCULO */}
        <section id="escudo" className="border-t border-[var(--border-sutil)] bg-[var(--surface)]/50 py-20">
          <EntradaSuave className="mx-auto max-w-6xl px-5">
            <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">02 · Escudo do Oráculo</p>
            <h2 className="mt-2 font-titulo text-2xl uppercase tracking-wide text-pergaminho md:text-3xl">
              Tudo o que a mesa rolou, sem você perguntar.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75">
              Feed de rolagens ao vivo, rastreador de iniciativa e painel de ação por personagem.
              Entre na sua campanha para ver o painel completo.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="rounded-sm border border-[var(--border-sutil)]">
                <div className="border-b border-[var(--border-sutil)] px-4 py-3 font-titulo text-xs uppercase tracking-widest text-ouro">
                  Resultados
                </div>
                {[
                  { quem: "Nikos", teste: "Luta (Força 5 · Mestre)", total: 25 },
                  { quem: "Théa", teste: "Percepção — Regra do Mito", total: 31 },
                  { quem: "Kalliope", teste: "Atuação (Carisma 5)", total: 15 },
                ].map((r, i) => (
                  <EntradaSuave key={r.quem} atraso={i * 0.08}>
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--border-sutil)]/50 px-4 py-3 transition hover:bg-ouro-claro/5">
                      <div>
                        <p className="text-sm font-medium">{r.quem}</p>
                        <p className="text-xs text-foreground/55">{r.teste}</p>
                      </div>
                      <span className="font-titulo text-xl font-bold text-ouro">{r.total}</span>
                    </div>
                  </EntradaSuave>
                ))}
              </div>

              <div className="rounded-sm border border-[var(--border-sutil)] p-5">
                <div className="flex flex-wrap gap-2 border-b border-[var(--border-sutil)] pb-4">
                  {["Agentes", "Combates", "Investigação", "Relatórios", "Dados", "Anotações"].map((aba, i) => (
                    <span
                      key={aba}
                      className={`font-titulo text-xs uppercase tracking-wide ${
                        i === 1 ? "border-b-2 border-ouro text-ouro" : "text-foreground/55"
                      } px-2 pb-2`}
                    >
                      {aba}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    { nome: "Théa", tipo: "Semideus", pv: "38/52", est: "14/20", ini: 22 },
                    { nome: "Górgona Menor", tipo: "Ameaça", pv: "27/40", est: "12/12", ini: 15 },
                  ].map((c, i) => (
                    <EntradaSuave key={c.nome} atraso={i * 0.1}>
                      <div className="flex items-center justify-between gap-3 rounded-sm border border-[var(--border-sutil)] px-4 py-3 transition hover:border-ouro">
                        <div>
                          <p className="text-sm font-semibold">
                            {c.nome} <span className="ml-2 text-[10px] uppercase tracking-wide text-foreground/50">{c.tipo}</span>
                          </p>
                          <p className="mt-1 font-gravado text-xs text-foreground/60">
                            PV {c.pv} · EST {c.est}
                          </p>
                        </div>
                        <span className="font-titulo text-lg font-bold text-foreground/70">{c.ini}</span>
                      </div>
                    </EntradaSuave>
                  ))}
                </div>
              </div>
            </div>
          </EntradaSuave>
        </section>

        {/* BESTIÁRIO */}
        <section id="bestiario" className="border-t border-[var(--border-sutil)] py-20">
          <EntradaSuave className="mx-auto max-w-6xl px-5">
            <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">03 · Bestiário</p>
            <h2 className="mt-2 font-titulo text-2xl uppercase tracking-wide text-pergaminho md:text-3xl">
              Filtre por fonte de conteúdo, não por memória.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75">
              Cada mini-aventura publicada entra como uma fonte própria. Combine com as tags
              temáticas para achar a ameaça certa no meio da sessão.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Ctônico", "Titânico", "Bestial", "Marinho"].map((t) => (
                <span key={t} className="rounded-full border border-[var(--border-sutil)] px-3.5 py-1.5 text-xs uppercase tracking-wide text-foreground/70">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { nome: "Górgona Menor", tipo: "Criatura · Média", vd: 4, tema: "Ctônico" },
                { nome: "Ciclope Pastor", tipo: "Gigante · Grande", vd: 7, tema: "Titânico" },
                { nome: "Harpia de Ícarus", tipo: "Criatura · Média", vd: 3, tema: "Bestial" },
              ].map((m, i) => (
                <EntradaSuave key={m.nome} atraso={i * 0.1}>
                  <div className="rounded-sm border border-[var(--border-sutil)] p-4 transition duration-300 hover:-translate-y-1 hover:border-ouro hover:shadow-[0_12px_24px_-12px_rgba(224,151,58,0.35)]">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-sm border border-[var(--border-sutil)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
                        {m.tema}
                      </span>
                      <span className="rounded-sm bg-ouro px-2 py-0.5 font-gravado text-[11px] text-tinta">VD {m.vd}</span>
                    </div>
                    <p className="font-titulo text-lg text-pergaminho">{m.nome}</p>
                    <p className="mt-1 text-xs text-foreground/55">{m.tipo}</p>
                  </div>
                </EntradaSuave>
              ))}
            </div>
          </EntradaSuave>
        </section>

        {/* FICHA */}
        <section id="ficha" className="border-t border-[var(--border-sutil)] bg-[var(--surface)]/50 py-20">
          <EntradaSuave className="mx-auto max-w-6xl px-5">
            <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">04 · Ficha do semideus</p>
            <h2 className="mt-2 font-titulo text-2xl uppercase tracking-wide text-pergaminho md:text-3xl">
              Cinco abas. Nenhuma planilha.
            </h2>
            <div className="mt-8 rounded-sm border border-[var(--border-sutil)]">
              <div className="flex flex-wrap gap-1 border-b border-[var(--border-sutil)] px-2">
                {["Combate", "Poderes", "Estilos de Combate", "Inventário", "Descrição"].map((aba, i) => (
                  <span
                    key={aba}
                    className={`font-titulo text-xs uppercase tracking-wide px-3.5 py-3.5 ${
                      i === 0 ? "border-b-2 border-ouro text-ouro" : "text-foreground/55"
                    }`}
                  >
                    {aba}
                  </span>
                ))}
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-2">
                {[
                  { nome: "Lança de bronze", meta: "Proficiência: hastes · perfuração", valor: "1d8+4" },
                  { nome: "Escudo-investida", meta: "Proficiência: escudos · impacto", valor: "1d6+3" },
                  { nome: "Defesa passiva", meta: "Áspis 4 + Destreza", valor: "16" },
                  { nome: "Deslocamento", meta: "Terreno normal", valor: "9m" },
                ].map((l, i) => (
                  <EntradaSuave key={l.nome} atraso={i * 0.07}>
                    <div className="flex items-center justify-between gap-4 rounded-sm border border-[var(--border-sutil)] px-4 py-3.5 transition hover:border-ouro">
                      <div>
                        <p className="text-sm font-medium">{l.nome}</p>
                        <p className="mt-0.5 text-xs text-foreground/55">{l.meta}</p>
                      </div>
                      <span className="font-gravado text-sm text-ouro">{l.valor}</span>
                    </div>
                  </EntradaSuave>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  titulo: "Estúdio de streaming",
                  texto: "Compositor de cena com câmeras emolduradas em bronze grego — sua mesa vira transmissão sem OBS.",
                },
                {
                  titulo: "Crônica da sessão",
                  texto: "No fim de cada sessão, o Oráculo recebe um resumo narrativo na voz do universo. Inclui obituários, quando necessário.",
                },
                {
                  titulo: "Patente narrativa",
                  texto: "De Semideus Novato a Herói Reconhecido pelo Olimpo. Progressão cosmética — nunca uma parede na frente do dado.",
                },
              ].map((f, i) => (
                <EntradaSuave key={f.titulo} atraso={i * 0.1}>
                  <div className="border-t border-ouro pt-4 transition hover:-translate-y-0.5">
                    <p className="font-titulo text-sm uppercase tracking-wide text-pergaminho">{f.titulo}</p>
                    <p className="mt-2 text-sm text-foreground/70">{f.texto}</p>
                  </div>
                </EntradaSuave>
              ))}
            </div>

            <div className="mt-10 text-center">
              <BotaoLink href="/cadastro">Criar meu Semideus</BotaoLink>
            </div>
          </EntradaSuave>
        </section>
      </main>

      <footer className="border-t border-[var(--border-sutil)] bg-noite py-8 text-pergaminho">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-xs">
          <span className="font-titulo uppercase tracking-widest text-pergaminho">Filhos do Destino</span>
          <span className="text-pergaminho/55">
            As Moiras não oferecem reembolso, mas nós não cobramos pelos dados.
          </span>
          <span className="font-gravado uppercase tracking-wide text-pergaminho/45">v0.1 · Protótipo de fã</span>
        </div>
        <div className="mx-auto mt-3 max-w-6xl px-5">
          <p className="text-[11px] text-pergaminho/40">
            Projeto feito por fãs para a comunidade de Filhos do Destino — sem vínculo oficial com
            os criadores do sistema original.
          </p>
        </div>
      </footer>
    </>
  );
}
