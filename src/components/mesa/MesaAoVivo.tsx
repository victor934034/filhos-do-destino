"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ATRIBUTOS,
  atributoDoArmamento,
  rolarTeste,
  type Atributo,
} from "@/lib/regras";
import type { FichaMonstro, FichaPersonagem, ParticipanteIniciativa, SessaoAoVivo } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { BarraEssencia } from "@/components/ui/BarraEssencia";
import { Botao } from "@/components/ui/Botao";
import { SeloAtributo } from "@/components/ui/SeloAtributo";
import { SeletorMultiplo } from "@/components/ui/Seletor";
import { ContadorDracmas } from "@/components/ui/ContadorDracmas";
import { dispararErro } from "@/lib/toastMensagens";

interface PersonagemMesa extends FichaPersonagem {
  donoUsuarioId: string;
  bloqueado?: false;
}

interface PersonagemMesaOculto {
  id: string;
  nome: string;
  ilustracaoUrl: string | null;
  donoUsuarioId: string;
  bloqueado: true;
}

type PersonagemNaMesa = PersonagemMesa | PersonagemMesaOculto;

function rolarD(faces: number) {
  return Math.floor(Math.random() * faces) + 1;
}

export function MesaAoVivo({
  campanhaId,
  campanhaNome,
  usuarioId,
  nomeUsuario,
  ehOraculo,
  personagensIniciais,
  monstrosDisponiveis,
}: {
  campanhaId: string;
  campanhaNome: string;
  usuarioId: string;
  nomeUsuario: string;
  ehOraculo: boolean;
  personagensIniciais: PersonagemNaMesa[];
  monstrosDisponiveis: FichaMonstro[];
}) {
  const [personagens, setPersonagens] = useState(personagensIniciais);
  const [sessao, setSessao] = useState<SessaoAoVivo | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [narrando, setNarrando] = useState(false);
  const [monstrosSelecionados, setMonstrosSelecionados] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  async function buscarMesa() {
    const res = await fetch(`/api/campanhas/${campanhaId}/mesa`);
    if (res.ok) setSessao(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- polling: fetch on mount, then on an interval
    buscarMesa();
    const t = setInterval(buscarMesa, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId]);

  // O Personagem tem um registro só (a ficha em /app/personagens/:id) — a mesa lê ele
  // ao vivo por polling curto, nunca um snapshot parado do load da página.
  useEffect(() => {
    let cancelado = false;
    async function buscarPersonagens() {
      const res = await fetch(`/api/campanhas/${campanhaId}/semideuses`);
      if (res.ok && !cancelado) setPersonagens(await res.json());
    }
    const t = setInterval(buscarPersonagens, 4000);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, [campanhaId]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [sessao?.eventos.length]);

  async function postarEvento(tipo: "rolagem" | "chat" | "narracao" | "sistema", conteudo: string) {
    await fetch(`/api/campanhas/${campanhaId}/mesa/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, conteudo, autorNome: nomeUsuario }),
    });
    buscarMesa();
  }

  async function atualizarPersonagem(p: PersonagemMesa, patch: Partial<FichaPersonagem>) {
    const novo = { ...p, ...patch };
    setPersonagens((lista) => lista.map((x) => (x.id === p.id ? novo : x)));
    await fetch(`/api/personagens/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
  }

  async function ajustarDracmas(p: PersonagemMesa, delta: number) {
    const res = await fetch(`/api/personagens/${p.id}/dracmas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: delta, tipo: "recompensa", motivo: "Loot distribuído na mesa" }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      dispararErro(json?.erro ?? "Não foi possível ajustar Dracmas.");
      return;
    }
    const dados = await res.json();
    setPersonagens((lista) => lista.map((x) => (x.id === p.id ? { ...x, dracmas: dados.saldo } : x)));
  }

  function rolarAtributo(p: PersonagemMesa, atributo: Atributo, nomeExibicao: string) {
    const nivel = p.especialidades.find((e) =>
      e.atributoRecomendado.toLowerCase().includes(nomeExibicao.toLowerCase())
    );
    const r = rolarTeste(p[atributo] as number, nivel?.nivel ?? "nenhum");
    postarEvento(
      "rolagem",
      `${p.nome} rola ${nomeExibicao}: ${r.total}${r.usouMito ? " (Regra do Mito!)" : ""} — ${r.detalhe}`
    );
  }

  function atacar(p: PersonagemMesa) {
    const atributo = atributoDoArmamento(p.armamento);
    rolarAtributo(p, atributo, p.armamento);
  }

  async function esforcoExtra(p: PersonagemMesa) {
    if (p.estaminaAtual < 5) {
      postarEvento("sistema", `${p.nome} não tem Estamina suficiente para Esforço Extra.`);
      return;
    }
    const bonusAspis = rolarD(4);
    await atualizarPersonagem(p, { estaminaAtual: p.estaminaAtual - 5 });
    postarEvento(
      "sistema",
      `${p.nome} usa Esforço Extra (-5 Estamina): +${bonusAspis} de Áspis para esta ação (1d4).`
    );
  }

  function desviar(p: PersonagemMesa) {
    const r = rolarTeste(p.destreza, "nenhum");
    const sucesso = r.total > p.aspis;
    postarEvento(
      "sistema",
      `${p.nome} tenta desviar: ${r.total} vs Áspis ${p.aspis} — ${
        sucesso ? "desviou! Áspis +2 contra este ataque e pode contra-atacar." : "não foi rápido o bastante."
      }`
    );
  }

  async function estabilizar(p: PersonagemMesa) {
    const soma = rolarD(20) + rolarD(20) + rolarD(20);
    if (soma >= 30) {
      await atualizarPersonagem(p, { vidaAtual: 1 });
      postarEvento("sistema", `${p.nome} luta contra a morte e estabiliza com 1 de Vida! (3d20 = ${soma})`);
    } else {
      postarEvento("sistema", `${p.nome} não resiste aos ferimentos… (3d20 = ${soma}, precisava de 30)`);
    }
  }

  async function rolarIniciativa() {
    const res = await fetch(`/api/campanhas/${campanhaId}/mesa/iniciativa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monstroIds: monstrosSelecionados }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      dispararErro(json?.erro ?? "Não foi possível rolar a iniciativa.");
      return;
    }
    buscarMesa();
  }

  async function avancarTurno() {
    await fetch(`/api/campanhas/${campanhaId}/mesa/turno`, { method: "POST" });
    buscarMesa();
  }

  async function ajustarVidaMonstro(index: number, participante: ParticipanteIniciativa, delta: number) {
    const max = participante.vidaMax ?? 0;
    const novo = Math.max(0, Math.min(max, (participante.vidaAtual ?? 0) + delta));
    setSessao((s) => {
      if (!s) return s;
      const ordem = s.ordemIniciativa.slice();
      ordem[index] = { ...ordem[index], vidaAtual: novo };
      return { ...s, ordemIniciativa: ordem };
    });
    await fetch(`/api/campanhas/${campanhaId}/mesa/participante`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, vidaAtual: novo }),
    });
  }

  function enviarMensagem() {
    if (!mensagem.trim()) return;
    postarEvento(narrando ? "narracao" : "chat", mensagem.trim());
    setMensagem("");
  }

  const participanteAtual: ParticipanteIniciativa | undefined =
    sessao?.ordemIniciativa[sessao.turnoAtual];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-gravado text-xs uppercase tracking-widest text-egeu">Mesa ao vivo</p>
          <h1 className="font-titulo text-2xl text-pergaminho">{campanhaNome}</h1>
        </div>
        {participanteAtual && (
          <div className="rounded-full border border-ouro bg-ouro-claro/15 px-4 py-1.5 text-sm">
            Turno de <strong className="text-bronze">{participanteAtual.nome}</strong>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ColunaFrame titulo="Iniciativa">
            <div className="p-4">
              {sessao && sessao.ordemIniciativa.length > 0 ? (
                <ol className="flex flex-wrap gap-2">
                  {sessao.ordemIniciativa.map((p, i) => (
                    <li
                      key={`${p.tipo}-${p.id}`}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        i === sessao.turnoAtual
                          ? "border-ouro bg-ouro text-tinta"
                          : "border-[var(--border-sutil)] text-foreground/70"
                      }`}
                    >
                      {p.nome} ({p.valor})
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-foreground/50">Iniciativa ainda não rolada.</p>
              )}

              {ehOraculo && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border-sutil)] pt-4">
                  {monstrosDisponiveis.length > 0 && (
                    <SeletorMultiplo
                      value={monstrosSelecionados}
                      onChange={setMonstrosSelecionados}
                      placeholder="Escolher monstros…"
                      className="w-56"
                      opcoes={monstrosDisponiveis.map((m) => ({ valor: m.id!, rotulo: m.nome }))}
                    />
                  )}
                  <Botao variante="fantasma" onClick={rolarIniciativa}>
                    Rolar Iniciativa
                  </Botao>
                  <Botao variante="fantasma" onClick={avancarTurno}>
                    Avançar Turno
                  </Botao>
                </div>
              )}
            </div>
          </ColunaFrame>

          {sessao && sessao.ordemIniciativa.some((p) => p.tipo === "monstro") && (
            <ColunaFrame titulo="Monstros em cena">
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                {sessao.ordemIniciativa.map((p, i) =>
                  p.tipo !== "monstro" ? null : (
                    <div key={i} className="rounded-sm border border-terracota/40 bg-terracota/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-titulo text-sm text-pergaminho">{p.nome}</p>
                        {(p.vidaAtual ?? 0) <= 0 && (
                          <span className="rounded-full border border-terracota bg-terracota/10 px-2 py-0.5 text-[10px] uppercase text-terracota">
                            Abatido
                          </span>
                        )}
                      </div>
                      {p.vidaMax != null && (
                        <>
                          <div className="mt-2">
                            <BarraEssencia label="Vida" atual={p.vidaAtual ?? 0} maximo={p.vidaMax} tipo="vida" />
                          </div>
                          {ehOraculo && (
                            <div className="mt-2 flex gap-1.5 text-[11px] text-foreground/60">
                              <button
                                onClick={() => ajustarVidaMonstro(i, p, -1)}
                                className="h-6 w-6 rounded-full border border-[var(--border-sutil)] hover:border-ouro"
                              >
                                −
                              </button>
                              <button
                                onClick={() => ajustarVidaMonstro(i, p, 1)}
                                className="h-6 w-6 rounded-full border border-[var(--border-sutil)] hover:border-ouro"
                              >
                                +
                              </button>
                              <button
                                onClick={() => ajustarVidaMonstro(i, p, -5)}
                                className="rounded-full border border-[var(--border-sutil)] px-2 hover:border-ouro"
                              >
                                −5
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            </ColunaFrame>
          )}

          {personagens.length === 0 ? (
            <ColunaFrame className="p-8 text-center text-sm text-foreground/60">
              Nenhum jogador com personagem vinculado ainda.{" "}
              {ehOraculo
                ? "Convide amigos e aprove as solicitações no hub da campanha, ou vincule personagens aos jogadores já aprovados."
                : "Volte ao hub da campanha para vincular o seu."}
            </ColunaFrame>
          ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {personagens.map((p) =>
              p.bloqueado ? (
                <CardPersonagemOculto key={p.id} nome={p.nome} ilustracaoUrl={p.ilustracaoUrl} />
              ) : (
                <CardPersonagemMesa
                  key={p.id}
                  p={p}
                  souDono={p.donoUsuarioId === usuarioId}
                  controleDoOraculo={ehOraculo && p.donoUsuarioId !== usuarioId && !!p.permiteControleMestre}
                  podeDarLoot={ehOraculo && p.donoUsuarioId !== usuarioId}
                  onAjustar={(campo, delta) => {
                    const max = campo === "vidaAtual" ? p.vidaMax : p.estaminaMax;
                    const novo = Math.max(0, Math.min(max, (p[campo] as number) + delta));
                    atualizarPersonagem(p, { [campo]: novo } as Partial<FichaPersonagem>);
                  }}
                  onAjustarDracmas={(delta) => ajustarDracmas(p, delta)}
                  onRolarAtributo={(a, nome) => rolarAtributo(p, a, nome)}
                  onAtacar={() => atacar(p)}
                  onEsforcoExtra={() => esforcoExtra(p)}
                  onDesviar={() => desviar(p)}
                  onEstabilizar={() => estabilizar(p)}
                />
              )
            )}
          </div>
          )}
        </div>

        <aside className="flex h-[calc(100vh-8rem)] flex-col">
          <ColunaFrame className="flex flex-1 flex-col overflow-hidden" titulo="Registro da Sessão">
            <div ref={logRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {sessao?.eventos.map((e) => (
                <div
                  key={e.id}
                  className={`rounded-sm p-2.5 text-sm ${
                    e.tipo === "narracao"
                      ? "border border-ouro/40 bg-ouro-claro/10 italic"
                      : e.tipo === "rolagem"
                        ? "border border-egeu/30 bg-egeu/5 font-gravado text-xs"
                        : e.tipo === "sistema"
                          ? "text-foreground/60 text-xs"
                          : "border border-[var(--border-sutil)]"
                  }`}
                >
                  {e.tipo === "chat" && <span className="font-medium">{e.autorNome}: </span>}
                  {e.conteudo}
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border-sutil)] p-3">
              {ehOraculo && (
                <label className="mb-2 flex items-center gap-2 text-xs text-foreground/70">
                  <input type="checkbox" checked={narrando} onChange={(e) => setNarrando(e.target.checked)} />
                  Narrar como Oráculo
                </label>
              )}
              <div className="flex gap-2">
                <input
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
                  placeholder={narrando ? "Narre a cena…" : "Fale como seu personagem…"}
                  className="flex-1 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                />
                <Botao variante="fantasma" onClick={enviarMensagem}>
                  Enviar
                </Botao>
              </div>
            </div>
          </ColunaFrame>
        </aside>
      </div>
    </div>
  );
}

function CardPersonagemOculto({ nome, ilustracaoUrl }: { nome: string; ilustracaoUrl: string | null }) {
  return (
    <ColunaFrame className="flex items-center gap-3 p-4">
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ouro/50 bg-noite">
        {ilustracaoUrl && <Image src={ilustracaoUrl} alt={nome} fill className="object-cover" />}
      </span>
      <div>
        <p className="font-titulo text-base text-pergaminho">{nome}</p>
        <p className="text-[11px] text-foreground/50">Ficha bloqueada pelo jogador</p>
      </div>
    </ColunaFrame>
  );
}

function CardPersonagemMesa({
  p,
  souDono,
  controleDoOraculo,
  podeDarLoot,
  onAjustar,
  onAjustarDracmas,
  onRolarAtributo,
  onAtacar,
  onEsforcoExtra,
  onDesviar,
  onEstabilizar,
}: {
  p: PersonagemMesa;
  souDono: boolean;
  controleDoOraculo: boolean;
  podeDarLoot: boolean;
  onAjustar: (campo: "vidaAtual" | "estaminaAtual", delta: number) => void;
  onAjustarDracmas: (delta: number) => void;
  onRolarAtributo: (atributo: Atributo, nome: string) => void;
  onAtacar: () => void;
  onEsforcoExtra: () => void;
  onDesviar: () => void;
  onEstabilizar: () => void;
}) {
  const morrendo = p.vidaAtual <= 0;
  const desabado = p.estaminaAtual <= 0;

  return (
    <ColunaFrame className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-titulo text-base text-pergaminho">{p.nome}</p>
          <p className="text-[11px] text-foreground/60">
            {p.parenteDivino} · {p.armamento}
          </p>
        </div>
        <div className="flex gap-1">
          {morrendo && (
            <span className="rounded-full border border-terracota bg-terracota/10 px-2 py-0.5 text-[10px] uppercase text-terracota">
              Morrendo
            </span>
          )}
          {desabado && (
            <span className="rounded-full border border-egeu bg-egeu/10 px-2 py-0.5 text-[10px] uppercase text-egeu">
              Desabado
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <BarraEssencia label="Vida" atual={p.vidaAtual} maximo={p.vidaMax} tipo="vida" />
        <BarraEssencia label="Estamina" atual={p.estaminaAtual} maximo={p.estaminaMax} tipo="estamina" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center text-foreground/60">
          <ContadorDracmas valor={p.dracmas} />
        </span>
        {podeDarLoot && (
          <span className="flex gap-1">
            <button
              onClick={() => onAjustarDracmas(-5)}
              className="rounded-full border border-[var(--border-sutil)] px-2 py-0.5 hover:border-ouro"
            >
              −5
            </button>
            <button
              onClick={() => onAjustarDracmas(5)}
              className="rounded-full border border-[var(--border-sutil)] px-2 py-0.5 hover:border-ouro"
            >
              +5
            </button>
          </span>
        )}
      </div>

      {souDono && (
        <>
          <div className="mt-2 flex gap-3 text-[11px] text-foreground/60">
            <span>
              Vida{" "}
              <button onClick={() => onAjustar("vidaAtual", -1)} className="px-1">
                −
              </button>
              <button onClick={() => onAjustar("vidaAtual", 1)} className="px-1">
                +
              </button>
            </span>
            <span>
              Estamina{" "}
              <button onClick={() => onAjustar("estaminaAtual", -1)} className="px-1">
                −
              </button>
              <button onClick={() => onAjustar("estaminaAtual", 1)} className="px-1">
                +
              </button>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {ATRIBUTOS.map((a) => (
              <button
                key={a.chave}
                onClick={() => onRolarAtributo(a.chave, a.nome)}
                title={a.nome}
                className="rounded-full border border-[var(--border-sutil)] p-1 hover:border-ouro"
              >
                <SeloAtributo atributo={a.chave} icone={a.icone} size={40} />
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
            <button onClick={onAtacar} className="rounded-sm border border-terracota/50 py-1.5 text-terracota hover:bg-terracota/10">
              Atacar
            </button>
            <button onClick={onEsforcoExtra} className="rounded-sm border border-[var(--border-sutil)] py-1.5 hover:border-ouro">
              Esforço Extra
            </button>
            <button onClick={onDesviar} className="rounded-sm border border-[var(--border-sutil)] py-1.5 hover:border-ouro">
              Desviar
            </button>
            {morrendo && (
              <button onClick={onEstabilizar} className="rounded-sm border border-egeu py-1.5 text-egeu hover:bg-egeu/10">
                Estabilizar
              </button>
            )}
          </div>
        </>
      )}

      {!souDono && controleDoOraculo && (
        <div className="mt-2 flex items-center gap-3 border-t border-[var(--border-sutil)] pt-2 text-[11px] text-foreground/60">
          <span className="text-egeu">Controle liberado pelo jogador ·</span>
          <span>
            Vida{" "}
            <button onClick={() => onAjustar("vidaAtual", -1)} className="px-1">
              −
            </button>
            <button onClick={() => onAjustar("vidaAtual", 1)} className="px-1">
              +
            </button>
          </span>
          <span>
            Estamina{" "}
            <button onClick={() => onAjustar("estaminaAtual", -1)} className="px-1">
              −
            </button>
            <button onClick={() => onAjustar("estaminaAtual", 1)} className="px-1">
              +
            </button>
          </span>
        </div>
      )}
    </ColunaFrame>
  );
}
