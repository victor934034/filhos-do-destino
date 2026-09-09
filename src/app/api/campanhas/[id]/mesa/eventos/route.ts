import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso à mesa desta campanha." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  const tipo = ["rolagem", "chat", "narracao", "sistema"].includes(corpo?.tipo) ? corpo.tipo : "chat";
  if (!corpo?.conteudo) {
    return NextResponse.json({ erro: "Conteúdo vazio." }, { status: 400 });
  }
  if (tipo === "narracao" && !ehOraculo) {
    return NextResponse.json({ erro: "Só o Oráculo pode narrar." }, { status: 403 });
  }

  const mesa = await db.sessaoAoVivo.upsert({
    where: { campanhaId: id },
    update: {},
    create: { campanhaId: id },
  });

  const evento = await db.eventoSessao.create({
    data: {
      sessaoId: mesa.id,
      tipo,
      autorNome: corpo.autorNome ?? sessao.nome,
      conteudo: corpo.conteudo,
    },
  });

  // mantém apenas os últimos 200 eventos por sessão
  const total = await db.eventoSessao.count({ where: { sessaoId: mesa.id } });
  if (total > 200) {
    const antigos = await db.eventoSessao.findMany({
      where: { sessaoId: mesa.id },
      orderBy: { criadoEm: "asc" },
      take: total - 200,
      select: { id: true },
    });
    await db.eventoSessao.deleteMany({ where: { id: { in: antigos.map((e) => e.id) } } });
  }

  return NextResponse.json(evento, { status: 201 });
}
