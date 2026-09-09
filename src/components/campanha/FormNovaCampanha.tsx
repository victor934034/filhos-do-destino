"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { CampoImagem } from "@/components/ui/CampoImagem";
import { Seletor } from "@/components/ui/Seletor";
import { regrasDaCasaPadrao } from "@/lib/tipos";

export function FormNovaCampanha() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [capaUrl, setCapaUrl] = useState("");
  const [visibilidade, setVisibilidade] = useState("privada");
  const padrao = regrasDaCasaPadrao();
  const [limiteTreinado, setLimiteTreinado] = useState(padrao.limiteEspecialidadesTreinado);
  const [limiteMestre, setLimiteMestre] = useState(padrao.limiteEspecialidadesMestre);

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const dados = {
      ...Object.fromEntries(new FormData(e.currentTarget)),
      capaUrl,
      visibilidade,
      regrasDaCasa: {
        limiteEspecialidadesTreinado: limiteTreinado,
        limiteEspecialidadesMestre: limiteMestre,
      },
    };
    try {
      const res = await fetch("/api/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Não foi possível criar a campanha.");
        setEnviando(false);
        return;
      }
      router.push(`/app/campanhas/${json.id}`);
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-titulo text-2xl uppercase tracking-wide text-bronze">
        Abrir uma câmara de Oráculo
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Toda campanha começa com uma sinopse e algumas regras da casa. Você pode ajustar tudo depois.
      </p>

      <ColunaFrame className="mt-8 p-6 md:p-8">
        <form onSubmit={aoEnviar} className="space-y-4">
          <Campo label="Nome da campanha">
            <input
              name="nome"
              required
              placeholder="Ex.: Sombras sobre Lua Nova"
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>

          <Campo label="Sinopse">
            <textarea
              name="sinopse"
              rows={4}
              placeholder="Do que trata sua história?"
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>

          <Campo label="Capa da campanha (opcional)">
            <CampoImagem value={capaUrl} onChange={setCapaUrl} aspecto={16 / 9} />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Visibilidade">
              <Seletor
                value={visibilidade}
                onChange={setVisibilidade}
                opcoes={[
                  { valor: "privada", rotulo: "Privada (por convite)" },
                  { valor: "publica", rotulo: "Pública (aberta ao Quadro de Missões)" },
                ]}
              />
            </Campo>
            <Campo label="Vagas para jogadores">
              <input
                name="vagasMaximas"
                type="number"
                min={1}
                max={12}
                defaultValue={5}
                className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
              />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Limite de Especialidades — Treinado">
              <input
                type="number"
                min={0}
                max={12}
                value={limiteTreinado}
                onChange={(e) => setLimiteTreinado(Number(e.target.value))}
                className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
              />
            </Campo>
            <Campo label="Limite de Especialidades — Mestre">
              <input
                type="number"
                min={0}
                max={12}
                value={limiteMestre}
                onChange={(e) => setLimiteMestre(Number(e.target.value))}
                className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
              />
            </Campo>
          </div>
          <p className="-mt-2 text-[11px] text-foreground/50">
            O livro não define um limite oficial — 4 Treinado + 2 Mestre é o padrão observado nas
            fichas prontas. Ajuste como preferir para a sua mesa.
          </p>

          <Campo label="Tom da campanha (tags separadas por vírgula)">
            <input
              name="tom"
              placeholder="Ex.: combate pesado, intriga política"
              className="w-full rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
            />
          </Campo>

          {erro && (
            <p className="rounded-sm border border-terracota/50 bg-terracota/10 px-3 py-2 text-xs text-terracota">
              {erro}
            </p>
          )}

          <Botao type="submit" disabled={enviando} className="w-full">
            {enviando ? "Erguendo a câmara…" : "Criar campanha"}
          </Botao>
        </form>
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
