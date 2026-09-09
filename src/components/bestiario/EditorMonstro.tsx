"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ATRIBUTOS, dadoDoAtributo, type Atributo } from "@/lib/regras";
import { monstroPadrao, type FichaMonstro, type HabilidadeAtiva, type HabilidadePassiva } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { SeloAtributo } from "@/components/ui/SeloAtributo";
import { Botao } from "@/components/ui/Botao";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { Seletor } from "@/components/ui/Seletor";

const ALCANCES: { valor: HabilidadeAtiva["alcance"]; label: string }[] = [
  { valor: "corpoACorpo", label: "Corpo a corpo" },
  { valor: "linhaReta", label: "Linha reta" },
  { valor: "area", label: "Área" },
];

export function EditorMonstro({
  inicial,
  monstroId,
  souAdmin = false,
}: {
  inicial?: FichaMonstro;
  monstroId?: string;
  souAdmin?: boolean;
}) {
  const router = useRouter();
  const [m, setM] = useState<FichaMonstro>(inicial ?? monstroPadrao());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function atualizar<K extends keyof FichaMonstro>(campo: K, valor: FichaMonstro[K]) {
    setM((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar() {
    if (!m.nome.trim()) {
      setErro("O monstro precisa de um nome.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const endpoint = monstroId ? `/api/monstros/${monstroId}` : "/api/monstros";
    const res = await fetch(endpoint, {
      method: monstroId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(m),
    });
    const json = await res.json();
    if (!res.ok) {
      setErro(json.erro ?? "Não foi possível salvar.");
      setSalvando(false);
      return;
    }
    router.push("/app/oraculo/monstros");
    router.refresh();
  }

  async function excluir() {
    if (!monstroId || !confirm(`Remover ${m.nome} do bestiário?`)) return;
    await fetch(`/api/monstros/${monstroId}`, { method: "DELETE" });
    router.push("/app/oraculo/monstros");
    router.refresh();
  }

  function adicionarAtiva() {
    atualizar("habilidadesAtivas", [...m.habilidadesAtivas, { nome: "", alcance: "corpoACorpo", dadoDeDano: "1d6" }]);
  }
  function atualizarAtiva(i: number, patch: Partial<HabilidadeAtiva>) {
    const lista = m.habilidadesAtivas.slice();
    lista[i] = { ...lista[i], ...patch };
    atualizar("habilidadesAtivas", lista);
  }
  function removerAtiva(i: number) {
    atualizar("habilidadesAtivas", m.habilidadesAtivas.filter((_, idx) => idx !== i));
  }

  function adicionarPassiva() {
    atualizar("habilidadesPassivas", [...m.habilidadesPassivas, { nome: "", efeito: "" }]);
  }
  function atualizarPassiva(i: number, patch: Partial<HabilidadePassiva>) {
    const lista = m.habilidadesPassivas.slice();
    lista[i] = { ...lista[i], ...patch };
    atualizar("habilidadesPassivas", lista);
  }
  function removerPassiva(i: number) {
    atualizar("habilidadesPassivas", m.habilidadesPassivas.filter((_, idx) => idx !== i));
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-titulo text-2xl uppercase tracking-wide text-bronze">
        {monstroId ? "Editar Monstro" : "Novo Monstro"}
      </h1>

      <ColunaFrame className="mt-8 space-y-6 p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nome">
            <input
              value={m.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>
          <Campo label="Ilustração (opcional)">
            <CampoImagem
              value={m.ilustracaoUrl ?? ""}
              onChange={(url) => atualizar("ilustracaoUrl", url)}
            />
          </Campo>
          <Campo label="Vida">
            <input
              type="number"
              value={m.vida}
              onChange={(e) => atualizar("vida", Number(e.target.value))}
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>
          <Campo label="Áspis">
            <input
              type="number"
              value={m.aspis}
              onChange={(e) => atualizar("aspis", Number(e.target.value))}
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-bronze">Atributos</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ATRIBUTOS.map((a) => (
              <div key={a.chave} className="flex items-center gap-2 rounded-sm border border-[var(--border-sutil)] p-2">
                <SeloAtributo atributo={a.chave} icone={a.icone} size={48} />
                <div className="flex-1">
                  <p className="text-xs">{a.nome}</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={m[a.chave] as number}
                      onChange={(e) => atualizar(a.chave, Number(e.target.value) as FichaMonstro[typeof a.chave])}
                      className="w-12 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-1.5 py-1 text-xs outline-none focus:border-ouro"
                    />
                    <span className="font-gravado text-[11px] text-foreground/50">
                      D{dadoDoAtributo(m[a.chave] as number)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Campo label="Atributo de ataque">
          <Seletor
            value={m.atributoAtaque}
            onChange={(v) => atualizar("atributoAtaque", v as Atributo)}
            className="sm:w-64"
            opcoes={ATRIBUTOS.map((a) => ({ valor: a.chave, rotulo: a.nome }))}
          />
        </Campo>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-bronze">Habilidades Ativas</p>
          <div className="space-y-2">
            {m.habilidadesAtivas.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                <input
                  value={h.nome}
                  onChange={(e) => atualizarAtiva(i, { nome: e.target.value })}
                  placeholder="Nome"
                  className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-2 py-1.5 text-sm outline-none focus:border-ouro"
                />
                <Seletor
                  value={h.alcance}
                  onChange={(v) => atualizarAtiva(i, { alcance: v as HabilidadeAtiva["alcance"] })}
                  opcoes={ALCANCES.map((a) => ({ valor: a.valor, rotulo: a.label }))}
                />
                <input
                  value={h.dadoDeDano}
                  onChange={(e) => atualizarAtiva(i, { dadoDeDano: e.target.value })}
                  placeholder="Dado"
                  className="w-20 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-2 py-1.5 text-sm outline-none focus:border-ouro"
                />
                <button onClick={() => removerAtiva(i)} className="text-xs text-terracota hover:underline">
                  remover
                </button>
              </div>
            ))}
          </div>
          <Botao type="button" variante="fantasma" onClick={adicionarAtiva} className="mt-2">
            Adicionar habilidade ativa
          </Botao>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-bronze">Habilidades Passivas</p>
          <div className="space-y-2">
            {m.habilidadesPassivas.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2">
                <input
                  value={h.nome}
                  onChange={(e) => atualizarPassiva(i, { nome: e.target.value })}
                  placeholder="Nome"
                  className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-2 py-1.5 text-sm outline-none focus:border-ouro"
                />
                <input
                  value={h.efeito}
                  onChange={(e) => atualizarPassiva(i, { efeito: e.target.value })}
                  placeholder="Efeito"
                  className="rounded-sm border border-[var(--border-sutil)] bg-background/60 px-2 py-1.5 text-sm outline-none focus:border-ouro"
                />
                <button onClick={() => removerPassiva(i)} className="text-xs text-terracota hover:underline">
                  remover
                </button>
              </div>
            ))}
          </div>
          <Botao type="button" variante="fantasma" onClick={adicionarPassiva} className="mt-2">
            Adicionar habilidade passiva
          </Botao>
        </div>

        <div className="space-y-2 border-t border-[var(--border-sutil)] pt-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={m.publico}
              onChange={(e) => atualizar("publico", e.target.checked)}
              className="accent-ouro"
            />
            Compartilhar com a comunidade (outros Oráculos passam a ver este monstro)
          </label>
          {souAdmin && (
            <label className="flex items-center gap-2 text-sm text-ouro">
              <input
                type="checkbox"
                checked={m.oficial}
                onChange={(e) => atualizar("oficial", e.target.checked)}
                className="accent-ouro"
              />
              Marcar como Oficial (curadoria de admin — aparece com destaque pra todo mundo)
            </label>
          )}
        </div>

        {erro && (
          <p className="rounded-sm border border-terracota/50 bg-terracota/10 px-3 py-2 text-xs text-terracota">
            {erro}
          </p>
        )}

        <div className="flex justify-between border-t border-[var(--border-sutil)] pt-6">
          {monstroId ? (
            <Botao variante="terracota" onClick={excluir}>
              Remover do bestiário
            </Botao>
          ) : (
            <span />
          )}
          <Botao onClick={salvar} disabled={salvando}>
            {salvando ? "Gravando…" : "Salvar monstro"}
          </Botao>
        </div>
      </ColunaFrame>
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
