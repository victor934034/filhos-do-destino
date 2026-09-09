import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";
import { dadoDoAtributo } from "@/lib/regras";
import type { ParticipanteIniciativa } from "@/lib/tipos";

function rolarD(faces: number) {
  return Math.floor(Math.random() * faces) + 1;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || !ehOraculo) {
    return NextResponse.json({ erro: "Só o Oráculo pode rolar a iniciativa." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({ monstroIds: [] as string[] }));
  const monstroIds: string[] = corpo.monstroIds ?? [];

  const jogadoresAprovados = campanha.jogadores.filter((j) => j.status === "aprovado" && j.personagemId);
  const personagens = await db.personagem.findMany({
    where: { id: { in: jogadoresAprovados.map((j) => j.personagemId!) } },
  });
  const monstros = monstroIds.length
    ? await db.monstro.findMany({ where: { id: { in: monstroIds } } })
    : [];

  const participantes: ParticipanteIniciativa[] = [
    ...personagens.map((p) => ({
      tipo: "personagem" as const,
      id: p.id,
      nome: p.nome,
      valor: rolarD(20) + rolarD(dadoDoAtributo(p.destreza)),
    })),
    ...monstros.map((m) => ({
      tipo: "monstro" as const,
      id: m.id,
      nome: m.nome,
      valor: rolarD(20) + rolarD(dadoDoAtributo(m.destreza)),
      vidaAtual: m.vida,
      vidaMax: m.vida,
    })),
  ].sort((a, b) => b.valor - a.valor);

  if (participantes.length === 0) {
    return NextResponse.json(
      { erro: "Ninguém para rolar iniciativa ainda — aprove jogadores com personagem vinculado ou selecione monstros." },
      { status: 400 }
    );
  }

  const mesa = await db.sessaoAoVivo.upsert({
    where: { campanhaId: id },
    update: { ordemIniciativa: JSON.stringify(participantes), turnoAtual: 0 },
    create: { campanhaId: id, ordemIniciativa: JSON.stringify(participantes) },
  });

  await db.eventoSessao.create({
    data: {
      sessaoId: mesa.id,
      tipo: "sistema",
      autorNome: "O Oráculo",
      conteudo: `Iniciativa rolada: ${participantes.map((p) => `${p.nome} (${p.valor})`).join(", ")}`,
    },
  });

  return NextResponse.json(participantes);
}
