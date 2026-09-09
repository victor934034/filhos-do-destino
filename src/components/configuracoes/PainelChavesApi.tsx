"use client";

import { useState } from "react";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";

interface ChaveResumo {
  id: string;
  nome: string;
  prefixo: string;
  criadoEm: string;
  ultimoUsoEm: string | null;
}

export function PainelChavesApi({ inicial }: { inicial: ChaveResumo[] }) {
  const [chaves, setChaves] = useState(inicial);
  const [nome, setNome] = useState("");
  const [criando, setCriando] = useState(false);
  const [chaveGerada, setChaveGerada] = useState<string | null>(null);

  async function criar() {
    setCriando(true);
    const res = await fetch("/api/chaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim() || "Chave sem nome" }),
    });
    if (res.ok) {
      const json = await res.json();
      setChaveGerada(json.chave);
      setChaves((c) => [{ id: json.id, nome: json.nome, prefixo: json.prefixo, criadoEm: json.criadoEm, ultimoUsoEm: null }, ...c]);
      setNome("");
    }
    setCriando(false);
  }

  async function revogar(id: string) {
    if (!confirm("Revogar esta chave? Qualquer integração que a use vai parar de funcionar.")) return;
    await fetch(`/api/chaves/${id}`, { method: "DELETE" });
    setChaves((c) => c.filter((x) => x.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-titulo text-2xl uppercase tracking-wide text-bronze">Chaves de API</h1>
      <p className="mt-1 text-sm text-foreground/70">
        Use uma chave de API para conectar ferramentas externas — por exemplo, um servidor MCP que cria
        campanhas, monstros ou itens em seu nome pela <span className="font-gravado text-xs">API pública</span> em{" "}
        <code className="rounded-sm bg-black/20 px-1.5 py-0.5">/api/mcp</code>.
      </p>

      {chaveGerada && (
        <ColunaFrame variante="pergaminho" className="mt-6 p-5">
          <p className="text-sm font-medium">Copie sua chave agora — ela não será exibida de novo:</p>
          <p className="mt-2 break-all rounded-sm bg-tinta/10 p-3 font-gravado text-sm">{chaveGerada}</p>
          <button
            onClick={() => setChaveGerada(null)}
            className="mt-3 text-xs uppercase tracking-wide text-bronze hover:underline"
          >
            Já copiei, fechar
          </button>
        </ColunaFrame>
      )}

      <ColunaFrame className="mt-6 p-5">
        <div className="flex flex-wrap gap-3">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da chave (ex.: MCP do Claude)"
            className="flex-1 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
          />
          <Botao onClick={criar} disabled={criando}>
            {criando ? "Gerando…" : "Gerar nova chave"}
          </Botao>
        </div>
      </ColunaFrame>

      <ColunaFrame className="mt-6" titulo={`Suas chaves (${chaves.length})`}>
        {chaves.length === 0 ? (
          <p className="p-5 text-sm text-foreground/60">Nenhuma chave criada ainda.</p>
        ) : (
          <ul className="space-y-2 p-5">
            {chaves.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-sm border border-[var(--border-sutil)] p-3 text-sm">
                <div>
                  <p className="font-medium">{c.nome}</p>
                  <p className="font-gravado text-xs text-foreground/50">
                    {c.prefixo}… · criada em {new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                    {c.ultimoUsoEm && ` · usada em ${new Date(c.ultimoUsoEm).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <button onClick={() => revogar(c.id)} className="text-xs text-terracota hover:underline">
                  revogar
                </button>
              </li>
            ))}
          </ul>
        )}
      </ColunaFrame>
    </div>
  );
}
