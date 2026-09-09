"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATRIBUTOS,
  ESPECIALIDADES_BASICAS,
  atributoDoArmamento,
  dadoDoAtributo,
  rolarTeste,
  rolarDano,
  type Atributo,
  type NivelEspecialidade,
  type RolagemResultado,
} from "@/lib/regras";
import Image from "next/image";
import type { EspecialidadeSelecionada, FichaPersonagem, ItemPersonagem, PoderDef } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { SeloAtributo } from "@/components/ui/SeloAtributo";
import { BarraEssencia } from "@/components/ui/BarraEssencia";
import { Botao } from "@/components/ui/Botao";
import { RodaAtributos } from "@/components/ui/RodaAtributos";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { Seletor } from "@/components/ui/Seletor";
import { PainelDracmas } from "@/components/ficha/PainelDracmas";
import { AcaoBotao, LinhaAcoes } from "@/components/ui/AcaoBotao";
import { Modal } from "@/components/ui/Modal";
import { dispararRolagem } from "@/lib/toastRolagens";
import { dispararMensagem, fetchOuAvisar } from "@/lib/toastMensagens";

type AbaFicha = "combate" | "poderes" | "estilos" | "inventario" | "descricao";

/** Acha qual dos atributos do personagem corresponde ao texto livre "atributoRecomendado"
 * de uma especialidade (ex.: "Aparência / Carisma") — usa o maior valor entre os que baterem. */
function atributoDaEspecialidade(ficha: FichaPersonagem, atributoRecomendado: string): Atributo | null {
  const candidatos = atributoRecomendado
    .split("/")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const encontrados = ATRIBUTOS.filter((a) => candidatos.some((c) => c.includes(a.nome.toLowerCase())));
  if (encontrados.length === 0) return null;
  return encontrados.reduce((melhor, a) =>
    (ficha[a.chave] as number) > (ficha[melhor.chave] as number) ? a : melhor
  ).chave;
}

interface LogEntrada {
  id: number;
  texto: string;
  resultado: RolagemResultado;
}

export function FichaView({ ficha: fichaInicial }: { ficha: FichaPersonagem }) {
  const router = useRouter();
  const [ficha, setFicha] = useState(fichaInicial);
  const [log, setLog] = useState<LogEntrada[]>([]);
  const [excluindo, setExcluindo] = useState(false);
  const [personalizando, setPersonalizando] = useState(false);
  const [novoItem, setNovoItem] = useState<ItemPersonagem>({
    nome: "",
    tipo: "arma",
    dadoDeDano: "",
    multiplicadorCritico: 2,
    descricao: "",
  });
  const [mostrarFormItem, setMostrarFormItem] = useState(false);
  const [editandoItemIndex, setEditandoItemIndex] = useState<number | null>(null);
  const [ultimoAtaqueCritico, setUltimoAtaqueCritico] = useState(false);
  const [novoPoder, setNovoPoder] = useState<PoderDef>({
    nome: "",
    custoEstamina: 0,
    duracao: "Instantânea",
    tipoAcao: "Ação",
    efeito: "",
  });
  const [mostrarFormPoder, setMostrarFormPoder] = useState(false);
  const [editandoPoderIndex, setEditandoPoderIndex] = useState<number | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaFicha>("combate");

  async function salvarParcial(patch: Partial<FichaPersonagem>) {
    const nova = { ...ficha, ...patch };
    setFicha(nova);
    await fetch(`/api/personagens/${ficha.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nova),
    });
  }

  function rolar(atributo: Atributo, nomeExibicao: string) {
    const nivel = ficha.especialidades.find((e) => e.atributoRecomendado.toLowerCase().includes(nomeExibicao.toLowerCase()));
    const resultado = rolarTeste(ficha[atributo] as number, nivel?.nivel ?? "nenhum");
    setLog((l) => [
      { id: Date.now(), texto: `${ficha.nome} rola ${nomeExibicao}`, resultado },
      ...l,
    ].slice(0, 12));
    dispararRolagem(nomeExibicao, `Teste de ${nomeExibicao}`, resultado);
    return resultado;
  }

  function rolarEspecialidade(especialidade: EspecialidadeSelecionada, atributo: Atributo) {
    const resultado = rolarTeste(ficha[atributo] as number, especialidade.nivel);
    setLog((l) => [{ id: Date.now(), texto: `${ficha.nome} rola ${especialidade.nome}`, resultado }, ...l].slice(0, 12));
    dispararRolagem(especialidade.nome, `Teste de ${especialidade.nome}`, resultado);
  }

  function definirNivelEspecialidade(nome: string, atributoRecomendado: string, nivel: NivelEspecialidade) {
    const restantes = ficha.especialidades.filter((e) => e.nome !== nome);
    if (nivel === "nenhum") {
      salvarParcial({ especialidades: restantes });
      return;
    }
    salvarParcial({ especialidades: [...restantes, { nome, atributoRecomendado, nivel }] });
  }

  function ajustarEssencia(campo: "vidaAtual" | "estaminaAtual", delta: number) {
    const max = campo === "vidaAtual" ? ficha.vidaMax : ficha.estaminaMax;
    const novo = Math.max(0, Math.min(max, (ficha[campo] as number) + delta));
    salvarParcial({ [campo]: novo } as Partial<FichaPersonagem>);
  }

  function ajustarAtributo(atributo: Atributo, delta: number) {
    const novo = Math.max(1, Math.min(5, (ficha[atributo] as number) + delta));
    salvarParcial({ [atributo]: novo } as Partial<FichaPersonagem>);
  }

  function adicionarItem() {
    if (!novoItem.nome.trim()) return;
    if (editandoItemIndex !== null) {
      salvarParcial({ itens: ficha.itens.map((it, idx) => (idx === editandoItemIndex ? novoItem : it)) });
    } else {
      salvarParcial({ itens: [...ficha.itens, novoItem] });
    }
    setNovoItem({ nome: "", tipo: "arma", dadoDeDano: "", multiplicadorCritico: 2, descricao: "" });
    setEditandoItemIndex(null);
    setMostrarFormItem(false);
  }

  function editarItem(i: number) {
    setNovoItem(ficha.itens[i]);
    setEditandoItemIndex(i);
    setMostrarFormItem(true);
  }

  function removerItem(i: number) {
    salvarParcial({ itens: ficha.itens.filter((_, idx) => idx !== i) });
  }

  function equiparArma(i: number) {
    const alvo = ficha.itens[i];
    const jaEquipada = alvo.equipado;
    salvarParcial({
      itens: ficha.itens.map((it, idx) =>
        idx === i
          ? { ...it, equipado: !jaEquipada }
          : it.tipo === "arma"
            ? { ...it, equipado: false }
            : it
      ),
    });
  }

  async function venderItem(i: number) {
    const item = ficha.itens[i];
    const reembolsoPrevisto = item.precoCompra ? Math.round(item.precoCompra * 0.5) : 0;
    if (
      !confirm(
        reembolsoPrevisto > 0
          ? `Vender ${item.nome} de volta ao Mercado por ${reembolsoPrevisto} Dracmas?`
          : `Vender ${item.nome}? Este item não tem preço de referência — o reembolso será 0.`
      )
    ) {
      return;
    }
    const res = await fetchOuAvisar("/api/mercado/vender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personagemId: ficha.id, indice: i }),
    });
    if (res) {
      const dados = await res.json();
      setFicha((f) => ({ ...f, itens: f.itens.filter((_, idx) => idx !== i), dracmas: dados.saldo }));
      dispararMensagem("sucesso", `Vendido por ${dados.reembolso} Dracmas.`);
    }
  }

  function rolarDanoArma(critico: boolean) {
    const arma = ficha.itens.find((it) => it.tipo === "arma" && it.equipado && it.dadoDeDano);
    if (!arma?.dadoDeDano) return;
    const multiplicador = critico ? (arma.multiplicadorCritico ?? 2) : 1;
    const resultado = rolarDano(arma.dadoDeDano, multiplicador);
    if (!resultado) return;
    dispararMensagem(
      "sucesso",
      `${arma.nome} causa ${resultado.total} de dano${multiplicador > 1 ? " (crítico!)" : ""} — ${resultado.detalhe}`
    );
  }

  function atacar() {
    const resultado = rolar(atributoArmamento, `Ataque de ${ficha.armamento}`);
    setUltimoAtaqueCritico(resultado.critico);
    if (armaEquipada) {
      rolarDanoArma(resultado.critico);
    }
  }

  function adicionarPoder() {
    if (!novoPoder.nome.trim()) return;
    if (editandoPoderIndex !== null) {
      salvarParcial({ poderes: ficha.poderes.map((p, idx) => (idx === editandoPoderIndex ? novoPoder : p)) });
    } else {
      salvarParcial({ poderes: [...ficha.poderes, novoPoder] });
    }
    setNovoPoder({ nome: "", custoEstamina: 0, duracao: "Instantânea", tipoAcao: "Ação", efeito: "" });
    setEditandoPoderIndex(null);
    setMostrarFormPoder(false);
  }

  function editarPoder(i: number) {
    setNovoPoder(ficha.poderes[i]);
    setEditandoPoderIndex(i);
    setMostrarFormPoder(true);
  }

  function removerPoder(i: number) {
    salvarParcial({ poderes: ficha.poderes.filter((_, idx) => idx !== i) });
  }

  async function excluir() {
    if (!confirm(`Remover ${ficha.nome} permanentemente?`)) return;
    setExcluindo(true);
    await fetch(`/api/personagens/${ficha.id}`, { method: "DELETE" });
    router.push("/app/personagens");
    router.refresh();
  }

  const atributoArmamento = atributoDoArmamento(ficha.armamento);
  const armaEquipada = ficha.itens.find((it) => it.tipo === "arma" && it.equipado && it.dadoDeDano);

  // Todas as 17 especialidades da Seção 2.2 aparecem sempre — rolar sem treino usa o dado puro do atributo.
  const especialidadesCompletas = [
    ...ESPECIALIDADES_BASICAS,
    ...ficha.especialidades
      .filter((e) => e.customizada && !ESPECIALIDADES_BASICAS.some((b) => b.nome === e.nome))
      .map((e) => ({ nome: e.nome, atributoRecomendado: e.atributoRecomendado })),
  ].map((def) => ({
    ...def,
    nivel: ficha.especialidades.find((e) => e.nome === def.nome)?.nivel ?? ("nenhum" as NivelEspecialidade),
  }));
  const morrendo = ficha.vidaAtual <= 0;
  const desabado = ficha.estaminaAtual <= 0;

  return (
    <div className="mx-auto max-w-[100rem] px-5 py-10">
      <ColunaFrame className="p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-ouro/50 bg-noite">
              {ficha.ilustracaoUrl ? (
                <Image src={ficha.ilustracaoUrl} alt={ficha.nome} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-ouro/40">
                  <span className="h-6 w-6 rotate-45 border border-ouro/60" />
                </span>
              )}
            </span>
            <div>
              <p className="font-gravado text-xs uppercase tracking-widest text-egeu">
                Filho(a) de {ficha.parenteDivino} · {ficha.armamento}
                {!personalizando && ` · Nível ${ficha.nivel}`}
              </p>
              <h1 className="mt-1 font-titulo text-3xl text-pergaminho">{ficha.nome}</h1>
              {personalizando ? (
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 text-foreground/70">
                    Nível
                    <input
                      type="number"
                      min={1}
                      value={ficha.nivel}
                      onChange={(e) => salvarParcial({ nivel: Number(e.target.value) })}
                      className="w-16 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-2 py-1 text-xs outline-none focus:border-ouro"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-foreground/70">
                    Deslocamento
                    <input
                      type="number"
                      min={0}
                      value={ficha.deslocamento}
                      onChange={(e) => salvarParcial({ deslocamento: Number(e.target.value) })}
                      className="w-16 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-2 py-1 text-xs outline-none focus:border-ouro"
                    />
                    m
                  </label>
                </div>
              ) : (
                <p className="mt-1 text-xs text-foreground/60">Deslocamento: {ficha.deslocamento}m</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {morrendo && (
              <span className="rounded-full border border-terracota bg-terracota/10 px-3 py-1 text-xs uppercase tracking-wide text-terracota">
                Morrendo
              </span>
            )}
            {desabado && (
              <span className="rounded-full border border-egeu bg-egeu/10 px-3 py-1 text-xs uppercase tracking-wide text-egeu">
                Desabado
              </span>
            )}
            <button
              onClick={() => setPersonalizando((v) => !v)}
              className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wide ${
                personalizando ? "border-ouro bg-ouro-claro/15 text-ouro" : "border-[var(--border-sutil)] text-foreground/70 hover:border-ouro"
              }`}
            >
              {personalizando ? "Concluir edição" : "Personalização"}
            </button>
          </div>
        </div>

        {personalizando && (
          <div className="mt-4 max-w-sm">
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">Ilustração do personagem</label>
            <CampoImagem value={ficha.ilustracaoUrl ?? ""} onChange={(url) => salvarParcial({ ilustracaoUrl: url })} />
          </div>
        )}

      </ColunaFrame>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 md:grid-cols-[300px_360px_minmax(460px,1fr)]">
        {/* Coluna 1 — retrato (no cabeçalho acima) + atributos + recursos */}
        <aside className="space-y-6">
          <ColunaFrame titulo="Atributos — clique para rolar">
            <div className="flex flex-col items-center gap-5 p-5">
              <RodaAtributos ficha={ficha} onRolar={rolar} />
              {personalizando && (
                <div className="w-full space-y-2">
                  {ATRIBUTOS.map((a) => (
                    <div
                      key={a.chave}
                      className="flex w-full items-center gap-3 rounded-sm border border-[var(--border-sutil)] p-2.5"
                    >
                      <SeloAtributo atributo={a.chave} icone={a.icone} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.nome}</p>
                        <p className="font-gravado text-xs text-foreground/60">
                          {ficha[a.chave]} · D{dadoDoAtributo(ficha[a.chave] as number)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => ajustarAtributo(a.chave, -1)}
                          className="h-6 w-6 rounded-full border border-[var(--border-sutil)] text-xs hover:border-ouro"
                        >
                          −
                        </button>
                        <button
                          onClick={() => ajustarAtributo(a.chave, 1)}
                          className="h-6 w-6 rounded-full border border-[var(--border-sutil)] text-xs hover:border-ouro"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ColunaFrame>

          <ColunaFrame titulo="Recursos">
            <div className="space-y-4 p-5">
              <EssenciaControle
                label="Vida"
                atual={ficha.vidaAtual}
                maximo={ficha.vidaMax}
                tipo="vida"
                onAjustar={(d) => ajustarEssencia("vidaAtual", d)}
              />
              <EssenciaControle
                label="Estamina"
                atual={ficha.estaminaAtual}
                maximo={ficha.estaminaMax}
                tipo="estamina"
                onAjustar={(d) => ajustarEssencia("estaminaAtual", d)}
              />
              <div>
                <p className="mb-1 font-titulo text-[11px] uppercase tracking-[0.16em] text-bronze">Áspis</p>
                <p className="font-gravado text-2xl">{ficha.aspis}</p>
              </div>
              <PainelDracmas
                personagemId={ficha.id!}
                saldo={ficha.dracmas}
                onSaldoAlterado={(novoSaldo) => setFicha((f) => ({ ...f, dracmas: novoSaldo }))}
              />
            </div>
          </ColunaFrame>

          <Botao variante="terracota" onClick={excluir} disabled={excluindo} className="w-full">
            {excluindo ? "Removendo…" : "Remover personagem"}
          </Botao>
        </aside>

        {/* Coluna 2 — tabela de Especialidades, rolável dentro dela mesma */}
        <section>
          <ColunaFrame titulo="Especialidades — clique no nome pra rolar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-sutil)] text-left text-[10px] uppercase tracking-wide text-bronze">
                  <th className="p-3 font-normal">Especialidade</th>
                  <th className="p-3 font-normal">Dado</th>
                  <th className="p-3 font-normal">Nível</th>
                </tr>
              </thead>
              <tbody>
                {especialidadesCompletas.map((e) => {
                  const atributo = atributoDaEspecialidade(ficha, e.atributoRecomendado);
                  return (
                    <tr key={e.nome} className="border-b border-[var(--border-sutil)]/50">
                      <td
                        className="cursor-pointer p-3 transition hover:bg-ouro-claro/10"
                        onClick={() => atributo && rolarEspecialidade(e, atributo)}
                      >
                        <p className="font-medium">{e.nome}</p>
                        <p className="text-[11px] text-foreground/50">{e.atributoRecomendado}</p>
                      </td>
                      <td
                        className="cursor-pointer p-3 font-gravado text-xs text-ouro transition hover:bg-ouro-claro/10"
                        onClick={() => atributo && rolarEspecialidade(e, atributo)}
                      >
                        {atributo ? `D${dadoDoAtributo(ficha[atributo] as number)}` : "—"}
                      </td>
                      <td className="p-2">
                        <Seletor
                          value={e.nivel}
                          onChange={(v) =>
                            definirNivelEspecialidade(e.nome, e.atributoRecomendado, v as NivelEspecialidade)
                          }
                          className="w-28"
                          opcoes={[
                            { valor: "nenhum", rotulo: "—" },
                            { valor: "treinado", rotulo: "Treinado" },
                            { valor: "mestre", rotulo: "Mestre" },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ColunaFrame>
        </section>

        {/* Coluna 3 — abas: Combate | Poderes | Estilos de Combate | Inventário | Descrição */}
        <section>
          <div className="flex flex-wrap gap-1 border-b border-[var(--border-sutil)]">
            {(
              [
                ["combate", "Combate"],
                ["poderes", "Poderes"],
                ["estilos", "Estilos de Combate"],
                ["inventario", "Inventário"],
                ["descricao", "Descrição"],
              ] as const
            ).map(([chave, rotulo]) => (
              <button
                key={chave}
                onClick={() => setAbaAtiva(chave)}
                className={`px-3 py-2.5 font-titulo text-xs uppercase tracking-wide ${
                  abaAtiva === chave
                    ? "border-b-2 border-ouro text-ouro"
                    : "text-foreground/55 hover:text-bronze"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-6">
            {abaAtiva === "combate" && (
              <>
                <ColunaFrame titulo="Ataque">
                  <div className="space-y-3 p-5">
                    <button
                      onClick={atacar}
                      className="w-full rounded-sm border border-terracota/50 bg-terracota/10 p-4 text-left transition hover:border-terracota"
                    >
                      <p className="font-titulo text-sm uppercase tracking-wide text-terracota">
                        Atacar como {ficha.armamento}
                        {armaEquipada && " + Rolar Dano"}
                      </p>
                      <p className="mt-1 font-gravado text-xs text-foreground/60">
                        1d20 + 1d{dadoDoAtributo(ficha[atributoArmamento] as number)} vs Áspis do alvo
                        {armaEquipada && ` · dano: ${armaEquipada.dadoDeDano} (${armaEquipada.nome})`}
                      </p>
                    </button>

                    {armaEquipada ? (
                      <button
                        onClick={() => rolarDanoArma(ultimoAtaqueCritico)}
                        className={`w-full rounded-sm border p-3 text-left transition ${
                          ultimoAtaqueCritico
                            ? "border-ouro bg-ouro-claro/15 hover:border-ouro-claro"
                            : "border-[var(--border-sutil)] hover:border-ouro"
                        }`}
                      >
                        <p className="font-gravado text-xs uppercase tracking-wide text-bronze">
                          Rolar só o dano de novo
                          {ultimoAtaqueCritico && <span className="ml-2 text-ouro">· Crítico ativo</span>}
                        </p>
                      </button>
                    ) : (
                      <p className="text-xs text-foreground/50">
                        Equipe uma arma na aba Inventário para o dano ser rolado junto do ataque.
                      </p>
                    )}
                  </div>
                </ColunaFrame>

                <ColunaFrame titulo="Rolagens recentes">
                  <div className="max-h-[24rem] space-y-3 overflow-y-auto p-4">
                    {log.length === 0 && (
                      <p className="text-xs text-foreground/50">Clique num atributo ou especialidade para rolar.</p>
                    )}
                    {log.map((entrada) => (
                      <div key={entrada.id} className="rounded-sm border border-[var(--border-sutil)] p-3">
                        <p className="text-xs text-foreground/60">{entrada.texto}</p>
                        <p className="font-gravado text-sm">
                          {entrada.resultado.total}{" "}
                          {entrada.resultado.usouMito && <span className="text-ouro">· Regra do Mito!</span>}
                        </p>
                        <p className="text-[11px] text-foreground/50">{entrada.resultado.detalhe}</p>
                      </div>
                    ))}
                  </div>
                </ColunaFrame>
              </>
            )}

            {abaAtiva === "poderes" && (
              <ColunaFrame titulo="Poderes">
                <div className="p-5">
                  {ficha.poderes.length === 0 && <p className="text-sm text-foreground/50">Nenhum poder ainda.</p>}
                  {ficha.poderes.length > 0 && (
                    <div className="space-y-3">
                      {ficha.poderes.map((p, i) => (
                        <div key={i} className="rounded-lg border border-[var(--border-sutil)] bg-background/30 p-4">
                          <div className="flex items-start gap-3">
                            {p.ilustracaoUrl && (
                              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-[var(--border-sutil)]">
                                <Image src={p.ilustracaoUrl} alt={p.nome} fill className="object-cover" />
                              </span>
                            )}
                            <div>
                              <h4 className="font-medium text-pergaminho">{p.nome}</h4>
                              <span className="font-gravado text-xs text-egeu">
                                {p.custoEstamina} Est · {p.tipoAcao} · {p.duracao}
                              </span>
                            </div>
                          </div>
                          {p.efeito && <p className="mt-2 text-sm text-foreground/70">{p.efeito}</p>}

                          <LinhaAcoes>
                            <AcaoBotao variante="neutro" onClick={() => editarPoder(i)}>
                              Editar
                            </AcaoBotao>
                            <AcaoBotao variante="perigo" className="ml-auto" onClick={() => removerPoder(i)}>
                              Remover
                            </AcaoBotao>
                          </LinhaAcoes>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setMostrarFormPoder(true)}
                    className="mt-4 rounded-sm border border-dashed border-[var(--border-sutil)] px-4 py-2 text-xs uppercase tracking-wide text-bronze hover:border-ouro"
                  >
                    + Criar poder
                  </button>

                  {mostrarFormPoder && (
                    <Modal
                      titulo={editandoPoderIndex !== null ? "Editar poder" : "Criar poder"}
                      onFechar={() => {
                        setMostrarFormPoder(false);
                        setEditandoPoderIndex(null);
                        setNovoPoder({ nome: "", custoEstamina: 0, duracao: "Instantânea", tipoAcao: "Ação", efeito: "" });
                      }}
                    >
                      <div className="space-y-2">
                        <input
                          value={novoPoder.nome}
                          onChange={(e) => setNovoPoder((p) => ({ ...p, nome: e.target.value }))}
                          placeholder="Nome do poder"
                          className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Seletor
                            value={novoPoder.tipoAcao}
                            onChange={(v) => setNovoPoder((p) => ({ ...p, tipoAcao: v }))}
                            opcoes={[
                              { valor: "Ação", rotulo: "Ação" },
                              { valor: "Reação", rotulo: "Reação" },
                              { valor: "Livre", rotulo: "Livre" },
                            ]}
                          />
                          <input
                            type="number"
                            min={0}
                            value={novoPoder.custoEstamina}
                            onChange={(e) => setNovoPoder((p) => ({ ...p, custoEstamina: Number(e.target.value) }))}
                            placeholder="Custo Est."
                            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                          />
                          <input
                            value={novoPoder.duracao}
                            onChange={(e) => setNovoPoder((p) => ({ ...p, duracao: e.target.value }))}
                            placeholder="Duração"
                            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                          />
                        </div>
                        <textarea
                          value={novoPoder.efeito}
                          onChange={(e) => setNovoPoder((p) => ({ ...p, efeito: e.target.value }))}
                          rows={2}
                          placeholder="Efeito mecânico"
                          className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                        />
                        <div>
                          <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">
                            Imagem/ícone (opcional)
                          </label>
                          <CampoImagem
                            value={novoPoder.ilustracaoUrl ?? ""}
                            onChange={(url) => setNovoPoder((p) => ({ ...p, ilustracaoUrl: url }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Botao variante="fantasma" onClick={adicionarPoder}>
                            {editandoPoderIndex !== null ? "Salvar" : "Adicionar"}
                          </Botao>
                          <button
                            onClick={() => {
                              setMostrarFormPoder(false);
                              setEditandoPoderIndex(null);
                              setNovoPoder({ nome: "", custoEstamina: 0, duracao: "Instantânea", tipoAcao: "Ação", efeito: "" });
                            }}
                            className="text-xs text-foreground/60 hover:underline"
                          >
                            cancelar
                          </button>
                        </div>
                      </div>
                    </Modal>
                  )}
                </div>
              </ColunaFrame>
            )}

            {abaAtiva === "estilos" && (
              <ColunaFrame titulo="Estilos de Combate">
                {ficha.estilosCombate.length === 0 ? (
                  <p className="p-5 text-sm text-foreground/50">Nenhum estilo de combate ainda.</p>
                ) : (
                  <ul className="space-y-2 p-5">
                    {ficha.estilosCombate.map((e, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{e.nome}.</span>{" "}
                        <span className="text-foreground/70">{e.descricao}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ColunaFrame>
            )}

            {abaAtiva === "inventario" && (
              <ColunaFrame titulo="Inventário">
                <div className="p-5">
                  {ficha.itens.length === 0 && <p className="text-sm text-foreground/50">Nenhum item ainda.</p>}
                  {ficha.itens.length > 0 && (
                    <div className="space-y-3">
                      {ficha.itens.map((it, i) => (
                        <div key={i} className="rounded-lg border border-[var(--border-sutil)] bg-background/30 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              {it.ilustracaoUrl && (
                                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-[var(--border-sutil)]">
                                  <Image src={it.ilustracaoUrl} alt={it.nome} fill className="object-cover" />
                                </span>
                              )}
                              <div>
                                <h4 className="font-medium text-pergaminho">{it.nome}</h4>
                                <span className="text-xs uppercase tracking-wide text-foreground/50">{it.tipo}</span>
                                {it.dadoDeDano && (
                                  <span className="ml-2 font-gravado text-xs text-terracota">{it.dadoDeDano}</span>
                                )}
                              </div>
                            </div>
                            {it.equipado && (
                              <span className="shrink-0 rounded-full border border-ouro px-2 py-0.5 text-[10px] uppercase text-ouro">
                                Equipada
                              </span>
                            )}
                          </div>
                          {it.descricao && <p className="mt-2 text-sm text-foreground/70">{it.descricao}</p>}

                          <LinhaAcoes>
                            {it.tipo === "arma" && it.dadoDeDano && (
                              <AcaoBotao variante="destaque" onClick={() => equiparArma(i)}>
                                {it.equipado ? "Desequipar" : "Equipar"}
                              </AcaoBotao>
                            )}
                            <AcaoBotao variante="neutro" onClick={() => editarItem(i)}>
                              Editar
                            </AcaoBotao>
                            <AcaoBotao variante="info" onClick={() => venderItem(i)}>
                              Vender
                            </AcaoBotao>
                            <AcaoBotao variante="perigo" className="ml-auto" onClick={() => removerItem(i)}>
                              Remover
                            </AcaoBotao>
                          </LinhaAcoes>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setMostrarFormItem(true)}
                    className="mt-4 rounded-sm border border-dashed border-[var(--border-sutil)] px-4 py-2 text-xs uppercase tracking-wide text-bronze hover:border-ouro"
                  >
                    + Criar item
                  </button>

                  {mostrarFormItem && (
                    <Modal
                      titulo={editandoItemIndex !== null ? "Editar item" : "Criar item"}
                      onFechar={() => {
                        setMostrarFormItem(false);
                        setEditandoItemIndex(null);
                        setNovoItem({ nome: "", tipo: "arma", dadoDeDano: "", multiplicadorCritico: 2, descricao: "" });
                      }}
                    >
                      <div className="space-y-2">
                        <input
                          value={novoItem.nome}
                          onChange={(e) => setNovoItem((it) => ({ ...it, nome: e.target.value }))}
                          placeholder="Nome do item"
                          className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Seletor
                            value={novoItem.tipo}
                            onChange={(v) => setNovoItem((it) => ({ ...it, tipo: v as ItemPersonagem["tipo"] }))}
                            opcoes={[
                              { valor: "arma", rotulo: "Arma" },
                              { valor: "consumivel", rotulo: "Consumível" },
                              { valor: "narrativo", rotulo: "Narrativo" },
                            ]}
                          />
                          <input
                            value={novoItem.dadoDeDano ?? ""}
                            onChange={(e) => setNovoItem((it) => ({ ...it, dadoDeDano: e.target.value }))}
                            placeholder="Dado de dano (opcional)"
                            className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                          />
                        </div>
                        {novoItem.tipo === "arma" && (
                          <div>
                            <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">
                              Multiplicador de crítico
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={novoItem.multiplicadorCritico ?? 2}
                              onChange={(e) =>
                                setNovoItem((it) => ({ ...it, multiplicadorCritico: Number(e.target.value) }))
                              }
                              className="w-24 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                            />
                          </div>
                        )}
                        <input
                          value={novoItem.descricao ?? ""}
                          onChange={(e) => setNovoItem((it) => ({ ...it, descricao: e.target.value }))}
                          placeholder="Descrição (opcional)"
                          className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
                        />
                        <div>
                          <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">
                            Imagem/ícone (opcional)
                          </label>
                          <CampoImagem
                            value={novoItem.ilustracaoUrl ?? ""}
                            onChange={(url) => setNovoItem((it) => ({ ...it, ilustracaoUrl: url }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Botao variante="fantasma" onClick={adicionarItem}>
                            {editandoItemIndex !== null ? "Salvar" : "Adicionar"}
                          </Botao>
                          <button
                            onClick={() => {
                              setMostrarFormItem(false);
                              setEditandoItemIndex(null);
                              setNovoItem({ nome: "", tipo: "arma", dadoDeDano: "", multiplicadorCritico: 2, descricao: "" });
                            }}
                            className="text-xs text-foreground/60 hover:underline"
                          >
                            cancelar
                          </button>
                        </div>
                      </div>
                    </Modal>
                  )}
                </div>
              </ColunaFrame>
            )}

            {abaAtiva === "descricao" && (
              <ColunaFrame titulo="Descrição">
                <div className="p-5">
                  {personalizando ? (
                    <div className="mb-5">
                      <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">
                        Ilustração Completa (arte de corpo inteiro)
                      </label>
                      <p className="mb-2 text-xs text-foreground/50">
                        Diferente do retrato pequeno do cabeçalho — essa é a arte de destaque usada aqui na ficha e,
                        se a campanha usar, no Estúdio de Stream.
                      </p>
                      <CampoImagem
                        value={ficha.ilustracaoCompletaUrl ?? ""}
                        onChange={(url) => salvarParcial({ ilustracaoCompletaUrl: url })}
                        aspecto={3 / 4}
                      />
                    </div>
                  ) : (
                    ficha.ilustracaoCompletaUrl && (
                      <div className="relative mb-5 h-[28rem] w-full overflow-hidden rounded-sm border border-[var(--border-sutil)] bg-noite">
                        <Image
                          src={ficha.ilustracaoCompletaUrl}
                          alt={`Ilustração completa de ${ficha.nome}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )
                  )}

                  {personalizando ? (
                    <textarea
                      value={ficha.historia}
                      onChange={(e) => setFicha((f) => ({ ...f, historia: e.target.value }))}
                      onBlur={() => salvarParcial({ historia: ficha.historia })}
                      rows={10}
                      placeholder="Quem é este semideus? História, aparência, motivações…"
                      className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
                    />
                  ) : ficha.historia ? (
                    <p className="text-lg italic leading-relaxed text-foreground/80">{ficha.historia}</p>
                  ) : (
                    <p className="text-sm text-foreground/50">
                      Nenhuma história ainda — clique em &ldquo;Personalização&rdquo; para escrever.
                    </p>
                  )}
                </div>
              </ColunaFrame>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EssenciaControle({
  label,
  atual,
  maximo,
  tipo,
  onAjustar,
}: {
  label: string;
  atual: number;
  maximo: number;
  tipo: "vida" | "estamina";
  onAjustar: (delta: number) => void;
}) {
  return (
    <div>
      <BarraEssencia label={label} atual={atual} maximo={maximo} tipo={tipo} />
      <div className="mt-1.5 flex gap-1.5">
        <button
          onClick={() => onAjustar(-1)}
          className="h-6 w-6 rounded-full border border-[var(--border-sutil)] text-xs hover:border-ouro"
        >
          −
        </button>
        <button
          onClick={() => onAjustar(1)}
          className="h-6 w-6 rounded-full border border-[var(--border-sutil)] text-xs hover:border-ouro"
        >
          +
        </button>
      </div>
    </div>
  );
}
