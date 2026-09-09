import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraTransacao } from "@/lib/transacaoDb";
import type { TipoTransacao } from "@/lib/tipos";

const TIPOS_VALIDOS: TipoTransacao[] = ["recompensa", "venda", "compra", "ajusteManual"];

/** Dono do personagem, ou Oráculo de alguma campanha em que ele participa (aprovado). */
async function autorizado(personagemId: string, usuarioId: string) {
  const personagem = await db.personagem.findUnique({ where: { id: personagemId } });
  if (!personagem) return { personagem: null, campanhaId: null as string | null };

  if (personagem.usuarioId === usuarioId) return { personagem, campanhaId: null as string | null };

  const vinculo = await db.campanhaJogador.findFirst({
    where: { personagemId, status: "aprovado", campanha: { oraculoId: usuarioId } },
    select: { campanhaId: true },
  });
  if (vinculo) return { personagem, campanhaId: vinculo.campanhaId };

  return { personagem: null, campanhaId: null as string | null };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { personagem } = await autorizado(id, sessao.usuarioId);
  if (!personagem) return NextResponse.json({ erro: "Sem acesso a este personagem." }, { status: 404 });

  const transacoes = await db.transacao.findMany({
    where: { personagemId: id },
    orderBy: { criadoEm: "desc" },
    take: 30,
  });

  return NextResponse.json({ saldo: personagem.dracmas, transacoes: transacoes.map(paraTransacao) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { personagem, campanhaId } = await autorizado(id, sessao.usuarioId);
  if (!personagem) return NextResponse.json({ erro: "Sem acesso a este personagem." }, { status: 404 });

  const corpo = await req.json().catch(() => null);
  const valor = Number(corpo?.valor);
  if (!Number.isFinite(valor) || valor === 0) {
    return NextResponse.json({ erro: "Informe um valor diferente de zero." }, { status: 400 });
  }
  const tipo: TipoTransacao = TIPOS_VALIDOS.includes(corpo?.tipo) ? corpo.tipo : "ajusteManual";
  const motivo: string = typeof corpo?.motivo === "string" ? corpo.motivo.slice(0, 280) : "";

  const novoSaldo = personagem.dracmas + valor;
  if (novoSaldo < 0) {
    return NextResponse.json({ erro: "Saldo insuficiente." }, { status: 400 });
  }

  const [atualizado, transacao] = await db.$transaction([
    db.personagem.update({ where: { id }, data: { dracmas: novoSaldo } }),
    db.transacao.create({
      data: {
        personagemId: id,
        campanhaId,
        tipo,
        valor,
        motivo,
        autorId: sessao.usuarioId,
      },
    }),
  ]);

  return NextResponse.json({ saldo: atualizado.dracmas, transacao: paraTransacao(transacao) }, { status: 201 });
}
