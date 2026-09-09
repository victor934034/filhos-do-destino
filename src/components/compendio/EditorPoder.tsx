"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { poderCompendioPadrao, type PoderCompendio, type TipoAcaoPoder } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { Seletor } from "@/components/ui/Seletor";

const TIPOS_ACAO: TipoAcaoPoder[] = ["Ação", "Reação", "Livre"];

export function EditorPoder({
  inicial,
  poderId,
  souAdmin = false,
}: {
  inicial?: PoderCompendio;
  poderId?: string;
  souAdmin?: boolean;
}) {
  const router = useRouter();
  const [poder, setPoder] = useState<PoderCompendio>(inicial ?? poderCompendioPadrao());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function atualizar<K extends keyof PoderCompendio>(campo: K, valor: PoderCompendio[K]) {
    setPoder((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar() {
    if (!poder.nome.trim()) {
      setErro("O poder precisa de um nome.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const endpoint = poderId ? `/api/poderes/${poderId}` : "/api/poderes";
    const res = await fetch(endpoint, {
      method: poderId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(poder),
    });
    const json = await res.json();
    if (!res.ok) {
      setErro(json.erro ?? "Não foi possível salvar.");
      setSalvando(false);
      return;
    }
    router.push("/app/oraculo/poderes");
    router.refresh();
  }

  async function excluir() {
    if (!poderId || !confirm(`Remover ${poder.nome} do compêndio?`)) return;
    await fetch(`/api/poderes/${poderId}`, { method: "DELETE" });
    router.push("/app/oraculo/poderes");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-titulo text-2xl uppercase tracking-wide text-bronze">
        {poderId ? "Editar Poder" : "Novo Poder"}
      </h1>

      <ColunaFrame className="mt-8 space-y-4 p-6 md:p-8">
        <Campo label="Nome">
          <input
            value={poder.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
          />
        </Campo>

        <Campo label="Ilustração (opcional)">
          <CampoImagem value={poder.ilustracaoUrl ?? ""} onChange={(url) => atualizar("ilustracaoUrl", url)} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Tipo de ação">
            <Seletor
              value={poder.tipoAcao}
              onChange={(v) => atualizar("tipoAcao", v as TipoAcaoPoder)}
              opcoes={TIPOS_ACAO.map((t) => ({ valor: t, rotulo: t }))}
            />
          </Campo>
          <Campo label="Custo de Estamina">
            <input
              type="number"
              min={0}
              value={poder.custoEstamina}
              onChange={(e) => atualizar("custoEstamina", Number(e.target.value))}
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>
          <Campo label="Duração">
            <input
              value={poder.duracao}
              onChange={(e) => atualizar("duracao", e.target.value)}
              placeholder="Ex.: Instantânea, 1 cena…"
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>
        </div>

        <Campo label="Efeito mecânico">
          <textarea
            value={poder.efeito}
            onChange={(e) => atualizar("efeito", e.target.value)}
            rows={4}
            className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
          />
        </Campo>

        <div className="space-y-2 border-t border-[var(--border-sutil)] pt-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={poder.publico}
              onChange={(e) => atualizar("publico", e.target.checked)}
              className="accent-ouro"
            />
            Compartilhar com a comunidade
          </label>
          {souAdmin && (
            <label className="flex items-center gap-2 text-sm text-ouro">
              <input
                type="checkbox"
                checked={poder.oficial}
                onChange={(e) => atualizar("oficial", e.target.checked)}
                className="accent-ouro"
              />
              Marcar como Oficial (curadoria de admin)
            </label>
          )}
        </div>

        {erro && (
          <p className="rounded-sm border border-terracota/50 bg-terracota/10 px-3 py-2 text-xs text-terracota">
            {erro}
          </p>
        )}

        <div className="flex justify-between border-t border-[var(--border-sutil)] pt-6">
          {poderId ? (
            <Botao variante="terracota" onClick={excluir}>
              Remover
            </Botao>
          ) : (
            <span />
          )}
          <Botao onClick={salvar} disabled={salvando}>
            {salvando ? "Gravando…" : "Salvar poder"}
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
