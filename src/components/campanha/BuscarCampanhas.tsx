"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Campanha } from "@/lib/tipos";
import { ColunaFrame } from "@/components/ui/ColunaFrame";
import { Botao } from "@/components/ui/Botao";
import { Divisor } from "@/components/ui/Divisor";

export function BuscarCampanhas({ usuarioId }: { usuarioId: string }) {
  const [campanhas, setCampanhas] = useState<Campanha[] | null>(null);
  const [entrando, setEntrando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/campanhas/publicas")
      .then((r) => r.json())
      .then(setCampanhas);
  }, []);

  async function entrar(id: string) {
    setEntrando(id);
    const res = await fetch(`/api/campanhas/${id}/entrar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const json = await res.json();
    setAviso((a) => ({ ...a, [id]: res.ok ? "Solicitação enviada!" : json.erro }));
    setEntrando(null);
  }

  if (!campanhas) {
    return <p className="px-5 py-12 text-center text-sm text-foreground/60">Consultando o Quadro de Missões…</p>;
  }

  if (campanhas.length === 0) {
    return (
      <p className="px-5 py-12 text-center text-sm text-foreground/60">
        Nenhuma campanha pública aberta no momento. Volte em breve.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="font-gravado text-xs uppercase tracking-[0.2em] text-bronze">Encontre sua mesa</p>
      <h1 className="mt-1 font-titulo text-3xl uppercase tracking-wide text-pergaminho">Quadro de Missões</h1>
      <Divisor className="mt-3" />
      <p className="mt-3 max-w-xl text-sm text-foreground/70">
        Campanhas públicas abertas a novos jogadores. Campanhas privadas não aparecem aqui — só quem
        recebe convite direto do Oráculo entra nelas.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campanhas.map((c) => {
          const aprovados = c.jogadores.filter((j) => j.status === "aprovado").length;
          const jaSolicitou = c.jogadores.some((j) => j.usuarioId === usuarioId);
          const vagas = c.vagasMaximas - aprovados;
          return (
            <ColunaFrame key={c.id} className="overflow-hidden p-0">
              <div className="relative h-36 w-full bg-noite-alta">
                {c.capaUrl ? (
                  <Image src={c.capaUrl} alt={c.nome} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="h-9 w-9 rotate-45 border border-ouro/50" />
                  </div>
                )}
                <span className="absolute bottom-3 right-3 rounded-full bg-noite/80 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest text-ouro">
                  {vagas > 0 ? `${vagas} vaga${vagas === 1 ? "" : "s"}` : "Lotada"}
                </span>
                {c.oficial && (
                  <span className="absolute left-3 top-3 rounded-full border border-ouro bg-ouro/90 px-2.5 py-1 font-gravado text-[10px] uppercase tracking-widest text-tinta">
                    Original
                  </span>
                )}
              </div>

              <div className="p-5">
                {c.tom && (
                  <span className="font-gravado text-[11px] uppercase tracking-widest text-egeu">{c.tom}</span>
                )}
                <Link href={`/app/campanhas/${c.id}`}>
                  <h3 className="mt-1 font-titulo text-lg text-pergaminho hover:text-bronze">{c.nome}</h3>
                </Link>
                <p className="mt-1 text-sm text-foreground/70">Mestrado por {c.oraculoNome}</p>
                {c.sinopse && <p className="mt-2 line-clamp-3 text-xs text-foreground/60">{c.sinopse}</p>}

                {aviso[c.id] ? (
                  <p className="mt-3 text-xs text-egeu">{aviso[c.id]}</p>
                ) : jaSolicitou ? (
                  <p className="mt-3 text-xs text-foreground/50">Você já solicitou entrada.</p>
                ) : (
                  <Botao
                    variante="fantasma"
                    className="mt-3 w-full"
                    disabled={vagas <= 0 || entrando === c.id}
                    onClick={() => entrar(c.id)}
                  >
                    {entrando === c.id ? "Enviando…" : "Solicitar entrada"}
                  </Botao>
                )}
              </div>
            </ColunaFrame>
          );
        })}
      </div>
    </div>
  );
}
