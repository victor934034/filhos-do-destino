"use client";

import { useState } from "react";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { dispararMensagem, fetchOuAvisar } from "@/lib/toastMensagens";

interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  admin: boolean;
  criadoEm: string;
}

export function PainelAdmin({ inicial, meuId }: { inicial: UsuarioAdmin[]; meuId: string }) {
  const [usuarios, setUsuarios] = useState(inicial);
  const [alterando, setAlterando] = useState<string | null>(null);

  async function alternarAdmin(usuario: UsuarioAdmin) {
    setAlterando(usuario.id);
    const res = await fetchOuAvisar(`/api/admin/usuarios/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin: !usuario.admin }),
    });
    if (res) {
      const atualizado: UsuarioAdmin = await res.json();
      setUsuarios((lista) => lista.map((u) => (u.id === atualizado.id ? atualizado : u)));
      dispararMensagem(
        "sucesso",
        atualizado.admin ? `${atualizado.nome} agora é admin.` : `${atualizado.nome} não é mais admin.`
      );
    }
    setAlterando(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Curadoria</p>
      <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">Administração</h1>
      <p className="mt-2 max-w-lg text-sm text-foreground/70">
        Admins podem marcar monstros, itens, poderes e campanhas como &ldquo;Oficiais&rdquo; — a curadoria
        oficial do sistema, distinta do conteúdo da comunidade.
      </p>

      <ColunaFrame className="mt-8" titulo={`Usuários (${usuarios.length})`}>
        <ul className="divide-y divide-[var(--border-sutil)]">
          {usuarios.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">
                  {u.nome} {u.id === meuId && <span className="text-xs text-foreground/50">(você)</span>}
                </p>
                <p className="text-xs text-foreground/55">{u.email}</p>
              </div>
              {u.id === meuId ? (
                <span className="text-xs uppercase tracking-wide text-ouro">Admin</span>
              ) : (
                <button
                  onClick={() => alternarAdmin(u)}
                  disabled={alterando === u.id}
                  className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wide disabled:opacity-50 ${
                    u.admin
                      ? "border-terracota text-terracota hover:bg-terracota/10"
                      : "border-ouro text-ouro hover:bg-ouro-claro/15"
                  }`}
                >
                  {alterando === u.id ? "Salvando…" : u.admin ? "Remover admin" : "Tornar admin"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </ColunaFrame>
    </div>
  );
}
