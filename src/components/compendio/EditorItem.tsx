"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { itemCompendioPadrao, type ItemCompendio, type TipoItemCompendio } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { Seletor } from "@/components/ui/Seletor";

const TIPOS: { valor: TipoItemCompendio; label: string }[] = [
  { valor: "arma", label: "Arma" },
  { valor: "consumivel", label: "Consumível" },
  { valor: "narrativo", label: "Narrativo" },
  { valor: "legado", label: "Legado Mitológico" },
];

export function EditorItem({
  inicial,
  itemId,
  souAdmin = false,
}: {
  inicial?: ItemCompendio;
  itemId?: string;
  souAdmin?: boolean;
}) {
  const router = useRouter();
  const [item, setItem] = useState<ItemCompendio>(inicial ?? itemCompendioPadrao());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function atualizar<K extends keyof ItemCompendio>(campo: K, valor: ItemCompendio[K]) {
    setItem((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar() {
    if (!item.nome.trim()) {
      setErro("O item precisa de um nome.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const endpoint = itemId ? `/api/itens/${itemId}` : "/api/itens";
    const res = await fetch(endpoint, {
      method: itemId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const json = await res.json();
    if (!res.ok) {
      setErro(json.erro ?? "Não foi possível salvar.");
      setSalvando(false);
      return;
    }
    router.push("/app/oraculo/itens");
    router.refresh();
  }

  async function excluir() {
    if (!itemId || !confirm(`Remover ${item.nome} do compêndio?`)) return;
    await fetch(`/api/itens/${itemId}`, { method: "DELETE" });
    router.push("/app/oraculo/itens");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-titulo text-2xl uppercase tracking-wide text-bronze">
        {itemId ? "Editar Item" : "Novo Item"}
      </h1>

      <ColunaFrame className="mt-8 space-y-4 p-6 md:p-8">
        <Campo label="Nome">
          <input
            value={item.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
          />
        </Campo>

        <Campo label="Ilustração (opcional)">
          <CampoImagem value={item.ilustracaoUrl ?? ""} onChange={(url) => atualizar("ilustracaoUrl", url)} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Tipo">
            <Seletor
              value={item.tipo}
              onChange={(v) => atualizar("tipo", v as TipoItemCompendio)}
              opcoes={TIPOS.map((t) => ({ valor: t.valor, rotulo: t.label }))}
            />
          </Campo>
          {item.tipo === "arma" && (
            <>
              <Campo label="Dado de dano">
                <input
                  value={item.dadoDeDano ?? ""}
                  onChange={(e) => atualizar("dadoDeDano", e.target.value)}
                  placeholder="Ex.: 1d8"
                  className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
                />
              </Campo>
              <Campo label="Multiplicador de crítico">
                <input
                  type="number"
                  min={1}
                  value={item.multiplicadorCritico}
                  onChange={(e) => atualizar("multiplicadorCritico", Number(e.target.value))}
                  className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
                />
              </Campo>
            </>
          )}
        </div>

        <Campo label="Efeito mecânico">
          <textarea
            value={item.efeito}
            onChange={(e) => atualizar("efeito", e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
          />
        </Campo>

        <Campo label="Preço no Mercado (em Dracmas — 0 = não vendido lá)">
          <input
            type="number"
            min={0}
            value={item.preco}
            onChange={(e) => atualizar("preco", Number(e.target.value))}
            className="w-full max-w-[200px] rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
          />
        </Campo>

        {item.tipo === "legado" && (
          <Campo label="Texto de lore (Legado Mitológico)">
            <textarea
              value={item.textoLore}
              onChange={(e) => atualizar("textoLore", e.target.value)}
              rows={4}
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>
        )}

        <div className="space-y-2 border-t border-[var(--border-sutil)] pt-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.publico}
              onChange={(e) => atualizar("publico", e.target.checked)}
              className="accent-ouro"
            />
            Compartilhar com a comunidade
          </label>
          {souAdmin && (
            <label className="flex items-center gap-2 text-sm text-ouro">
              <input
                type="checkbox"
                checked={item.oficial}
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
          {itemId ? (
            <Botao variante="terracota" onClick={excluir}>
              Remover
            </Botao>
          ) : (
            <span />
          )}
          <Botao onClick={salvar} disabled={salvando}>
            {salvando ? "Gravando…" : "Salvar item"}
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
