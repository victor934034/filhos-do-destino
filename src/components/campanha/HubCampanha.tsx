"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Amizade, Campanha, FichaMonstro } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { Seletor } from "@/components/ui/Seletor";
import { dispararMensagem, fetchOuAvisar } from "@/lib/toastMensagens";
import { usePersonagensAoVivo, type PersonagemNaMesa } from "@/lib/usePersonagensAoVivo";

interface PersonagemResumo {
  id: string;
  nome: string;
}

interface MeuVinculo {
  status: string;
  personagemId: string | null;
}

interface EncontroDb {
  id: string;
  nome: string;
  vida: number;
  monstroId: string | null;
  criadoEm: string;
}

type AbaHub = "semideuses" | "jogadores" | "combates";
type PainelAcao = null | "capa" | "editar" | "convidar" | "combate";

const ABAS: { chave: AbaHub; rotulo: string }[] = [
  { chave: "semideuses", rotulo: "Semideuses" },
  { chave: "jogadores", rotulo: "Jogadores" },
  { chave: "combates", rotulo: "Combates" },
];

export function HubCampanha({
  campanhaInicial,
  ehOraculo,
  meuVinculo,
  meusPersonagens,
  acessoLiberado,
  personagensIniciais,
  monstrosDisponiveis,
}: {
  campanhaInicial: Campanha;
  ehOraculo: boolean;
  meuVinculo: MeuVinculo | null;
  meusPersonagens: PersonagemResumo[];
  usuarioId: string;
  nomeUsuario: string;
  acessoLiberado: boolean;
  personagensIniciais: PersonagemNaMesa[];
  monstrosDisponiveis: FichaMonstro[];
}) {
  const router = useRouter();
  const [campanha, setCampanha] = useState(campanhaInicial);
  const [personagens] = usePersonagensAoVivo(campanha.id, personagensIniciais);
  const [personagemEscolhido, setPersonagemEscolhido] = useState(meusPersonagens[0]?.id ?? "");
  const [carregando, setCarregando] = useState(false);
  const [tituloMissao, setTituloMissao] = useState("");
  const [descricaoMissao, setDescricaoMissao] = useState("");
  const [vinculandoPersonagem, setVinculandoPersonagem] = useState(meuVinculo?.personagemId ?? "");
  const [salvandoVinculo, setSalvandoVinculo] = useState(false);
  const [amigos, setAmigos] = useState<Amizade[] | null>(null);
  const [convidando, setConvidando] = useState<string | null>(null);
  const [painel, setPainel] = useState<PainelAcao>(null);
  const [rascunhoCapa, setRascunhoCapa] = useState(campanha.capaUrl ?? "");
  const [rascunho, setRascunho] = useState({ nome: campanha.nome, sinopse: campanha.sinopse });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [aba, setAba] = useState<AbaHub>("semideuses");

  function alternarPainel(p: Exclude<PainelAcao, null>) {
    setPainel((atual) => (atual === p ? null : p));
  }

  async function salvarCapa() {
    setSalvandoEdicao(true);
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capaUrl: rascunhoCapa || null }),
    });
    if (res) {
      setCampanha(await res.json());
      dispararMensagem("sucesso", "Capa atualizada.");
      setPainel(null);
    }
    setSalvandoEdicao(false);
  }

  async function salvarEdicao() {
    setSalvandoEdicao(true);
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: rascunho.nome, sinopse: rascunho.sinopse }),
    });
    if (res) {
      setCampanha(await res.json());
      dispararMensagem("sucesso", "Campanha atualizada.");
      setPainel(null);
    }
    setSalvandoEdicao(false);
  }

  useEffect(() => {
    if (!ehOraculo) return;
    fetch("/api/amigos")
      .then((r) => r.json())
      .then(setAmigos);
  }, [ehOraculo]);

  async function convidarAmigo(usuarioIdAlvo: string) {
    setConvidando(usuarioIdAlvo);
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}/convidar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuarioIdAlvo }),
    });
    if (res) {
      dispararMensagem("sucesso", "Convite enviado — a pessoa já entrou na campanha.");
      await recarregar();
    }
    setConvidando(null);
  }

  async function vincularMeuPersonagem() {
    setSalvandoVinculo(true);
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}/meu-personagem`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personagemId: vinculandoPersonagem || null }),
    });
    if (res) {
      dispararMensagem("sucesso", "Personagem vinculado.");
      router.refresh();
    }
    setSalvandoVinculo(false);
  }

  async function recarregar() {
    const res = await fetch(`/api/campanhas/${campanha.id}`);
    if (res.ok) setCampanha(await res.json());
  }

  async function solicitarEntrada() {
    setCarregando(true);
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}/entrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personagemId: personagemEscolhido || null }),
    });
    if (res) {
      dispararMensagem("sucesso", "Solicitação enviada ao Oráculo.");
      router.refresh();
    }
    setCarregando(false);
  }

  async function definirStatusJogador(jogadorId: string, status: "aprovado" | "recusado") {
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}/jogadores/${jogadorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res) await recarregar();
  }

  async function removerJogador(jogadorId: string) {
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}/jogadores/${jogadorId}`, { method: "DELETE" });
    if (res) await recarregar();
  }

  async function criarMissao() {
    if (!tituloMissao.trim()) return;
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}/missoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: tituloMissao, descricao: descricaoMissao }),
    });
    if (res) {
      setTituloMissao("");
      setDescricaoMissao("");
      await recarregar();
    }
  }

  async function alternarMissao(missaoId: string, statusAtual: string) {
    const res = await fetchOuAvisar(`/api/campanhas/${campanha.id}/missoes/${missaoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusAtual === "concluida" ? "aberta" : "concluida" }),
    });
    if (res) await recarregar();
  }

  const aprovados = campanha.jogadores.filter((j) => j.status === "aprovado");
  const pendentes = campanha.jogadores.filter((j) => j.status === "pendente");
  const semideusesVisiveis = ehOraculo || !campanha.ocultarSemideusesParaJogadores;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {/* Nível 2 — linha de botões de ação */}
      <div className="flex flex-wrap items-center gap-3">
        {acessoLiberado && (
          <BotaoLink href={`/app/campanhas/${campanha.id}/mesa`} className="relative">
            Jogar na Mesa Ao Vivo
          </BotaoLink>
        )}
        {ehOraculo && (
          <>
            <Botao variante="fantasma" onClick={() => alternarPainel("capa")}>
              Foto de Capa
            </Botao>
            <BotaoLink href={`/app/personagens/novo?campanhaId=${campanha.id}`} variante="fantasma">
              Adicionar Semideuses
            </BotaoLink>
            <Botao variante="fantasma" onClick={() => alternarPainel("convidar")}>
              Convidar Jogadores
            </Botao>
            <Botao variante="fantasma" onClick={() => alternarPainel("editar")}>
              Editar Campanha
            </Botao>
            <Botao
              variante="fantasma"
              onClick={() => {
                setAba("combates");
                alternarPainel("combate");
              }}
            >
              Criar Combate
            </Botao>
            <BotaoLink href={`/app/campanhas/${campanha.id}/escudo`} variante="fantasma">
              Escudo do Oráculo
            </BotaoLink>
          </>
        )}
        {acessoLiberado && (
          <>
            <BotaoLink href={`/app/campanhas/${campanha.id}/mercado`} variante="fantasma">
              Mercado
            </BotaoLink>
            <BotaoLink href={`/app/stream/${campanha.id}`} variante="fantasma">
              Estúdio de Stream
            </BotaoLink>
          </>
        )}
      </div>

      {painel === "capa" && (
        <ColunaFrame className="mt-6 max-w-lg space-y-3 p-5">
          <CampoImagem value={rascunhoCapa} onChange={setRascunhoCapa} aspecto={16 / 9} />
          <Botao onClick={salvarCapa} disabled={salvandoEdicao}>
            {salvandoEdicao ? "Salvando…" : "Salvar capa"}
          </Botao>
        </ColunaFrame>
      )}

      {painel === "editar" && (
        <ColunaFrame className="mt-6 max-w-2xl space-y-3 p-5">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">Nome</label>
            <input
              value={rascunho.nome}
              onChange={(e) => setRascunho((r) => ({ ...r, nome: e.target.value }))}
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">Sinopse</label>
            <textarea
              value={rascunho.sinopse}
              onChange={(e) => setRascunho((r) => ({ ...r, sinopse: e.target.value }))}
              rows={3}
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
            />
          </div>
          <Botao onClick={salvarEdicao} disabled={salvandoEdicao}>
            {salvandoEdicao ? "Salvando…" : "Salvar alterações"}
          </Botao>
        </ColunaFrame>
      )}

      {painel === "convidar" && (
        <ColunaFrame titulo="Convidar amigos" className="mt-6 max-w-lg">
          <div className="p-4">
            {campanha.visibilidade === "privada" && (
              <p className="mb-3 text-xs text-foreground/60">
                Esta campanha é privada — convidar um amigo é a única forma de ele entrar.
              </p>
            )}
            {amigos === null ? (
              <p className="text-xs text-foreground/50">Carregando amigos…</p>
            ) : (
              (() => {
                const disponiveis = amigos
                  .filter((a) => a.status === "aceita")
                  .filter((a) => !campanha.jogadores.some((j) => j.usuarioId === a.outro.id));
                return disponiveis.length === 0 ? (
                  <p className="text-xs text-foreground/50">
                    Nenhum amigo disponível para convidar.{" "}
                    <BotaoLink href="/app/amigos" variante="fantasma" className="mt-2 inline-flex px-3 py-1 text-[10px]">
                      Adicionar amigos
                    </BotaoLink>
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {disponiveis.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                        <span>{a.outro.nome}</span>
                        <button
                          onClick={() => convidarAmigo(a.outro.id)}
                          disabled={convidando === a.outro.id}
                          className="rounded-full border border-ouro px-2.5 py-1 text-[11px] uppercase text-bronze hover:bg-ouro-claro/20 disabled:opacity-50"
                        >
                          {convidando === a.outro.id ? "Convidando…" : "Convidar"}
                        </button>
                      </li>
                    ))}
                  </ul>
                );
              })()
            )}
          </div>
        </ColunaFrame>
      )}

      <div className="mt-6">
        {campanha.capaUrl && (
          <div className="relative h-64 w-full max-w-md overflow-hidden rounded-sm border border-[var(--border-sutil)] sm:h-56">
            <Image src={campanha.capaUrl} alt={campanha.nome} fill className="object-cover" />
            {campanha.oficial && (
              <span className="absolute left-3 top-3 rounded-full border border-ouro bg-ouro/90 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest text-tinta">
                Original
              </span>
            )}
          </div>
        )}
        <h1 className="mt-4 font-titulo text-3xl text-pergaminho">{campanha.nome}</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Mestrada por {campanha.oraculoNome} · {aprovados.length}/{campanha.vagasMaximas} jogadores
        </p>
        {campanha.sinopse && (
          <ColunaFrame variante="pergaminho" className="mt-4 max-w-3xl p-4">
            <p className="text-base italic leading-relaxed">{campanha.sinopse}</p>
          </ColunaFrame>
        )}
      </div>
      <Divisor className="mt-6" />

      {!ehOraculo && !meuVinculo && (
        <ColunaFrame className="mt-8 p-6">
          <h3 className="font-titulo text-sm uppercase tracking-wide text-bronze">Solicitar entrada</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Escolha o personagem que você quer levar para esta campanha (opcional).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Seletor
              value={personagemEscolhido}
              onChange={setPersonagemEscolhido}
              className="w-56"
              opcoes={[
                { valor: "", rotulo: "Decidir depois" },
                ...meusPersonagens.map((p) => ({ valor: p.id, rotulo: p.nome })),
              ]}
            />
            <Botao onClick={solicitarEntrada} disabled={carregando}>
              {carregando ? "Enviando…" : "Solicitar entrada"}
            </Botao>
            <span className="text-xs text-foreground/50">ou</span>
            <BotaoLink href={`/app/personagens/novo?campanhaId=${campanha.id}`} variante="fantasma">
              Criar personagem para esta campanha
            </BotaoLink>
          </div>
        </ColunaFrame>
      )}

      {!ehOraculo && meuVinculo?.status === "pendente" && (
        <ColunaFrame className="mt-8 p-6 text-sm text-foreground/70">
          Sua solicitação está aguardando aprovação do Oráculo.
        </ColunaFrame>
      )}

      {!ehOraculo && meuVinculo && meusPersonagens.length > 0 && (
        <ColunaFrame className="mt-8 p-6">
          <h3 className="font-titulo text-sm uppercase tracking-wide text-bronze">Seu personagem nesta campanha</h3>
          <p className="mt-2 text-sm text-foreground/70">
            {meuVinculo.personagemId
              ? "Você pode trocar qual dos seus personagens está levando para esta mesa."
              : "Você ainda não escolheu um personagem para esta campanha — puxe um da sua conta."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Seletor
              value={vinculandoPersonagem}
              onChange={setVinculandoPersonagem}
              className="w-56"
              opcoes={[
                { valor: "", rotulo: "Nenhum" },
                ...meusPersonagens.map((p) => ({ valor: p.id, rotulo: p.nome })),
              ]}
            />
            <Botao
              onClick={vincularMeuPersonagem}
              disabled={salvandoVinculo || vinculandoPersonagem === (meuVinculo.personagemId ?? "")}
            >
              {salvandoVinculo ? "Salvando…" : "Salvar"}
            </Botao>
          </div>
        </ColunaFrame>
      )}

      {/* Nível 2 — abas: Semideuses | Jogadores | Combates */}
      <div className="mt-10">
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
          {aba === "semideuses" &&
            (semideusesVisiveis ? (
              <AbaSemideuses personagens={personagens} />
            ) : (
              <ColunaFrame className="p-8 text-center text-sm text-foreground/60">
                O Oráculo desta campanha ocultou os Semideuses.
              </ColunaFrame>
            ))}

          {aba === "jogadores" && (
            <AbaJogadores
              pendentes={pendentes}
              aprovados={aprovados}
              ehOraculo={ehOraculo}
              onAprovar={(id) => definirStatusJogador(id, "aprovado")}
              onRecusar={(id) => definirStatusJogador(id, "recusado")}
              onRemover={removerJogador}
            />
          )}

          {aba === "combates" && (
            <AbaCombatesPreset
              campanhaId={campanha.id}
              ehOraculo={ehOraculo}
              monstrosDisponiveis={monstrosDisponiveis}
              abrirForm={painel === "combate"}
              onFormFechado={() => setPainel(null)}
            />
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <ColunaFrame titulo="Quadro de Missões">
          <div className="space-y-3 p-5">
            {campanha.missoes.length === 0 && (
              <p className="text-sm text-foreground/50">Nenhuma missão registrada ainda.</p>
            )}
            {campanha.missoes.map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-3 rounded-sm border border-[var(--border-sutil)] p-3"
              >
                <div>
                  <p className={`text-sm font-medium ${m.status === "concluida" ? "line-through text-foreground/40" : ""}`}>
                    {m.titulo}
                  </p>
                  {m.descricao && <p className="text-xs text-foreground/60">{m.descricao}</p>}
                </div>
                {ehOraculo && (
                  <button
                    onClick={() => alternarMissao(m.id, m.status)}
                    className="shrink-0 rounded-full border border-[var(--border-sutil)] px-3 py-1 text-[11px] uppercase tracking-wide hover:border-ouro"
                  >
                    {m.status === "concluida" ? "Reabrir" : "Concluir"}
                  </button>
                )}
              </div>
            ))}

            {ehOraculo && (
              <div className="mt-4 rounded-sm border border-dashed border-[var(--border-sutil)] p-4">
                <input
                  value={tituloMissao}
                  onChange={(e) => setTituloMissao(e.target.value)}
                  placeholder="Título da missão"
                  className="mb-2 w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                />
                <textarea
                  value={descricaoMissao}
                  onChange={(e) => setDescricaoMissao(e.target.value)}
                  rows={2}
                  placeholder="Descrição…"
                  className="mb-2 w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                />
                <Botao variante="fantasma" onClick={criarMissao}>
                  Adicionar missão
                </Botao>
              </div>
            )}
          </div>
        </ColunaFrame>

        <ColunaFrame titulo="Regras da Casa">
          <div className="space-y-1 p-5 text-sm text-foreground/75">
            <p>Pontos de atributo na criação: {campanha.regrasDaCasa.pontosAtributo}</p>
            <p>
              Limite de especialidades: {campanha.regrasDaCasa.limiteEspecialidadesTreinado} Treinado ·{" "}
              {campanha.regrasDaCasa.limiteEspecialidadesMestre} Mestre
            </p>
            <p>Venda no Mercado devolve: {Math.round(campanha.regrasDaCasa.fracaoVendaMercado * 100)}% do preço pago</p>
            <p>{campanha.regrasDaCasa.formulaEssencias}</p>
            <p>
              Especialidade customizada sem aprovação:{" "}
              {campanha.regrasDaCasa.permiteEspecialidadeCustomizadaSemAprovacao ? "sim" : "não"}
            </p>
          </div>
        </ColunaFrame>
      </div>
    </div>
  );
}

// ---------- Aba Semideuses — grid simples de acesso à ficha ----------
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
      {personagens.map((p) =>
        p.bloqueado ? (
          <ColunaFrame key={p.id} className="flex items-center gap-3 p-4">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ouro/50 bg-noite">
              {p.ilustracaoUrl && <Image src={p.ilustracaoUrl} alt={p.nome} fill className="object-cover" />}
            </span>
            <div>
              <p className="font-titulo text-base text-pergaminho">{p.nome}</p>
              <p className="text-[11px] text-foreground/50">Ficha bloqueada pelo jogador</p>
            </div>
          </ColunaFrame>
        ) : (
          <ColunaFrame key={p.id} className="flex items-center gap-3 p-4">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-ouro/50 bg-noite">
              {p.ilustracaoUrl ? (
                <Image src={p.ilustracaoUrl} alt={p.nome} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-ouro/40">
                  <span className="h-4 w-4 rotate-45 border border-ouro/60" />
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-titulo text-base text-pergaminho">{p.nome}</p>
              <p className="truncate text-[11px] text-foreground/60">
                {p.parenteDivino} · {p.armamento}
              </p>
            </div>
            <BotaoLink href={`/app/personagens/${p.id}`} variante="fantasma" className="shrink-0 px-3 py-1.5 text-xs">
              Acessar Ficha
            </BotaoLink>
          </ColunaFrame>
        )
      )}
    </div>
  );
}

// ---------- Aba Jogadores — gestão de quem está na campanha ----------
interface JogadorCampanhaResumo {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  personagemNome: string | null;
}

function AbaJogadores({
  pendentes,
  aprovados,
  ehOraculo,
  onAprovar,
  onRecusar,
  onRemover,
}: {
  pendentes: JogadorCampanhaResumo[];
  aprovados: JogadorCampanhaResumo[];
  ehOraculo: boolean;
  onAprovar: (id: string) => void;
  onRecusar: (id: string) => void;
  onRemover: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {ehOraculo && pendentes.length > 0 && (
        <ColunaFrame titulo="Solicitações pendentes">
          <ul className="space-y-3 p-4">
            {pendentes.map((j) => (
              <li key={j.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{j.usuarioNome}</p>
                  {j.personagemNome && <p className="text-xs text-foreground/60">{j.personagemNome}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => onAprovar(j.id)}
                    className="rounded-full border border-ouro px-2.5 py-1 text-[11px] uppercase text-bronze hover:bg-ouro-claro/20"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => onRecusar(j.id)}
                    className="rounded-full border border-terracota/50 px-2.5 py-1 text-[11px] uppercase text-terracota hover:bg-terracota/10"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </ColunaFrame>
      )}

      {aprovados.length === 0 ? (
        <ColunaFrame className="p-8 text-center text-sm text-foreground/60">
          Nenhum jogador aprovado nesta campanha ainda.
        </ColunaFrame>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aprovados.map((j) => (
            <ColunaFrame key={j.id} className="p-4">
              <p className="font-titulo text-base text-pergaminho">{j.usuarioNome}</p>
              {j.personagemNome && <p className="mt-1 text-xs text-foreground/60">{j.personagemNome}</p>}
              {ehOraculo && (
                <button
                  onClick={() => onRemover(j.id)}
                  className="mt-3 rounded-full border border-terracota/50 px-3 py-1 text-[11px] uppercase text-terracota hover:bg-terracota/10"
                >
                  Remover
                </button>
              )}
            </ColunaFrame>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Aba Combates — encontros pré-montados (não é a sessão ao vivo) ----------
function AbaCombatesPreset({
  campanhaId,
  ehOraculo,
  monstrosDisponiveis,
  abrirForm,
  onFormFechado,
}: {
  campanhaId: string;
  ehOraculo: boolean;
  monstrosDisponiveis: FichaMonstro[];
  abrirForm: boolean;
  onFormFechado: () => void;
}) {
  const [encontros, setEncontros] = useState<EncontroDb[] | null>(null);
  const [nome, setNome] = useState("");
  const [vida, setVida] = useState(10);
  const [monstroId, setMonstroId] = useState("");

  async function recarregar() {
    const res = await fetch(`/api/campanhas/${campanhaId}/encontros`);
    if (res.ok) setEncontros(await res.json());
  }

  useEffect(() => {
    let cancelado = false;
    fetch(`/api/campanhas/${campanhaId}/encontros`)
      .then((r) => (r.ok ? r.json() : null))
      .then((dados) => {
        if (!cancelado && dados) setEncontros(dados);
      });
    return () => {
      cancelado = true;
    };
  }, [campanhaId]);

  function escolherMonstro(id: string) {
    setMonstroId(id);
    const m = monstrosDisponiveis.find((x) => x.id === id);
    if (m) {
      setNome(m.nome);
      setVida(m.vida);
    }
  }

  async function criar() {
    if (!nome.trim()) return;
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/encontros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, vida, monstroId: monstroId || null }),
    });
    if (res) {
      setNome("");
      setVida(10);
      setMonstroId("");
      onFormFechado();
      await recarregar();
    }
  }

  async function remover(id: string) {
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/encontros/${id}`, { method: "DELETE" });
    if (res) await recarregar();
  }

  return (
    <div className="space-y-5">
      {ehOraculo && abrirForm && (
        <ColunaFrame titulo="Criar Combate" className="max-w-lg">
          <div className="space-y-2 p-4">
            {monstrosDisponiveis.length > 0 && (
              <Seletor
                value={monstroId}
                onChange={escolherMonstro}
                className="w-full"
                opcoes={[
                  { valor: "", rotulo: "Nome customizado" },
                  ...monstrosDisponiveis.map((m) => ({ valor: m.id!, rotulo: m.nome })),
                ]}
              />
            )}
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do encontro"
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
            />
            <input
              type="number"
              value={vida}
              onChange={(e) => setVida(Number(e.target.value))}
              placeholder="Vida"
              className="w-32 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
            />
            <div className="flex gap-2">
              <Botao variante="fantasma" onClick={criar}>
                Criar
              </Botao>
              <button onClick={onFormFechado} className="text-xs text-foreground/60 hover:underline">
                cancelar
              </button>
            </div>
          </div>
        </ColunaFrame>
      )}

      {encontros === null && <p className="text-sm text-foreground/50">Carregando…</p>}
      {encontros?.length === 0 && (
        <ColunaFrame className="p-8 text-center text-sm text-foreground/60">
          Nenhum combate preparado ainda. {ehOraculo && 'Use o botão "Criar Combate" acima.'}
        </ColunaFrame>
      )}

      {encontros && encontros.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {encontros.map((e) => (
            <ColunaFrame key={e.id} className="p-4">
              <p className="font-titulo text-base text-pergaminho">{e.nome}</p>
              <p className="mt-1 text-xs text-foreground/60">VD: {e.vida}</p>
              {ehOraculo && (
                <button
                  onClick={() => remover(e.id)}
                  className="mt-3 rounded-full border border-terracota/50 px-3 py-1 text-[11px] uppercase text-terracota hover:bg-terracota/10"
                >
                  Remover
                </button>
              )}
            </ColunaFrame>
          ))}
        </div>
      )}
    </div>
  );
}
