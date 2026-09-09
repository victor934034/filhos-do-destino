"use client";

import { useRef, useState } from "react";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { AcaoBotao } from "@/components/ui/AcaoBotao";
import type { Amizade, UsuarioResumo } from "@/lib/tipos";
import { dispararMensagem, fetchOuAvisar } from "@/lib/toastMensagens";

export function PainelAmigos({ inicial }: { inicial: Amizade[] }) {
  const [amizades, setAmizades] = useState(inicial);
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<UsuarioResumo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce feito no manipulador de evento (não em useEffect) — dispensa o
  // "loading true síncrono no efeito" que o lint de efeitos reprova.
  function aoDigitar(valor: string) {
    setBusca(valor);
    if (debounce.current) clearTimeout(debounce.current);

    const termo = valor.trim();
    if (termo.length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    debounce.current = setTimeout(async () => {
      const res = await fetch(`/api/usuarios/buscar?q=${encodeURIComponent(termo)}`);
      if (res.ok) setResultados(await res.json());
      setBuscando(false);
    }, 300);
  }

  async function recarregar() {
    const res = await fetch("/api/amigos");
    if (res.ok) setAmizades(await res.json());
  }

  async function enviarPedido(destinatarioId: string) {
    const res = await fetchOuAvisar("/api/amigos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinatarioId }),
    });
    if (res) {
      dispararMensagem("sucesso", "Pedido de amizade enviado.");
      await recarregar();
    }
  }

  async function responder(id: string, status: "aceita" | "recusada") {
    const res = await fetchOuAvisar(`/api/amigos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res) await recarregar();
  }

  async function remover(id: string) {
    const res = await fetchOuAvisar(`/api/amigos/${id}`, { method: "DELETE" });
    if (res) await recarregar();
  }

  const amigos = amizades.filter((a) => a.status === "aceita");
  const recebidos = amizades.filter((a) => a.status === "pendente" && a.eu === "destinatario");
  const enviados = amizades.filter((a) => a.status === "pendente" && a.eu === "solicitante");
  const idsConhecidos = new Set(amizades.map((a) => a.outro.id));

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-titulo text-2xl uppercase tracking-wide text-bronze">Amigos</h1>
      <p className="mt-1 text-sm text-foreground/70">
        Encontre outros semideuses e Oráculos pra jogar junto. Pedidos de amizade precisam ser aceitos.
      </p>

      <ColunaFrame className="mt-8 p-6" titulo="Buscar por nome ou e-mail">
        <div className="p-5 pt-2">
          <input
            value={busca}
            onChange={(e) => aoDigitar(e.target.value)}
            placeholder="Digite ao menos 2 letras…"
            className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
          />
          {buscando && <p className="mt-2 text-xs text-foreground/50">Buscando…</p>}
          {resultados.length > 0 && (
            <ul className="mt-3 space-y-2">
              {resultados.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 rounded-sm border border-[var(--border-sutil)] p-3">
                  <div>
                    <p className="text-sm font-medium">{u.nome}</p>
                    <p className="text-xs text-foreground/55">{u.email}</p>
                  </div>
                  {idsConhecidos.has(u.id) ? (
                    <span className="text-xs uppercase tracking-wide text-foreground/40">Já conectado</span>
                  ) : (
                    <button
                      onClick={() => enviarPedido(u.id)}
                      className="rounded-full border border-ouro px-3.5 py-1.5 text-xs uppercase tracking-wide text-ouro hover:bg-ouro-claro/15"
                    >
                      Adicionar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ColunaFrame>

      {recebidos.length > 0 && (
        <ColunaFrame className="mt-6" titulo="Pedidos recebidos">
          <ul className="space-y-2 p-5">
            {recebidos.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <p className="text-sm">{a.outro.nome}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => responder(a.id, "aceita")}
                    className="rounded-full border border-ouro px-3 py-1 text-xs uppercase text-ouro hover:bg-ouro-claro/15"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => responder(a.id, "recusada")}
                    className="rounded-full border border-terracota/50 px-3 py-1 text-xs uppercase text-terracota hover:bg-terracota/10"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </ColunaFrame>
      )}

      {enviados.length > 0 && (
        <ColunaFrame className="mt-6" titulo="Pedidos enviados">
          <ul className="space-y-2 p-5">
            {enviados.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{a.outro.nome} <span className="text-foreground/50">· aguardando</span></span>
                <AcaoBotao variante="perigo" onClick={() => remover(a.id)}>
                  Cancelar
                </AcaoBotao>
              </li>
            ))}
          </ul>
        </ColunaFrame>
      )}

      <ColunaFrame className="mt-6" titulo={`Amigos (${amigos.length})`}>
        {amigos.length === 0 ? (
          <p className="p-5 text-sm text-foreground/60">Você ainda não tem amigos por aqui.</p>
        ) : (
          <ul className="space-y-2 p-5">
            {amigos.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{a.outro.nome}</span>
                <AcaoBotao variante="perigo" onClick={() => remover(a.id)}>
                  Desfazer
                </AcaoBotao>
              </li>
            ))}
          </ul>
        )}
      </ColunaFrame>

      <div className="mt-6">
        <Botao variante="fantasma" onClick={recarregar}>
          Atualizar
        </Botao>
      </div>
    </div>
  );
}
