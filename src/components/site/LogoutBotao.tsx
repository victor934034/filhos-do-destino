"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutBotao() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      disabled={saindo}
      className="rounded-sm border border-ouro/40 px-3 py-1.5 text-xs uppercase tracking-wider text-ouro-claro hover:border-ouro disabled:opacity-50"
    >
      {saindo ? "Saindo…" : "Sair"}
    </button>
  );
}
