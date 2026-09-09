"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATRIBUTOS,
  ARMAMENTOS,
  CASAS_DIVINAS,
  ESPECIALIDADES_BASICAS,
  TOTAL_PONTOS_ATRIBUTO_PADRAO,
  VALOR_MAX_ATRIBUTO,
  VALOR_MIN_ATRIBUTO,
  dadoDoAtributo,
  atributoDoArmamento,
  type Atributo,
  type Armamento,
  type NivelEspecialidade,
} from "@/lib/regras";
import { fichaPadrao, regrasDaCasaPadrao, type FichaPersonagem, type EspecialidadeSelecionada, type RegrasDaCasa } from "@/lib/tipos";
import { Botao } from "@/components/ui/Botao";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { SeloAtributo } from "@/components/ui/SeloAtributo";
import { Dica } from "@/components/ui/Dica";
import { BarraEssencia } from "@/components/ui/BarraEssencia";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { Seletor } from "@/components/ui/Seletor";
import { SeletorCasaDivina } from "@/components/wizard/SeletorCasaDivina";

const PASSOS = [
  "Identidade",
  "Atributos",
  "Armamento",
  "Especialidades",
  "Essências",
  "Estilos de Combate",
  "Poderes",
  "Itens",
  "Revisão",
] as const;

function somaAtributos(f: FichaPersonagem) {
  return f.forca + f.destreza + f.vigor + f.inteligencia + f.carisma + f.aparencia;
}

function calcularEssencias(f: FichaPersonagem) {
  // Fórmula padrão de base (a Regra da Casa da campanha pode sobrescrever isso futuramente).
  const vidaMax = 10 + f.vigor * 2;
  const estaminaMax = 10 + f.vigor + f.destreza;
  const aspis = 8 + f.destreza + Math.ceil(f.vigor / 2);
  return { vidaMax, estaminaMax, aspis };
}

export function AssistenteCriacao({ campanhaId }: { campanhaId?: string } = {}) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [ficha, setFicha] = useState<FichaPersonagem>(fichaPadrao());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [regrasDaCasa, setRegrasDaCasa] = useState<RegrasDaCasa>(regrasDaCasaPadrao());

  useEffect(() => {
    if (!campanhaId) return;
    fetch(`/api/campanhas/${campanhaId}`)
      .then((r) => r.json())
      .then((c) => c?.regrasDaCasa && setRegrasDaCasa(c.regrasDaCasa))
      .catch(() => {});
  }, [campanhaId]);

  function atualizar<K extends keyof FichaPersonagem>(campo: K, valor: FichaPersonagem[K]) {
    setFicha((f) => ({ ...f, [campo]: valor }));
  }

  const podeAvancar = useMemo(() => {
    if (passo === 0) return ficha.nome.trim().length >= 2;
    return true;
  }, [passo, ficha.nome]);

  async function finalizar() {
    setSalvando(true);
    setErro(null);
    const { vidaMax, estaminaMax, aspis } = calcularEssencias(ficha);
    const fichaFinal: FichaPersonagem = {
      ...ficha,
      vidaMax,
      vidaAtual: vidaMax,
      estaminaMax,
      estaminaAtual: estaminaMax,
      aspis,
    };
    try {
      const res = await fetch("/api/personagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fichaFinal),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Não foi possível salvar o personagem.");
        setSalvando(false);
        return;
      }

      if (campanhaId) {
        const entrada = await fetch(`/api/campanhas/${campanhaId}/entrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personagemId: json.id }),
        });
        // Se já tinha solicitação pendente (409) ainda assim o personagem foi criado —
        // manda pra campanha de qualquer forma, o jogador ajusta o vínculo lá.
        if (entrada.ok || entrada.status === 409) {
          router.push(`/app/campanhas/${campanhaId}`);
          return;
        }
      }

      router.push(`/app/personagens/${json.id}`);
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      {/* trilha de progresso */}
      <div className="mb-10 flex items-center gap-1">
        {PASSOS.map((nome, i) => (
          <div key={nome} className="group relative flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= passo ? "bg-ouro" : "bg-[var(--border-sutil)]"
              }`}
            />
            <span className="pointer-events-none absolute left-1/2 top-3 hidden -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wide text-foreground/60 group-hover:block">
              {nome}
            </span>
          </div>
        ))}
      </div>

      <p className="mb-2 font-titulo text-xs uppercase tracking-[0.25em] text-bronze">
        Etapa {passo + 1} de {PASSOS.length}
      </p>
      <h1 className="mb-8 font-titulo text-2xl uppercase tracking-wide text-pergaminho">{PASSOS[passo]}</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ColunaFrame className="p-6 md:p-8">
          {passo === 0 && <PassoIdentidade ficha={ficha} atualizar={atualizar} />}
          {passo === 1 && <PassoAtributos ficha={ficha} atualizar={atualizar} />}
          {passo === 2 && <PassoArmamento ficha={ficha} atualizar={atualizar} />}
          {passo === 3 && <PassoEspecialidades ficha={ficha} atualizar={atualizar} regrasDaCasa={regrasDaCasa} />}
          {passo === 4 && <PassoEssencias ficha={ficha} />}
          {passo === 5 && <PassoEstilos ficha={ficha} atualizar={atualizar} />}
          {passo === 6 && <PassoPoderes ficha={ficha} atualizar={atualizar} />}
          {passo === 7 && <PassoItens ficha={ficha} atualizar={atualizar} />}
          {passo === 8 && <PassoRevisao ficha={ficha} />}
        </ColunaFrame>

        <aside className="h-fit rounded-sm border border-[var(--border-sutil)] bg-[var(--surface)] p-5">
          <h4 className="font-titulo text-xs uppercase tracking-[0.16em] text-bronze">
            O que isso significa?
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">{TEXTOS_AJUDA[passo]}</p>
        </aside>
      </div>

      {erro && (
        <p className="mt-6 rounded-sm border border-terracota/50 bg-terracota/10 px-3 py-2 text-sm text-terracota">
          {erro}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <Botao variante="fantasma" onClick={() => setPasso((p) => Math.max(0, p - 1))} disabled={passo === 0}>
          Voltar
        </Botao>
        {passo < PASSOS.length - 1 ? (
          <Botao onClick={() => setPasso((p) => Math.min(PASSOS.length - 1, p + 1))} disabled={!podeAvancar}>
            Avançar
          </Botao>
        ) : (
          <Botao onClick={finalizar} disabled={salvando}>
            {salvando ? "Gravando o destino…" : "Concluir e salvar ficha"}
          </Botao>
        )}
      </div>
    </div>
  );
}

const TEXTOS_AJUDA = [
  "O nome, a história e a linhagem divina do seu personagem. O Parente Divino define de qual deus corre o sangue em suas veias — e, mais tarde, sua magia.",
  "Distribua pontos entre os seis atributos (1 a 5). Cada valor corresponde a um dado: 1=D4, 2=D6, 3=D8, 4=D10, 5=D12. Testes rolam 1d20 + esse dado.",
  "O Armamento define qual atributo você usa para atacar em combate: Lutador usa Força, Espadachim usa Destreza, Atirador usa Aparência.",
  "Especialidades representam treino. Treinado sobe seu dado uma categoria; Mestre sobe a categoria e permite rolar de novo, ficando com o melhor resultado.",
  "Vida, Estamina e Áspis nascem de uma fórmula base ligada aos seus atributos. O Oráculo da sua campanha pode ajustar essa fórmula depois.",
  "Estilos de Combate são frases temáticas que descrevem como você luta. Quando um se aplica ao ataque, ele soma +1d6 de dano.",
  "Se seu Parente Divino tem um atributo de Foco, você rola 1d6 por ponto nesse atributo. Pares de faces iguais aumentam dano, alcance ou duração da magia.",
  "Armas, consumíveis e itens narrativos que acompanham seu personagem desde o início da jornada.",
  "Revise sua ficha completa antes de gravá-la. Você poderá editá-la depois na sua Câmara do Semideus.",
];

// ---------- Passo 1: Identidade ----------
function PassoIdentidade({
  ficha,
  atualizar,
}: {
  ficha: FichaPersonagem;
  atualizar: <K extends keyof FichaPersonagem>(c: K, v: FichaPersonagem[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <Campo label="Nome do personagem">
        <input
          value={ficha.nome}
          onChange={(e) => atualizar("nome", e.target.value)}
          placeholder="Ex.: Athos Kallis"
          className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
        />
      </Campo>

      <Campo label="Parente Divino">
        <SeletorCasaDivina value={ficha.parenteDivino} onChange={(v) => atualizar("parenteDivino", v)} />
      </Campo>

      <Campo label="Ilustração (opcional)">
        <CampoImagem
          value={ficha.ilustracaoUrl ?? ""}
          onChange={(url) => atualizar("ilustracaoUrl", url)}
        />
      </Campo>

      <Campo label="História breve">
        <textarea
          value={ficha.historia}
          onChange={(e) => atualizar("historia", e.target.value)}
          rows={5}
          placeholder="Quem é seu semideus antes de descobrir sua herança?"
          className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
        />
      </Campo>
    </div>
  );
}

// ---------- Passo 2: Atributos ----------
function PassoAtributos({
  ficha,
  atualizar,
}: {
  ficha: FichaPersonagem;
  atualizar: <K extends keyof FichaPersonagem>(c: K, v: FichaPersonagem[K]) => void;
}) {
  const total = somaAtributos(ficha);
  const restante = TOTAL_PONTOS_ATRIBUTO_PADRAO - total;

  function mudar(chave: Atributo, delta: number) {
    const atual = ficha[chave] as number;
    const novo = atual + delta;
    if (novo < VALOR_MIN_ATRIBUTO || novo > VALOR_MAX_ATRIBUTO) return;
    if (delta > 0 && restante <= 0) return;
    atualizar(chave, novo as FichaPersonagem[typeof chave]);
  }

  return (
    <div>
      <p className="mb-6 text-sm text-foreground/70">
        Pontos disponíveis:{" "}
        <span className={`font-gravado ${restante < 0 ? "text-terracota" : "text-bronze"}`}>{restante}</span>{" "}
        de {TOTAL_PONTOS_ATRIBUTO_PADRAO}
      </p>
      <div className="space-y-4">
        {ATRIBUTOS.map((a) => {
          const valor = ficha[a.chave] as number;
          return (
            <div key={a.chave} className="flex items-center gap-4">
              <Dica texto={a.descricao}>
                <SeloAtributo atributo={a.chave} icone={a.icone} />
              </Dica>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">{a.nome}</span>
                  <span className="font-gravado text-xs text-foreground/60">D{dadoDoAtributo(valor)}</span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: VALOR_MAX_ATRIBUTO }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 flex-1 rounded-full ${i < valor ? "bg-ouro" : "bg-[var(--border-sutil)]"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => mudar(a.chave, -1)}
                  className="h-7 w-7 rounded-full border border-[var(--border-sutil)] text-sm hover:border-ouro"
                >
                  −
                </button>
                <span className="w-4 text-center font-gravado text-sm">{valor}</span>
                <button
                  onClick={() => mudar(a.chave, 1)}
                  className="h-7 w-7 rounded-full border border-[var(--border-sutil)] text-sm hover:border-ouro"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Passo 3: Armamento ----------
function PassoArmamento({
  ficha,
  atualizar,
}: {
  ficha: FichaPersonagem;
  atualizar: <K extends keyof FichaPersonagem>(c: K, v: FichaPersonagem[K]) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {ARMAMENTOS.map((op) => {
        const ativo = ficha.armamento === op.nome;
        const valorAtributo = ficha[op.atributo] as number;
        return (
          <button
            key={op.nome}
            onClick={() => atualizar("armamento", op.nome as Armamento)}
            className="flex flex-col items-center text-center"
          >
            <span
              className={`flex h-24 w-24 items-center justify-center rounded-full border-2 text-center transition ${
                ativo
                  ? "border-ouro bg-gradient-to-b from-ouro-claro/25 to-transparent shadow-[0_0_18px_rgba(224,151,58,0.45)]"
                  : "border-[var(--border-sutil)] hover:border-ouro/60"
              }`}
            >
              <span className="font-titulo text-xs uppercase tracking-wide text-bronze">{op.nome}</span>
            </span>
            <p className="mt-3 text-xs leading-relaxed text-foreground/70">{op.estilo}</p>
            <p className="mt-2 font-gravado text-[11px] text-foreground/50">
              1d20 + 1d{dadoDoAtributo(valorAtributo)} ({op.atributo}) vs Áspis do alvo
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Passo 4: Especialidades ----------
function PassoEspecialidades({
  ficha,
  atualizar,
  regrasDaCasa,
}: {
  ficha: FichaPersonagem;
  atualizar: <K extends keyof FichaPersonagem>(c: K, v: FichaPersonagem[K]) => void;
  regrasDaCasa: RegrasDaCasa;
}) {
  const [busca, setBusca] = useState("");
  const [nomeCustom, setNomeCustom] = useState("");

  const nomesSelecionados = new Set(ficha.especialidades.map((e) => e.nome));
  const qtdTreinado = ficha.especialidades.filter((e) => e.nivel === "treinado").length;
  const qtdMestre = ficha.especialidades.filter((e) => e.nivel === "mestre").length;
  const limiteTreinadoAtingido = qtdTreinado >= regrasDaCasa.limiteEspecialidadesTreinado;
  const limiteMestreAtingido = qtdMestre >= regrasDaCasa.limiteEspecialidadesMestre;

  function nivelAtual(nome: string): NivelEspecialidade {
    return ficha.especialidades.find((e) => e.nome === nome)?.nivel ?? "nenhum";
  }

  function definirNivel(nome: string, atributoRecomendado: string, nivel: NivelEspecialidade, customizada = false) {
    const restantes = ficha.especialidades.filter((e) => e.nome !== nome);
    if (nivel === "nenhum") {
      atualizar("especialidades", restantes);
      return;
    }
    const nova: EspecialidadeSelecionada = { nome, atributoRecomendado, nivel, customizada };
    atualizar("especialidades", [...restantes, nova]);
  }

  const lista = ESPECIALIDADES_BASICAS.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 rounded-sm border border-[var(--border-sutil)] bg-background/40 px-4 py-2.5 text-xs">
        <span className={qtdTreinado >= regrasDaCasa.limiteEspecialidadesTreinado ? "text-ouro" : "text-foreground/70"}>
          Treinado: {qtdTreinado}/{regrasDaCasa.limiteEspecialidadesTreinado}
        </span>
        <span className={qtdMestre >= regrasDaCasa.limiteEspecialidadesMestre ? "text-ouro" : "text-foreground/70"}>
          Mestre: {qtdMestre}/{regrasDaCasa.limiteEspecialidadesMestre}
        </span>
        <span className="text-foreground/45">Limite definido pelo Oráculo desta campanha (regra da casa).</span>
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar especialidade…"
        className="mb-4 w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
      />

      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {lista.map((e) => {
          const nivel = nivelAtual(e.nome);
          return (
            <div
              key={e.nome}
              className="flex items-center justify-between gap-3 rounded-sm border border-[var(--border-sutil)] p-3"
            >
              <div>
                <p className="text-sm font-medium">{e.nome}</p>
                <p className="text-xs text-foreground/60">{e.atributoRecomendado}</p>
              </div>
              <div className="flex gap-1">
                {(["nenhum", "treinado", "mestre"] as NivelEspecialidade[]).map((n) => {
                  const bloqueado =
                    nivel !== n &&
                    ((n === "treinado" && limiteTreinadoAtingido) || (n === "mestre" && limiteMestreAtingido));
                  return (
                    <button
                      key={n}
                      onClick={() => definirNivel(e.nome, e.atributoRecomendado, n)}
                      disabled={bloqueado}
                      title={bloqueado ? "Limite desta categoria já atingido" : undefined}
                      className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-35 ${
                        nivel === n
                          ? "border-ouro bg-ouro text-tinta"
                          : "border-[var(--border-sutil)] text-foreground/60 hover:border-ouro/60"
                      }`}
                    >
                      {n === "nenhum" ? "—" : n === "treinado" ? "Treinado" : "Mestre"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[var(--border-sutil)] pt-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-bronze">Propor especialidade customizada</p>
        <div className="flex gap-2">
          <input
            value={nomeCustom}
            onChange={(e) => setNomeCustom(e.target.value)}
            placeholder="Nome da especialidade…"
            className="flex-1 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
          <Botao
            type="button"
            variante="fantasma"
            disabled={limiteTreinadoAtingido}
            onClick={() => {
              if (!nomeCustom.trim() || nomesSelecionados.has(nomeCustom.trim())) return;
              definirNivel(nomeCustom.trim(), "A definir", "treinado", true);
              setNomeCustom("");
            }}
          >
            Propor
          </Botao>
        </div>
        <p className="mt-1 text-[11px] text-foreground/50">
          Especialidades customizadas ficam marcadas como pendentes de aprovação do Oráculo da sua campanha.
        </p>
      </div>
    </div>
  );
}

// ---------- Passo 5: Essências ----------
function PassoEssencias({ ficha }: { ficha: FichaPersonagem }) {
  const { vidaMax, estaminaMax, aspis } = calcularEssencias(ficha);
  return (
    <div className="space-y-6">
      <BarraEssencia label="Vida" atual={vidaMax} maximo={vidaMax} tipo="vida" />
      <BarraEssencia label="Estamina" atual={estaminaMax} maximo={estaminaMax} tipo="estamina" />
      <div>
        <p className="mb-1 font-titulo text-[11px] uppercase tracking-[0.16em] text-bronze">Áspis</p>
        <p className="font-gravado text-2xl">{aspis}</p>
      </div>
      <div className="space-y-2 rounded-sm border border-[var(--border-sutil)] p-4 text-xs text-foreground/70">
        <p>Vida = 10 + Vigor × 2</p>
        <p>Estamina = 10 + Vigor + Destreza</p>
        <p>Áspis = 8 + Destreza + metade do Vigor (arredondado para cima)</p>
      </div>
    </div>
  );
}

// ---------- Passo 6: Estilos de Combate ----------
function PassoEstilos({
  ficha,
  atualizar,
}: {
  ficha: FichaPersonagem;
  atualizar: <K extends keyof FichaPersonagem>(c: K, v: FichaPersonagem[K]) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  function adicionar() {
    if (!nome.trim()) return;
    atualizar("estilosCombate", [...ficha.estilosCombate, { nome: nome.trim(), descricao }]);
    setNome("");
    setDescricao("");
  }

  function remover(i: number) {
    atualizar(
      "estilosCombate",
      ficha.estilosCombate.filter((_, idx) => idx !== i)
    );
  }

  return (
    <div className="space-y-4">
      {ficha.estilosCombate.map((e, i) => (
        <div key={i} className="flex items-start justify-between gap-3 rounded-sm border border-[var(--border-sutil)] p-3">
          <div>
            <p className="text-sm font-medium">{e.nome}</p>
            <p className="text-xs text-foreground/60">{e.descricao}</p>
          </div>
          <button onClick={() => remover(i)} className="text-xs text-terracota hover:underline">
            remover
          </button>
        </div>
      ))}

      <div className="rounded-sm border border-dashed border-[var(--border-sutil)] p-4">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder='Ex.: "Resistente"'
          className="mb-2 w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
        />
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder="Quando esse estilo se aplica ao seu ataque?"
          className="mb-2 w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
        />
        <Botao type="button" variante="fantasma" onClick={adicionar}>
          Adicionar estilo (+1d6 de dano quando aplicável)
        </Botao>
      </div>
    </div>
  );
}

// ---------- Passo 7: Poderes ----------
function PassoPoderes({
  ficha,
  atualizar,
}: {
  ficha: FichaPersonagem;
  atualizar: <K extends keyof FichaPersonagem>(c: K, v: FichaPersonagem[K]) => void;
}) {
  const casa = CASAS_DIVINAS.find((c) => c.nome === ficha.parenteDivino);
  const atributoFoco = casa?.foco as Atributo | undefined;
  const valorFoco = atributoFoco ? (ficha[atributoFoco] as number) : 0;

  const [nome, setNome] = useState("");
  const [custoEstamina, setCustoEstamina] = useState(3);
  const [duracao, setDuracao] = useState("Instantâneo");
  const [tipoAcao, setTipoAcao] = useState("Ação padrão");
  const [efeito, setEfeito] = useState("");

  function adicionar() {
    if (!nome.trim()) return;
    atualizar("poderes", [...ficha.poderes, { nome: nome.trim(), custoEstamina, duracao, tipoAcao, efeito }]);
    setNome("");
    setEfeito("");
  }

  function remover(i: number) {
    atualizar("poderes", ficha.poderes.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-5">
      {atributoFoco && (
        <div className="rounded-sm border border-purpura/40 bg-purpura/5 p-4 text-sm">
          <p className="text-foreground/80">
            Como filho(a) de <strong>{ficha.parenteDivino}</strong>, seu Foco é{" "}
            <strong className="text-bronze">
              {ATRIBUTOS.find((a) => a.chave === atributoFoco)?.nome}
            </strong>{" "}
            ({valorFoco}). Teste de Magia: role <span className="font-gravado">{valorFoco}d6</span> — cada par
            de faces iguais aumenta dano, alcance ou duração.
          </p>
        </div>
      )}

      {ficha.poderes.map((p, i) => (
        <div key={i} className="flex items-start justify-between gap-3 rounded-sm border border-[var(--border-sutil)] p-3">
          <div>
            <p className="text-sm font-medium">
              {p.nome} <span className="text-xs text-foreground/50">· {p.tipoAcao} · {p.duracao}</span>
            </p>
            <p className="text-xs text-foreground/60">{p.efeito}</p>
            <p className="mt-1 font-gravado text-[11px] text-egeu">{p.custoEstamina} de Estamina</p>
          </div>
          <button onClick={() => remover(i)} className="text-xs text-terracota hover:underline">
            remover
          </button>
        </div>
      ))}

      <div className="rounded-sm border border-dashed border-[var(--border-sutil)] p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do poder"
            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
          <input
            type="number"
            min={0}
            value={custoEstamina}
            onChange={(e) => setCustoEstamina(Number(e.target.value))}
            placeholder="Custo de Estamina"
            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
          <input
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            placeholder="Duração"
            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
          <input
            value={tipoAcao}
            onChange={(e) => setTipoAcao(e.target.value)}
            placeholder="Tipo de ação"
            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
        </div>
        <textarea
          value={efeito}
          onChange={(e) => setEfeito(e.target.value)}
          rows={2}
          placeholder="Efeito do poder…"
          className="mt-2 w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
        />
        <Botao type="button" variante="fantasma" onClick={adicionar} className="mt-2">
          Adicionar poder
        </Botao>
      </div>
    </div>
  );
}

// ---------- Passo 8: Itens ----------
function PassoItens({
  ficha,
  atualizar,
}: {
  ficha: FichaPersonagem;
  atualizar: <K extends keyof FichaPersonagem>(c: K, v: FichaPersonagem[K]) => void;
}) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"arma" | "consumivel" | "narrativo">("arma");
  const [dadoDeDano, setDadoDeDano] = useState("1d6");
  const [descricao, setDescricao] = useState("");

  function adicionar() {
    if (!nome.trim()) return;
    atualizar("itens", [
      ...ficha.itens,
      { nome: nome.trim(), tipo, dadoDeDano: tipo === "arma" ? dadoDeDano : undefined, descricao, equipado: false },
    ]);
    setNome("");
    setDescricao("");
  }

  function remover(i: number) {
    atualizar("itens", ficha.itens.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      {ficha.itens.map((it, i) => (
        <div key={i} className="flex items-start justify-between gap-3 rounded-sm border border-[var(--border-sutil)] p-3">
          <div>
            <p className="text-sm font-medium">
              {it.nome} <span className="text-xs uppercase text-foreground/50">· {it.tipo}</span>
            </p>
            {it.dadoDeDano && <p className="font-gravado text-xs text-terracota">{it.dadoDeDano}</p>}
            {it.descricao && <p className="text-xs text-foreground/60">{it.descricao}</p>}
          </div>
          <button onClick={() => remover(i)} className="text-xs text-terracota hover:underline">
            remover
          </button>
        </div>
      ))}

      <div className="rounded-sm border border-dashed border-[var(--border-sutil)] p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do item"
            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
          />
          <Seletor
            value={tipo}
            onChange={(v) => setTipo(v as typeof tipo)}
            opcoes={[
              { valor: "arma", rotulo: "Arma" },
              { valor: "consumivel", rotulo: "Consumível" },
              { valor: "narrativo", rotulo: "Narrativo" },
            ]}
          />
          {tipo === "arma" && (
            <input
              value={dadoDeDano}
              onChange={(e) => setDadoDeDano(e.target.value)}
              placeholder="Dado de dano (ex.: 1d8)"
              className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
            />
          )}
        </div>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder="Descrição…"
          className="mt-2 w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
        />
        <Botao type="button" variante="fantasma" onClick={adicionar} className="mt-2">
          Adicionar item
        </Botao>
      </div>
    </div>
  );
}

// Resumo rápido do build — pra o jogador sentir que fez escolhas coerentes antes de fechar a ficha.
function resumoDoBuild(ficha: FichaPersonagem): string {
  const topAtributos = [...ATRIBUTOS]
    .sort((a, b) => (ficha[b.chave] as number) - (ficha[a.chave] as number))
    .slice(0, 2)
    .map((a) => a.nome);

  const especialidadesOrdenadas = [...ficha.especialidades].sort((a, b) => {
    const peso = (n: string) => (n === "mestre" ? 2 : n === "treinado" ? 1 : 0);
    return peso(b.nivel) - peso(a.nivel);
  });
  const topEspecialidades = especialidadesOrdenadas.slice(0, 2).map((e) => e.nome);

  const partes = [...topAtributos, ...topEspecialidades];
  return partes.length > 0 ? partes.join(", ") : "um perfil ainda em aberto";
}

// ---------- Passo 9: Revisão ----------
function PassoRevisao({ ficha }: { ficha: FichaPersonagem }) {
  const { vidaMax, estaminaMax, aspis } = calcularEssencias(ficha);
  const atributoArmamento = atributoDoArmamento(ficha.armamento);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-gravado text-xs uppercase tracking-widest text-egeu">
          Filho(a) de {ficha.parenteDivino} · {ficha.armamento}
        </p>
        <h2 className="font-titulo text-2xl text-pergaminho">{ficha.nome || "Sem nome"}</h2>
        {ficha.historia && <p className="mt-2 text-sm text-foreground/70">{ficha.historia}</p>}
      </div>

      <ColunaFrame variante="pergaminho" className="p-4">
        <p className="text-sm italic leading-relaxed">
          Seu personagem é bom em <strong>{resumoDoBuild(ficha)}</strong> — combinação coerente para{" "}
          {ficha.armamento === "Lutador" ? "combate corpo a corpo" : ficha.armamento === "Espadachim" ? "combate ágil com lâminas" : "combate à distância"}.
        </p>
      </ColunaFrame>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ATRIBUTOS.map((a) => (
          <div key={a.chave} className="rounded-sm border border-[var(--border-sutil)] p-2 text-center">
            <SeloAtributo atributo={a.chave} icone={a.icone} size={52} className="mx-auto" />
            <p className="mt-1 text-[10px] uppercase text-foreground/60">{a.nome}</p>
            <p className="font-gravado text-sm">
              {ficha[a.chave]} (D{dadoDoAtributo(ficha[a.chave] as number)})
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <BarraEssencia label="Vida" atual={vidaMax} maximo={vidaMax} tipo="vida" />
        <BarraEssencia label="Estamina" atual={estaminaMax} maximo={estaminaMax} tipo="estamina" />
        <div>
          <p className="mb-1 font-titulo text-[11px] uppercase tracking-[0.16em] text-bronze">Áspis</p>
          <p className="font-gravado text-lg">{aspis}</p>
        </div>
      </div>

      <p className="font-gravado text-xs text-foreground/60">
        Ataque: 1d20 + 1d{dadoDoAtributo(ficha[atributoArmamento] as number)} vs Áspis do alvo
      </p>

      {ficha.especialidades.length > 0 && (
        <ListaResumo titulo="Especialidades" itens={ficha.especialidades.map((e) => `${e.nome} (${e.nivel})`)} />
      )}
      {ficha.estilosCombate.length > 0 && (
        <ListaResumo titulo="Estilos de Combate" itens={ficha.estilosCombate.map((e) => e.nome)} />
      )}
      {ficha.poderes.length > 0 && (
        <ListaResumo titulo="Poderes" itens={ficha.poderes.map((p) => p.nome)} />
      )}
      {ficha.itens.length > 0 && (
        <ListaResumo titulo="Itens" itens={ficha.itens.map((i) => i.nome)} />
      )}
    </div>
  );
}

function ListaResumo({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div>
      <h4 className="font-titulo text-xs uppercase tracking-[0.16em] text-bronze">{titulo}</h4>
      <ul className="mt-1 flex flex-wrap gap-2">
        {itens.map((i, idx) => (
          <li key={idx} className="rounded-full border border-[var(--border-sutil)] px-3 py-1 text-xs">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-bronze">{label}</label>
      {children}
    </div>
  );
}
