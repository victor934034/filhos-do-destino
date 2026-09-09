"use client";

import { ATRIBUTOS, dadoDoAtributo, type Atributo } from "@/lib/regras";
import type { FichaPersonagem } from "@/lib/tipos";
import { SeloAtributo } from "@/components/ui/SeloAtributo";

/**
 * Roda circular de atributos: os 6 atributos dispostos ao redor de um selo
 * central "ATRIBUTOS", cada um clicável para rolar. Réplica do padrão do
 * C.R.I.S. adaptado às 6 stats e à paleta de Filhos do Destino.
 */
export function RodaAtributos({
  ficha,
  tamanho = 264,
  onRolar,
}: {
  ficha: Pick<FichaPersonagem, Atributo>;
  tamanho?: number;
  onRolar?: (atributo: Atributo, nome: string) => void;
}) {
  const raio = tamanho * 0.365;
  const centro = tamanho / 2;
  const seloTamanho = tamanho * 0.27;

  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho }}>
      <div
        className="absolute rounded-full border border-ouro font-titulo text-[11px] uppercase tracking-[0.16em] text-ouro"
        style={{
          left: centro - tamanho * 0.245,
          top: centro - tamanho * 0.245,
          width: tamanho * 0.49,
          height: tamanho * 0.49,
        }}
      >
        <span className="flex h-full w-full items-center justify-center text-center leading-tight">
          Atri-
          <br />
          butos
        </span>
      </div>

      {ATRIBUTOS.map((a, i) => {
        const angulo = ((-90 + i * 60) * Math.PI) / 180;
        const x = centro + raio * Math.cos(angulo);
        const y = centro + raio * Math.sin(angulo);
        const valor = ficha[a.chave];
        return (
          <button
            key={a.chave}
            type="button"
            onClick={() => onRolar?.(a.chave, a.nome)}
            className="absolute flex items-center justify-center rounded-full text-center transition hover:brightness-125 hover:drop-shadow-[0_0_10px_rgba(224,151,58,0.55)]"
            style={{ left: x - seloTamanho / 2, top: y - seloTamanho / 2, width: seloTamanho, height: seloTamanho }}
          >
            <SeloAtributo atributo={a.chave} icone={a.icone} size={seloTamanho} />
            <span className="pointer-events-none absolute bottom-[14%] flex flex-col items-center leading-none">
              <span className="font-titulo text-lg font-bold text-pergaminho drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                {valor}
              </span>
              <span className="font-gravado text-[8px] tracking-[0.1em] text-ouro drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                D{dadoDoAtributo(valor)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
