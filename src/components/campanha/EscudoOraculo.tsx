"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ATRIBUTOS, dadoDoAtributo, rolarFormula } from "@/lib/regras";
import type { Campanha, EventoSessao, FichaMonstro, FichaPersonagem } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { BarraEssencia } from "@/components/ui/BarraEssencia";
import { ContadorDracmas } from "@/components/ui/ContadorDracmas";
import { AcaoBotao } from "@/components/ui/AcaoBotao";
import { MesaAoVivo } from "@/components/mesa/MesaAoVivo";
import { dispararRolagem } from "@/lib/toastRolagens";
import { dispararMensagem, fetchOuAvisar } from "@/lib/toastMensagens";

interface PersonagemMesa extends FichaPersonagem {
  donoUsuarioId: string;
  bloqueado?: false;
}
type PersonagemNaMesa = PersonagemMesa;

type AbaEscudo = "semideuses" | "combates" | "investigacao" | "relatorios" | "dados" | "anotacoes";

const ABAS: { chave: AbaEscudo; rotulo: string }[] = [
  { chave: "semideuses", rotulo: "Semideuses" },
  { chave: "combates", rotulo: "Combates" },
  { chave: "investigacao", rotulo: "Investigação" },
  { chave: "relatorios", rotulo: "Relatórios" },
  { chave: "dados", rotulo: "Dados" },
  { chave: "anotacoes", rotulo: "Anotações" },
];

// Nível 3 — Escudo do Oráculo: só o mestre entra aqui (guardado na page.tsx).
export function EscudoOraculo({
  campanhaInicial,
  usuarioId,
  nomeUsuario,
  personagensIniciais,
  monstrosDisponiveis,
}: {
  campanhaInicial: Campanha;
  usuarioId: string;
  nomeUsuario: string;
  personagensIniciais: PersonagemNaMesa[];
  monstrosDisponiveis: FichaMonstro[];
}) {
  const [campanha, setCampanha] = useState(campanhaInicial);
  const [aba, setAba] = useState<AbaEscudo>("semideuses");
  const [salvandoToggle, setSalvandoToggle] = useState(false);
  const [personagens, setPersonagens] = useState<PersonagemNaMesa[]>(personagensIniciais);

  // O Personagem tem um registro só — essa tela lê ele ao vivo (polling curto), nunca
  // um snapshot parado do load da página, pra refletir o que o jogador edita na própria ficha.
  useEffect(() => {
    let cancelado = false;
    async function buscar() {
      const res = await fetch(`/api/campanhas/${campanha.id}/semideuses`);
      if (res.ok && !cancelado) {
        const dados: PersonagemNaMesa[] = await res.json();
        setPersonagens(dados);
      }
    }
    const t = setInterval(buscar, 4000);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, [campanha.id]);

  async function alternarOcultarSemideuses() {
    setSalvandoToggle(true);
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ocultarSemideusesParaJogadores: !campanha.ocultarSemideusesParaJogadores }),
    });
    if (res) setCampanha(await res.json());
    setSalvandoToggle(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <p className="font-gravado text-xs uppercase tracking-widest text-egeu">Escudo do Oráculo</p>
      <h1 className="mt-1 font-titulo text-2xl text-pergaminho">{campanha.nome}</h1>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 md:grid-cols-[320px_1fr]">
        <aside className="md:sticky md:top-5 md:max-h-[calc(100vh-140px)] md:overflow-y-auto">
          <ResultadosSidebar campanhaId={campanha.id} />
        </aside>

        <section>
          <div className="flex flex-wrap gap-1 border-b border-[var(--border-sutil)]">
            {ABAS.map((a) => (
              <button
                key={a.chave}
                onClick={() => setAba(a.chave)}
                className={`px-3 py-2.5 font-titulo text-xs uppercase tracking-wide ${
                  aba === a.chave ? "border-b-2 border-ouro text-ouro" : "text-foreground/55 hover:text-bronze"
                }`}
              >
                {a.rotulo}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {aba === "semideuses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-3 text-xs text-foreground/70">
                  <span>Ocultar Semideuses para jogadores</span>
                  <button
                    onClick={alternarOcultarSemideuses}
                    disabled={salvandoToggle}
                    className={`rounded-full border px-3 py-1 uppercase tracking-wide ${
                      campanha.ocultarSemideusesParaJogadores
                        ? "border-ouro bg-ouro text-tinta"
                        : "border-[var(--border-sutil)] text-foreground/60"
                    }`}
                  >
                    {campanha.ocultarSemideusesParaJogadores ? "Ligado" : "Desligado"}
                  </button>
                </div>
                <AbaSemideuses personagens={personagens} />
              </div>
            )}

            {aba === "combates" && (
              <MesaAoVivo
                campanhaId={campanha.id}
                campanhaNome={campanha.nome}
                usuarioId={usuarioId}
                nomeUsuario={nomeUsuario}
                ehOraculo
                personagensIniciais={personagens}
                monstrosDisponiveis={monstrosDisponiveis}
              />
            )}

            {aba === "investigacao" && <AbaInvestigacao campanhaId={campanha.id} />}

            {aba === "relatorios" && <AbaRelatorios campanhaId={campanha.id} />}

            {aba === "dados" && <AbaDados campanhaId={campanha.id} nomeUsuario={nomeUsuario} />}

            {aba === "anotacoes" && <AbaAnotacoes campanhaId={campanha.id} />}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- Sidebar de Resultados — rolagens recentes, fixa em todas as abas ----------
function ResultadosSidebar({ campanhaId }: { campanhaId: string }) {
  const [eventos, setEventos] = useState<EventoSessao[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function buscar() {
      const res = await fetch(`/api/campanhas/${campanhaId}/mesa`);
      if (res.ok && !cancelado) {
        const dados = await res.json();
        setEventos((dados.eventos ?? []).filter((e: EventoSessao) => e.tipo === "rolagem"));
      }
    }
    buscar();
    const t = setInterval(buscar, 5000);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, [campanhaId]);

  return (
    <ColunaFrame titulo="Resultados">
      <div className="max-h-[28rem] space-y-2 overflow-y-auto p-4 md:max-h-none">
        {eventos === null && <p className="text-xs text-foreground/50">Carregando…</p>}
        {eventos?.length === 0 && <p className="text-xs text-foreground/50">Nenhuma rolagem ainda nesta campanha.</p>}
        {eventos?.slice(0, 40).map((e) => (
          <div key={e.id} className="rounded-sm border border-[var(--border-sutil)] p-2.5 font-gravado text-xs">
            <p className="text-foreground/80">{e.conteudo}</p>
            <p className="mt-1 text-[10px] text-foreground/40">
              {new Date(e.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>
    </ColunaFrame>
  );
}

// ---------- Aba Semideuses — painel completo do Oráculo (stats cheios) ----------
function AbaSemideuses({ personagens }: { personagens: PersonagemNaMesa[] }) {
  if (personagens.length === 0) {
    return (
      <ColunaFrame className="p-8 text-center text-sm text-foreground/60">
        Nenhum personagem aprovado nesta campanha ainda.
      </ColunaFrame>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {personagens.map((p) => (
        <Link key={p.id} href={`/app/personagens/${p.id}`}>
          <ColunaFrame className="p-4 transition hover:-translate-y-0.5 hover:border-ouro">
            <div className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-ouro/50 bg-noite">
                {p.ilustracaoUrl ? (
                  <Image src={p.ilustracaoUrl} alt={p.nome} fill className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-ouro/40">
                    <span className="h-4 w-4 rotate-45 border border-ouro/60" />
                  </span>
                )}
              </span>
              <div>
                <p className="font-titulo text-base text-pergaminho">{p.nome}</p>
                <p className="text-[11px] text-foreground/60">
                  {p.parenteDivino} · {p.armamento}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-6 gap-1">
              {ATRIBUTOS.map((a) => (
                <div key={a.chave} className="rounded-sm border border-[var(--border-sutil)] py-1 text-center">
                  <p className="font-gravado text-[10px] text-ouro">D{dadoDoAtributo(p[a.chave] as number)}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1.5">
              <BarraEssencia label="Vida" atual={p.vidaAtual} maximo={p.vidaMax} tipo="vida" />
              <BarraEssencia label="Estamina" atual={p.estaminaAtual} maximo={p.estaminaMax} tipo="estamina" />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-foreground/60">
              <span>Áspis {p.aspis}</span>
              <span>Deslocamento {p.deslocamento}m</span>
            </div>
            <div className="mt-1">
              <ContadorDracmas valor={p.dracmas} />
            </div>
          </ColunaFrame>
        </Link>
      ))}
    </div>
  );
}

// ---------- Aba Investigação ----------
interface PistaDb {
  id: string;
  titulo: string;
  conteudo: string;
  revelada: boolean;
  criadoEm: string;
}

function AbaInvestigacao({ campanhaId }: { campanhaId: string }) {
  const [pistas, setPistas] = useState<PistaDb[] | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");

  async function recarregar() {
    const res = await fetch(`/api/campanhas/${campanhaId}/pistas`);
    if (res.ok) setPistas(await res.json());
  }

  useEffect(() => {
    let cancelado = false;
    fetch(`/api/campanhas/${campanhaId}/pistas`)
      .then((r) => (r.ok ? r.json() : null))
      .then((dados) => {
        if (!cancelado && dados) setPistas(dados);
      });
    return () => {
      cancelado = true;
    };
  }, [campanhaId]);

  async function criar() {
    if (!titulo.trim()) return;
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/pistas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, conteudo }),
    });
    if (res) {
      setTitulo("");
      setConteudo("");
      await recarregar();
    }
  }

  async function alternarRevelada(p: PistaDb) {
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/pistas/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revelada: !p.revelada }),
    });
    if (res) await recarregar();
  }

  async function remover(id: string) {
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/pistas/${id}`, { method: "DELETE" });
    if (res) await recarregar();
  }

  return (
    <ColunaFrame titulo="Pistas da investigação">
      <div className="p-5">
        {pistas === null && <p className="text-sm text-foreground/50">Carregando…</p>}
        {pistas?.length === 0 && <p className="text-sm text-foreground/50">Nenhuma pista registrada ainda.</p>}
        {pistas && pistas.length > 0 && (
          <ul className="space-y-3">
            {pistas.map((p) => (
              <li key={p.id} className="rounded-sm border border-[var(--border-sutil)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm">{p.titulo}</p>
                  <div className="flex shrink-0 gap-2">
                    <AcaoBotao variante={p.revelada ? "destaque" : "neutro"} onClick={() => alternarRevelada(p)}>
                      {p.revelada ? "Revelada" : "Revelar"}
                    </AcaoBotao>
                    <AcaoBotao variante="perigo" onClick={() => remover(p.id)}>
                      Remover
                    </AcaoBotao>
                  </div>
                </div>
                {p.conteudo && <p className="mt-1 text-sm text-foreground/70">{p.conteudo}</p>}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-2 rounded-sm border border-dashed border-[var(--border-sutil)] p-4">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título da pista"
            className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={2}
            placeholder="Conteúdo da pista…"
            className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
          <Botao variante="fantasma" onClick={criar}>
            Adicionar pista
          </Botao>
        </div>
      </div>
    </ColunaFrame>
  );
}

// ---------- Aba Relatórios ----------
interface RelatorioDb {
  id: string;
  titulo: string;
  conteudo: string;
  autorId: string;
  autorNome: string;
  criadoEm: string;
}

function AbaRelatorios({ campanhaId }: { campanhaId: string }) {
  const [relatorios, setRelatorios] = useState<RelatorioDb[] | null>(null);

  async function recarregar() {
    const res = await fetch(`/api/campanhas/${campanhaId}/relatorios`);
    if (res.ok) setRelatorios(await res.json());
  }

  useEffect(() => {
    let cancelado = false;
    fetch(`/api/campanhas/${campanhaId}/relatorios`)
      .then((r) => (r.ok ? r.json() : null))
      .then((dados) => {
        if (!cancelado && dados) setRelatorios(dados);
      });
    return () => {
      cancelado = true;
    };
  }, [campanhaId]);

  async function remover(id: string) {
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/relatorios/${id}`, { method: "DELETE" });
    if (res) await recarregar();
  }

  return (
    <ColunaFrame titulo="Relatórios de sessão">
      <div className="p-5">
        {relatorios === null && <p className="text-sm text-foreground/50">Carregando…</p>}
        {relatorios?.length === 0 && <p className="text-sm text-foreground/50">Nenhum relatório ainda.</p>}
        {relatorios && relatorios.length > 0 && (
          <ul className="space-y-3">
            {relatorios.map((r) => (
              <li key={r.id} className="rounded-sm border border-[var(--border-sutil)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{r.titulo}</p>
                    <p className="text-[11px] text-foreground/50">
                      {r.autorNome} · {new Date(r.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <AcaoBotao variante="perigo" className="shrink-0" onClick={() => remover(r.id)}>
                    Remover
                  </AcaoBotao>
                </div>
                {r.conteudo && <p className="mt-1 whitespace-pre-line text-sm text-foreground/70">{r.conteudo}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ColunaFrame>
  );
}

// ---------- Aba Dados — rolagem livre no contexto da campanha ----------
function AbaDados({ campanhaId, nomeUsuario }: { campanhaId: string; nomeUsuario: string }) {
  const [formula, setFormula] = useState("2d6+3");
  const [privado, setPrivado] = useState(false);

  async function rolar() {
    const resultado = rolarFormula(formula);
    if (!resultado) {
      dispararMensagem("erro", `Não entendi "${formula}". Tente algo como 2d6+3.`);
      return;
    }
    if (privado) {
      dispararRolagem("Rolagem privada", formula, resultado);
      return;
    }
    dispararRolagem(nomeUsuario, formula, resultado);
    await fetch(`/api/campanhas/${campanhaId}/mesa/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "rolagem",
        conteudo: `${nomeUsuario} rola ${formula}: ${resultado.total} — ${resultado.detalhe}`,
        autorNome: nomeUsuario,
      }),
    });
  }

  return (
    <ColunaFrame titulo="Rolagem livre da campanha">
      <div className="space-y-3 p-5">
        <p className="text-sm text-foreground/70">
          Rolagem avulsa, fora da ficha — útil para testes de grupo, armadilhas, ou qualquer coisa que o
          Oráculo peça na hora.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="2d6+3"
            className="w-32 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 font-gravado text-sm outline-none focus:border-ouro"
          />
          <label className="flex items-center gap-1.5 text-xs text-foreground/70">
            <input type="checkbox" checked={privado} onChange={(e) => setPrivado(e.target.checked)} />
            Privado (só eu vejo)
          </label>
          <Botao onClick={rolar}>Rolar</Botao>
        </div>
        {!privado && <p className="text-[11px] text-foreground/50">Rolagens públicas entram na sidebar Resultados.</p>}
      </div>
    </ColunaFrame>
  );
}

// ---------- Aba Anotações — três campos, só o Oráculo vê esta tela ----------
interface NotasEstruturadas {
  geral: string;
  sessoesFuturas: string;
  sessoesAnteriores: string;
}

function AbaAnotacoes({ campanhaId }: { campanhaId: string }) {
  const [notas, setNotas] = useState<NotasEstruturadas | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch(`/api/campanhas/${campanhaId}/notas`)
      .then((r) => r.json())
      .then((d) => {
        try {
          setNotas(JSON.parse(d.notas));
        } catch {
          setNotas({ geral: d.notas ?? "", sessoesFuturas: "", sessoesAnteriores: "" });
        }
      })
      .catch(() => setNotas({ geral: "", sessoesFuturas: "", sessoesAnteriores: "" }));
  }, [campanhaId]);

  async function salvar(proximo: NotasEstruturadas) {
    setNotas(proximo);
    setSalvando(true);
    await fetchOuAvisar(`/api/campanhas/${campanhaId}/notas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notas: JSON.stringify(proximo) }),
    });
    setSalvando(false);
  }

  if (!notas) return <ColunaFrame className="p-5 text-sm text-foreground/50">Carregando…</ColunaFrame>;

  return (
    <div className="space-y-6">
      <p className="text-xs text-foreground/50">
        Só você vê isso — nunca aparece pros jogadores. {salvando && "Salvando…"}
      </p>
      <ColunaFrame titulo="Geral">
        <textarea
          value={notas.geral}
          onChange={(e) => setNotas({ ...notas, geral: e.target.value })}
          onBlur={() => salvar(notas)}
          rows={5}
          placeholder="Segredos da campanha, ideias soltas…"
          className="w-full border-0 bg-transparent p-4 text-sm outline-none"
        />
      </ColunaFrame>
      <ColunaFrame titulo="Sessões futuras">
        <textarea
          value={notas.sessoesFuturas}
          onChange={(e) => setNotas({ ...notas, sessoesFuturas: e.target.value })}
          onBlur={() => salvar(notas)}
          rows={5}
          placeholder="O que você planeja pra próxima sessão…"
          className="w-full border-0 bg-transparent p-4 text-sm outline-none"
        />
      </ColunaFrame>
      <ColunaFrame titulo="Sessões anteriores">
        <textarea
          value={notas.sessoesAnteriores}
          onChange={(e) => setNotas({ ...notas, sessoesAnteriores: e.target.value })}
          onBlur={() => salvar(notas)}
          rows={5}
          placeholder="O que já aconteceu…"
          className="w-full border-0 bg-transparent p-4 text-sm outline-none"
        />
      </ColunaFrame>
    </div>
  );
}
