import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao, gerarChaveApi } from "@/lib/auth";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const chaves = await db.chaveApi.findMany({
    where: { usuarioId: sessao.usuarioId },
    orderBy: { criadoEm: "desc" },
    select: { id: true, nome: true, prefixo: true, criadoEm: true, ultimoUsoEm: true },
  });
  return NextResponse.json(chaves);
}

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const corpo = await req.json().catch(() => ({}));
  const nome = typeof corpo.nome === "string" && corpo.nome.trim() ? corpo.nome.trim() : "Chave sem nome";

  const { chave, chaveHash, prefixo } = gerarChaveApi();
  const registro = await db.chaveApi.create({
    data: { usuarioId: sessao.usuarioId, nome, chaveHash, prefixo },
  });

  // A chave em texto puro só existe nesta resposta — não é salva em lugar nenhum.
  return NextResponse.json(
    { id: registro.id, nome: registro.nome, prefixo: registro.prefixo, criadoEm: registro.criadoEm, chave },
    { status: 201 }
  );
}
