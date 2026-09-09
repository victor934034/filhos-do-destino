"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { CenaDeStream, EventoSessao, SlotCamera } from "@/lib/tipos";
import { FUNDOS, FundoStream } from "@/components/stream/FundosStream";
import { MolduraPersonagem } from "@/components/site/MolduraPersonagem";
import { Busto } from "@/components/site/Busto";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { BarraEssencia } from "@/components/ui/BarraEssencia";
import { Seletor } from "@/components/ui/Seletor";
import { dispararErro } from "@/lib/toastMensagens";

interface JogadorOpcao {
  usuarioId: string;
  nome: string;
  personagemNome: string | null;
  personagemIlustracaoUrl: string | null;
  vidaAtual: number | null;
  vidaMax: number | null;
  estaminaAtual: number | null;
  estaminaMax: number | null;
}

const CONTAGEM_SLOTS: Record<CenaDeStream["layout"], number> = {
  "grid-2x2": 4,
  "grid-3x2": 6,
  "destaque-1-3": 4,
};

function slotVazio(): SlotCamera {
  return { jogadorId: null, nome: "", personagemId: null, mostrarIlustracao: true };
}

export function EstudioStream({
  campanhaId,
  usuarioId,
  ehOraculo,
  jogadores,
  cenaInicial,
}: {
  campanhaId: string;
  usuarioId: string;
  ehOraculo: boolean;
  jogadores: JogadorOpcao[];
  cenaInicial: CenaDeStream;
}) {
  const [cena, setCena] = useState(cenaInicial);
  const [salvando, setSalvando] = useState(false);
  const [camerasAtivas, setCamerasAtivas] = useState<Record<number, boolean>>({});
  const [ultimoEvento, setUltimoEvento] = useState<EventoSessao | null>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const streams = useRef<Record<number, MediaStream>>({});

  const numSlots = CONTAGEM_SLOTS[cena.layout];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- normalizes slot count when the layout choice changes
    setCena((c) => {
      const atual = c.camerasConfig.slice(0, numSlots);
      while (atual.length < numSlots) atual.push(slotVazio());
      return { ...c, camerasConfig: atual };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cena.layout]);

  useEffect(
    () => () => {
      Object.values(streams.current).forEach((s) => s.getTracks().forEach((t) => t.stop()));
    },
    []
  );

  useEffect(() => {
    if (!cena.overlayAtivo) return;
    let cancelado = false;
    async function buscarUltimoEvento() {
      const res = await fetch(`/api/campanhas/${campanhaId}/mesa`);
      if (!res.ok || cancelado) return;
      const sessao = await res.json();
      const eventos: EventoSessao[] = sessao.eventos ?? [];
      const relevante = [...eventos].reverse().find((e) => e.tipo !== "chat");
      if (relevante) setUltimoEvento(relevante);
    }
    buscarUltimoEvento();
    const t = setInterval(buscarUltimoEvento, 4000);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, [campanhaId, cena.overlayAtivo]);

  function atualizarSlot(i: number, patch: Partial<SlotCamera>) {
    setCena((c) => {
      const lista = c.camerasConfig.slice();
      lista[i] = { ...lista[i], ...patch };
      return { ...c, camerasConfig: lista };
    });
  }

  function escolherJogador(i: number, jogadorId: string) {
    const j = jogadores.find((x) => x.usuarioId === jogadorId);
    atualizarSlot(i, { jogadorId: jogadorId || null, nome: j?.nome ?? "" });
  }

  async function ativarCamera(i: number) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streams.current[i] = stream;
      const video = videoRefs.current[i];
      if (video) video.srcObject = stream;
      setCamerasAtivas((s) => ({ ...s, [i]: true }));
    } catch {
      dispararErro("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  }

  function desativarCamera(i: number) {
    streams.current[i]?.getTracks().forEach((t) => t.stop());
    delete streams.current[i];
    setCamerasAtivas((s) => ({ ...s, [i]: false }));
  }

  async function salvar() {
    setSalvando(true);
    const res = await fetch(`/api/campanhas/${campanhaId}/cena`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cena),
    });
    if (res.ok) setCena(await res.json());
    setSalvando(false);
  }

  const usandoFundoCustom = cena.fundoId === "custom" && cena.fundoCustomUrl;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-gravado text-xs uppercase tracking-widest text-egeu">Estúdio de Transmissão</p>
          <h1 className="font-titulo text-2xl text-pergaminho">Compositor de Cena</h1>
        </div>
        {ehOraculo && (
          <Botao onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar preset da cena"}
          </Botao>
        )}
      </div>

      {ehOraculo && (
        <ColunaFrame className="mt-6 space-y-4 p-5">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">Layout</label>
              <Seletor
                value={cena.layout}
                onChange={(v) => setCena((c) => ({ ...c, layout: v as CenaDeStream["layout"] }))}
                className="w-44"
                opcoes={[
                  { valor: "grid-2x2", rotulo: "Grade 2×2" },
                  { valor: "grid-3x2", rotulo: "Grade 3×2" },
                  { valor: "destaque-1-3", rotulo: "Destaque + 3" },
                ]}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">Cenário</label>
              <Seletor
                value={cena.fundoId}
                onChange={(v) => setCena((c) => ({ ...c, fundoId: v }))}
                className="w-52"
                opcoes={[
                  ...FUNDOS.map((f) => ({ valor: f.id, rotulo: f.nome })),
                  { valor: "custom", rotulo: "Imagem personalizada…" },
                ]}
              />
            </div>
            <label className="flex items-center gap-2 pb-2.5 text-sm">
              <input
                type="checkbox"
                checked={cena.overlayAtivo}
                onChange={(e) => setCena((c) => ({ ...c, overlayAtivo: e.target.checked }))}
              />
              Overlay de narração/rolagem
            </label>
          </div>

          {cena.fundoId === "custom" && (
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">
                Imagem de fundo personalizada
              </label>
              <CampoImagem
                value={cena.fundoCustomUrl ?? ""}
                onChange={(url) => setCena((c) => ({ ...c, fundoCustomUrl: url }))}
                aspecto={16 / 9}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-bronze">
              Título da cena (aparece na transmissão)
            </label>
            <input
              value={cena.tituloCena}
              onChange={(e) => setCena((c) => ({ ...c, tituloCena: e.target.value }))}
              placeholder="Ex.: Capítulo 3 — A Fúria de Poseidon"
              className="w-full max-w-md rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2 text-sm outline-none focus:border-ouro"
            />
          </div>
        </ColunaFrame>
      )}

      <div className="relative mt-6 overflow-hidden rounded-sm border border-[var(--border-sutil)]">
        {usandoFundoCustom ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cena.fundoCustomUrl!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <FundoStream fundoId={cena.fundoId} className="absolute inset-0 h-full w-full" />
        )}
        <div className="absolute inset-0 bg-black/10" />

        {cena.tituloCena && (
          <div className="absolute left-6 top-6 z-10 rounded-full border border-ouro/60 bg-noite/85 px-4 py-1.5">
            <p className="font-titulo text-xs uppercase tracking-[0.14em] text-ouro">{cena.tituloCena}</p>
          </div>
        )}

        <div
          className={`relative grid gap-6 p-8 ${
            cena.layout === "grid-2x2"
              ? "grid-cols-2"
              : cena.layout === "grid-3x2"
                ? "grid-cols-3"
                : "grid-cols-3 [&>*:first-child]:col-span-3"
          }`}
          style={{ minHeight: 420 }}
        >
          {cena.camerasConfig.map((slot, i) => {
            const jogador = jogadores.find((j) => j.usuarioId === slot.jogadorId);
            const souEste = slot.jogadorId === usuarioId;
            const ativa = camerasAtivas[i];
            const mostrarIlustracao = slot.mostrarIlustracao && !ativa && jogador?.personagemIlustracaoUrl;
            return (
              <div key={i} className="flex flex-col items-center">
                {ehOraculo && (
                  <div className="mb-2 flex w-full max-w-[200px] flex-col gap-1">
                    <Seletor
                      value={slot.jogadorId ?? ""}
                      onChange={(v) => escolherJogador(i, v)}
                      className="w-full"
                      opcoes={[
                        { valor: "", rotulo: "— slot vazio —" },
                        ...jogadores.map((j) => ({ valor: j.usuarioId, rotulo: j.nome })),
                      ]}
                    />
                    {jogador?.personagemIlustracaoUrl && (
                      <label className="flex items-center gap-1.5 text-[10px] text-foreground/70">
                        <input
                          type="checkbox"
                          checked={slot.mostrarIlustracao}
                          onChange={(e) => atualizarSlot(i, { mostrarIlustracao: e.target.checked })}
                        />
                        Mostrar ilustração do personagem
                      </label>
                    )}
                  </div>
                )}

                <MolduraPersonagem
                  nome={jogador?.nome ?? "—"}
                  classe={jogador?.personagemNome ?? undefined}
                  tamanho={i === 0 && cena.layout === "destaque-1-3" ? 220 : 130}
                >
                  {ativa ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : mostrarIlustracao ? (
                    <Image
                      src={jogador!.personagemIlustracaoUrl!}
                      alt={jogador!.nome}
                      fill
                      className="object-cover"
                    />
                  ) : jogador ? (
                    <Busto corFundoA="#e8c874" corFundoB="#8a6a2f" estilo="curto" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#e9e0c8] text-xs text-bronze/50">
                      vazio
                    </div>
                  )}
                </MolduraPersonagem>

                {cena.overlayAtivo && jogador && jogador.vidaMax != null && (
                  <div className="mt-1.5 w-full max-w-[130px] space-y-0.5">
                    <BarraEssencia label="" atual={jogador.vidaAtual ?? 0} maximo={jogador.vidaMax} tipo="vida" />
                    {jogador.estaminaMax != null && (
                      <BarraEssencia
                        label=""
                        atual={jogador.estaminaAtual ?? 0}
                        maximo={jogador.estaminaMax}
                        tipo="estamina"
                      />
                    )}
                  </div>
                )}

                {souEste && (
                  <button
                    onClick={() => (ativa ? desativarCamera(i) : ativarCamera(i))}
                    className="mt-2 rounded-full border border-ouro/50 px-3 py-1 text-[10px] uppercase tracking-wide text-bronze hover:bg-ouro-claro/20"
                  >
                    {ativa ? "Desligar minha câmera" : "Ativar minha câmera"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {cena.overlayAtivo && ultimoEvento && (
          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-ouro/40 bg-noite/90 px-6 py-2.5">
            <p
              className={`text-sm ${
                ultimoEvento.tipo === "narracao" ? "italic text-pergaminho" : "font-gravado text-ouro-claro"
              }`}
            >
              {ultimoEvento.tipo === "rolagem" && <span className="mr-1.5 text-ouro">🎲</span>}
              {ultimoEvento.conteudo}
            </p>
          </div>
        )}
      </div>

      <ColunaFrame className="mt-6 p-4 text-xs text-foreground/60">
        Para usar esta cena no OBS/Streamlabs, adicione esta página como uma <strong>Fonte de Navegador</strong>{" "}
        (Browser Source) apontando para esta URL. Cada jogador deve abrir esta mesma página no seu próprio
        navegador e ativar a própria câmera no slot que lhe foi atribuído.
      </ColunaFrame>
    </div>
  );
}
