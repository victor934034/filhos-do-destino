"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Botao } from "@/components/ui/Botao";
import { ColunaFrame } from "@/components/ui/ColunaFrame";

export function FormAutenticacao({
  titulo,
  subtitulo,
  endpoint,
  campos,
  textoBotao,
  rodape,
}: {
  titulo: string;
  subtitulo: string;
  endpoint: string;
  campos: { nome: string; label: string; tipo: string; autoComplete?: string }[];
  textoBotao: string;
  rodape: ReactNode;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const dados = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Algo deu errado. Tente novamente.");
        setEnviando(false);
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <ColunaFrame className="px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-titulo text-2xl uppercase tracking-[0.1em] text-bronze">{titulo}</h1>
          <p className="mt-2 text-sm text-foreground/70">{subtitulo}</p>
        </div>

        <form onSubmit={aoEnviar} className="space-y-4">
          {campos.map((c) => (
            <div key={c.nome}>
              <label htmlFor={c.nome} className="mb-1 block text-xs uppercase tracking-wider text-bronze">
                {c.label}
              </label>
              <input
                id={c.nome}
                name={c.nome}
                type={c.tipo}
                autoComplete={c.autoComplete}
                required
                className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-ouro"
              />
            </div>
          ))}

          {erro && (
            <p className="rounded-sm border border-terracota/50 bg-terracota/10 px-3 py-2 text-xs text-terracota">
              {erro}
            </p>
          )}

          <Botao type="submit" disabled={enviando} className="mt-2 w-full">
            {enviando ? "Um instante…" : textoBotao}
          </Botao>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/70">{rodape}</div>
      </ColunaFrame>
    </div>
  );
}
