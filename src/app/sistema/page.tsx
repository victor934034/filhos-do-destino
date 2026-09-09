import { Cabecalho } from "@/components/site/Cabecalho";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { SeloAtributo } from "@/components/ui/SeloAtributo";
import { BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";
import { ATRIBUTOS, ARMAMENTOS, DIFICULDADES, ESPECIALIDADES_BASICAS, dadoDoAtributo } from "@/lib/regras";

export const metadata = { title: "O Sistema — Filhos do Destino" };

export default function PaginaSistema() {
  return (
    <>
      <Cabecalho />
      <main className="flex-1">
        <section className="border-b border-[var(--border-sutil)] bg-[var(--surface)]/50 py-16">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="font-titulo text-xs uppercase tracking-[0.3em] text-bronze">O Sistema</p>
            <h1 className="mt-4 font-titulo text-3xl uppercase text-pergaminho md:text-4xl">
              Regras enxutas. Fundo de mito.
            </h1>
            <Divisor centralizado className="my-4" />
            <p className="mx-auto mt-4 max-w-2xl text-foreground/75">
              Filhos do Destino usa dados de tamanhos variados para representar seus atributos —
              quanto mais forte um traço, maior (e mais generoso) o dado que você rola por ele.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16">
          <h2 className="font-titulo text-xl uppercase tracking-wide text-bronze">Atributos</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ATRIBUTOS.map((a) => (
              <div key={a.chave} className="flex items-center gap-4 rounded-sm border border-[var(--border-sutil)] p-4">
                <SeloAtributo atributo={a.chave} icone={a.icone} />
                <div>
                  <p className="font-medium">{a.nome}</p>
                  <p className="text-sm text-foreground/70">{a.descricao}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-sutil)] text-left text-bronze">
                  <th className="py-2">Valor do Atributo</th>
                  <th className="py-2">Dado</th>
                </tr>
              </thead>
              <tbody className="font-gravado">
                {[1, 2, 3, 4, 5].map((v) => (
                  <tr key={v} className="border-b border-[var(--border-sutil)]/50">
                    <td className="py-1.5">{v}</td>
                    <td className="py-1.5">D{dadoDoAtributo(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-y border-[var(--border-sutil)] bg-[var(--surface)]/50 py-16">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="font-titulo text-xl uppercase tracking-wide text-bronze">Testes</h2>
            <p className="mt-4 text-foreground/80">
              Um teste comum é sempre <span className="font-gravado">1d20 + dado de atributo</span>, comparado
              contra uma Dificuldade (DT). Especialidades Treinadas sobem seu dado uma categoria; no nível
              Mestre, você ainda rola o dado de atributo de novo e fica com o melhor resultado.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {DIFICULDADES.map((d) => (
                <ColunaFrame key={d.nome} className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-bronze">{d.nome}</p>
                  <p className="font-gravado text-2xl">{d.dt}</p>
                </ColunaFrame>
              ))}
            </div>

            <div className="mt-8 rounded-sm border border-ouro/50 bg-ouro-claro/10 p-5">
              <h3 className="font-titulo text-sm uppercase tracking-wide text-bronze">Regra do Mito</h3>
              <p className="mt-2 text-sm text-foreground/80">
                Quando seu atributo vale 5 e uma Especialidade aplicável entra em jogo, o sangue divino
                fala mais alto: role <span className="font-gravado">2d20</span> e use o maior resultado.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16">
          <h2 className="font-titulo text-xl uppercase tracking-wide text-bronze">Combate</h2>
          <p className="mt-4 text-foreground/80">
            Seu Armamento determina qual atributo você usa para atacar. O teste de combate é
            <span className="font-gravado"> 1d20 + dado de atributo</span> contra a Áspis (defesa) do alvo.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {ARMAMENTOS.map((a) => (
              <ColunaFrame key={a.nome} className="p-4">
                <p className="font-titulo text-sm uppercase tracking-wide text-bronze">{a.nome}</p>
                <p className="mt-1 text-xs text-foreground/70">{a.estilo}</p>
              </ColunaFrame>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border-sutil)] bg-[var(--surface)]/50 py-16">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="font-titulo text-xl uppercase tracking-wide text-bronze">Especialidades</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {ESPECIALIDADES_BASICAS.map((e) => (
                <span key={e.nome} className="rounded-full border border-[var(--border-sutil)] px-3 py-1 text-xs">
                  {e.nome}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-20 text-center">
          <BotaoLink href="/cadastro">Criar meu Semideus</BotaoLink>
        </section>
      </main>
    </>
  );
}
