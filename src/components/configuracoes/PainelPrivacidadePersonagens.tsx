"use client";

import { useState } from "react";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { fetchOuAvisar } from "@/lib/toastMensagens";

interface PersonagemPrivacidade {
  id: string;
  nome: string;
  bloqueadoParaJogadores: boolean;
  permiteControleMestre: boolean;
}

export function PainelPrivacidadePersonagens({ inicial }: { inicial: PersonagemPrivacidade[] }) {
  const [personagens, setPersonagens] = useState(inicial);

  async function alternar(id: string, campo: "bloqueadoParaJogadores" | "permiteControleMestre") {
    const alvo = personagens.find((p) => p.id === id);
    if (!alvo) return;
    const novoValor = !alvo[campo];
    setPersonagens((lista) => lista.map((p) => (p.id === id ? { ...p, [campo]: novoValor } : p)));
    await fetchOuAvisar(`/api/personagens/${id}/privacidade`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: novoValor }),
    });
  }

  return (
    <ColunaFrame className="mt-6" titulo="Privacidade e confiança dos seus personagens">
      {personagens.length === 0 ? (
        <p className="p-5 text-sm text-foreground/60">Você ainda não tem personagens.</p>
      ) : (
        <ul className="divide-y divide-[var(--border-sutil)]">
          {personagens.map((p) => (
            <li key={p.id} className="space-y-2 p-4">
              <p className="text-sm font-medium">{p.nome}</p>
              <label className="flex items-center gap-3 text-xs text-foreground/70">
                <input
                  type="checkbox"
                  checked={p.bloqueadoParaJogadores}
                  onChange={() => alternar(p.id, "bloqueadoParaJogadores")}
                />
                Bloquear esta ficha para outros jogadores da campanha (só nome/ilustração). O
                Oráculo sempre vê tudo.
              </label>
              <label className="flex items-center gap-3 text-xs text-foreground/70">
                <input
                  type="checkbox"
                  checked={p.permiteControleMestre}
                  onChange={() => alternar(p.id, "permiteControleMestre")}
                />
                Permitir que o Oráculo ajuste minha Vida/Estamina na mesa.
              </label>
            </li>
          ))}
        </ul>
      )}
    </ColunaFrame>
  );
}
