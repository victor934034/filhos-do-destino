"use client";

import { useState } from "react";
import Image from "next/image";
import type { ItemCompendio } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { Seletor } from "@/components/ui/Seletor";
import { ContadorDracmas } from "@/components/ui/ContadorDracmas";
import { dispararMensagem, fetchOuAvisar } from "@/lib/toastMensagens";

interface PersonagemResumo {
  id: string;
  nome: string;
  dracmas: number;
}

interface VinculoGerenciar {
  item: ItemCompendio;
  disponivelNoMercado: boolean;
  precoNestaCampanha: number | null;
}

export function PainelMercadoCampanha({
  campanhaId,
  ehOraculo,
  itensDaLoja,
  itensParaGerenciar,
  meusPersonagens,
}: {
  campanhaId: string;
  ehOraculo: boolean;
  itensDaLoja: ItemCompendio[];
  itensParaGerenciar: VinculoGerenciar[];
  meusPersonagens: PersonagemResumo[];
}) {
  const [aba, setAba] = useState<"loja" | "gerenciar">("loja");
  const [personagens, setPersonagens] = useState(meusPersonagens);
  const [personagemId, setPersonagemId] = useState(meusPersonagens[0]?.id ?? "");
  const [comprando, setComprando] = useState<string | null>(null);
  const [vinculos, setVinculos] = useState(itensParaGerenciar);

  const personagemAtual = personagens.find((p) => p.id === personagemId);

  async function comprar(item: ItemCompendio) {
    if (!personagemId) {
      dispararMensagem("erro", "Vincule um personagem seu a esta campanha antes de comprar.");
      return;
    }
    setComprando(item.id!);
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/mercado/comprar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personagemId, itemId: item.id }),
    });
    if (res) {
      const dados = await res.json();
      setPersonagens((lista) => lista.map((p) => (p.id === personagemId ? { ...p, dracmas: dados.saldo } : p)));
      dispararMensagem("sucesso", `${item.nome} comprado.`);
    }
    setComprando(null);
  }

  async function alternarDisponibilidade(v: VinculoGerenciar) {
    const res = await fetchOuAvisar(`/api/campanhas/${campanhaId}/mercado/${v.item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponivelNoMercado: !v.disponivelNoMercado, precoNestaCampanha: v.precoNestaCampanha }),
    });
    if (res) {
      setVinculos((lista) =>
        lista.map((x) => (x.item.id === v.item.id ? { ...x, disponivelNoMercado: !v.disponivelNoMercado } : x))
      );
    }
  }

  async function alterarPreco(v: VinculoGerenciar, precoTexto: string) {
    const preco = precoTexto.trim() === "" ? null : Number(precoTexto);
    setVinculos((lista) => lista.map((x) => (x.item.id === v.item.id ? { ...x, precoNestaCampanha: preco } : x)));
    await fetchOuAvisar(`/api/campanhas/${campanhaId}/mercado/${v.item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponivelNoMercado: v.disponivelNoMercado, precoNestaCampanha: preco }),
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Mochila de Hermes</p>
      <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">Mercado desta campanha</h1>
      <p className="mt-2 max-w-xl text-sm text-foreground/70">
        Só o Oráculo desta campanha escolhe o que fica à venda aqui — nunca um catálogo global do site.
      </p>

      {ehOraculo && (
        <div className="mt-6 flex gap-6 border-b border-[var(--border-sutil)]">
          <button
            onClick={() => setAba("loja")}
            className={`pb-3 font-titulo text-xs uppercase tracking-widest ${
              aba === "loja" ? "border-b-2 border-ouro text-ouro" : "text-foreground/50 hover:text-bronze"
            }`}
          >
            Loja
          </button>
          <button
            onClick={() => setAba("gerenciar")}
            className={`pb-3 font-titulo text-xs uppercase tracking-widest ${
              aba === "gerenciar" ? "border-b-2 border-ouro text-ouro" : "text-foreground/50 hover:text-bronze"
            }`}
          >
            Gerenciar (Oráculo)
          </button>
        </div>
      )}

      {aba === "loja" ? (
        <>
          {personagens.length === 0 ? (
            <ColunaFrame className="mt-8 p-6 text-sm text-foreground/60">
              Você não tem um personagem vinculado a esta campanha ainda.
            </ColunaFrame>
          ) : (
            <ColunaFrame className="mt-8 flex flex-wrap items-center gap-4 p-5">
              <span className="text-xs uppercase tracking-wide text-bronze">Comprar para:</span>
              <Seletor
                value={personagemId}
                onChange={setPersonagemId}
                className="w-56"
                opcoes={personagens.map((p) => ({ valor: p.id, rotulo: p.nome }))}
              />
              {personagemAtual && (
                <span className="flex items-center text-sm">
                  <ContadorDracmas valor={personagemAtual.dracmas} />
                </span>
              )}
            </ColunaFrame>
          )}

          {itensDaLoja.length === 0 ? (
            <ColunaFrame className="mt-6 p-14 text-center">
              <p className="font-titulo text-lg text-pergaminho">O Oráculo ainda não liberou itens à venda</p>
              {ehOraculo && (
                <p className="mt-2 text-sm text-foreground/60">
                  Vá na aba &ldquo;Gerenciar&rdquo; e ative os itens do seu Compêndio.
                </p>
              )}
            </ColunaFrame>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {itensDaLoja.map((item) => (
                <ColunaFrame key={item.id} className="overflow-hidden p-0">
                  <div className="relative h-32 w-full bg-noite-alta">
                    {item.ilustracaoUrl ? (
                      <Image src={item.ilustracaoUrl} alt={item.nome} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="h-7 w-7 rotate-45 border border-ouro/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="font-gravado text-[11px] uppercase tracking-widest text-foreground/50">
                      {item.tipo}
                    </span>
                    <h3 className="mt-1 font-titulo text-lg text-pergaminho">{item.nome}</h3>
                    {item.dadoDeDano && <p className="mt-1 font-gravado text-xs text-terracota">{item.dadoDeDano}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-gravado text-sm text-ouro">
                        <span className="relative h-6 w-6 shrink-0">
                          <Image src="/icons/selos/selo-dracma.png" alt="" fill className="object-contain" />
                        </span>
                        {item.preco}
                      </span>
                      <Botao
                        variante="fantasma"
                        onClick={() => comprar(item)}
                        disabled={comprando === item.id || !personagemId || (personagemAtual?.dracmas ?? 0) < item.preco}
                      >
                        {comprando === item.id ? "Comprando…" : "Comprar"}
                      </Botao>
                    </div>
                  </div>
                </ColunaFrame>
              ))}
            </div>
          )}
        </>
      ) : (
        <ColunaFrame className="mt-8" titulo="Itens do seu Compêndio">
          {vinculos.length === 0 ? (
            <p className="p-5 text-sm text-foreground/60">
              Você ainda não criou itens no Compêndio (Homebrew → Itens).
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-sutil)]">
              {vinculos.map((v) => (
                <li key={v.item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{v.item.nome}</p>
                    <p className="text-xs text-foreground/50">Preço base: {v.item.preco} Dracmas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      placeholder="Preço aqui (opcional)"
                      value={v.precoNestaCampanha ?? ""}
                      onChange={(e) => alterarPreco(v, e.target.value)}
                      className="w-40 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-2.5 py-1.5 text-xs outline-none focus:border-ouro"
                    />
                    <button
                      onClick={() => alternarDisponibilidade(v)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wide ${
                        v.disponivelNoMercado
                          ? "border-ouro text-ouro hover:bg-ouro-claro/15"
                          : "border-[var(--border-sutil)] text-foreground/60 hover:border-ouro"
                      }`}
                    >
                      {v.disponivelNoMercado ? "À venda aqui" : "Fora do Mercado"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ColunaFrame>
      )}
    </div>
  );
}
