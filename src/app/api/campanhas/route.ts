import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraCampanha, INCLUDE_CAMPANHA_COMPLETA } from "@/lib/campanhaDb";
import { regrasDaCasaPadrao } from "@/lib/tipos";

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const corpo = await req.json().catch(() => null);
  if (!corpo?.nome?.trim()) {
    return NextResponse.json({ erro: "A campanha precisa de um nome." }, { status: 400 });
  }

  const regras = { ...regrasDaCasaPadrao(), ...(corpo.regrasDaCasa ?? {}) };

  const criada = await db.campanha.create({
    data: {
      oraculoId: sessao.usuarioId,
      nome: corpo.nome.trim(),
      sinopse: corpo.sinopse ?? "",
      capaUrl: corpo.capaUrl || null,
      visibilidade: corpo.visibilidade === "publica" ? "publica" : "privada",
      vagasMaximas: Number(corpo.vagasMaximas) || 5,
      tom: corpo.tom ?? "",
      regrasDaCasa: JSON.stringify(regras),
    },
    include: INCLUDE_CAMPANHA_COMPLETA,
  });

  return NextResponse.json(paraCampanha(criada), { status: 201 });
}
