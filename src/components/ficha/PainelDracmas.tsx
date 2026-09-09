"use client";

import { useState } from "react";
import type { Transacao } from "@/lib/tipos";
import { ContadorDracmas } from "@/components/ui/ContadorDracmas";
import { Botao } from "@/components/ui/Botao";
import { fetchOuAvisar } from "@/lib/toastMensagens";

const RETULOS_TIPO: Record<string, string> = {
  recompensa: "Recompensa",
  venda: "Venda",
  compra: "Compra",
  ajusteManual: "Ajuste",
};

export function PainelDracmas({
  personagemId,
  saldo,
  onSaldoAlterado,
}: {
  personagemId: string;
  saldo: number;
  onSaldoAlterado: (novoSaldo: number) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [transacoes, setTransacoes] = useState<Transacao[] | null>(null);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");

  async function abrirHistorico() {
    setAberto((v) => !v);
    if (transacoes === null) {
      const res = await fetchOuAvisar(`/api/personagens/${personagemId}/dracmas`);
      if (res) {
        const dados = await res.json();
        setTransacoes(dados.transacoes);
      }
    }
  }

  async function lancar(delta: number) {
    if (delta === 0) return;
    setCarregando(true);
    const res = await fetchOuAvisar(`/api/personagens/${personagemId}/dracmas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: delta, motivo: motivo || undefined }),
    });
    if (res) {
      const dados = await res.json();
      onSaldoAlterado(dados.saldo);
      setTransacoes((t) => (t ? [dados.transacao, ...t] : [dados.transacao]));
      setValor("");
      setMotivo("");
    }
    setCarregando(false);
  }

  return (
    <div>
      <button onClick={abrirHistorico} className="flex items-center gap-2 text-left">
        <span>
          <span className="block font-titulo text-[11px] uppercase tracking-[0.16em] text-bronze">Dracmas</span>
          <ContadorDracmas valor={saldo} className="text-2xl" tamanhoIcone={36} />
        </span>
      </button>

      {aberto && (
        <div className="mt-3 w-72 rounded-sm border border-[var(--border-sutil)] bg-background/60 p-3">
          <div className="flex gap-1.5">
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="+10 / -5"
              className="w-24 rounded-sm border border-[var(--border-sutil)] bg-background px-2 py-1.5 text-xs outline-none focus:border-ouro"
            />
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo (opcional)"
              className="flex-1 rounded-sm border border-[var(--border-sutil)] bg-background px-2 py-1.5 text-xs outline-none focus:border-ouro"
            />
            <Botao
              variante="fantasma"
              onClick={() => lancar(Number(valor))}
              disabled={carregando || !valor || Number(valor) === 0}
            >
              OK
            </Botao>
          </div>

          <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto border-t border-[var(--border-sutil)] pt-2">
            {transacoes === null && <p className="text-xs text-foreground/50">Carregando…</p>}
            {transacoes?.length === 0 && <p className="text-xs text-foreground/50">Nenhuma transação ainda.</p>}
            {transacoes?.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-foreground/70">
                  {RETULOS_TIPO[t.tipo] ?? t.tipo}
                  {t.motivo && <span className="text-foreground/50"> · {t.motivo}</span>}
                </span>
                <span className={t.valor >= 0 ? "text-egeu" : "text-terracota"}>
                  {t.valor >= 0 ? "+" : ""}
                  {t.valor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
