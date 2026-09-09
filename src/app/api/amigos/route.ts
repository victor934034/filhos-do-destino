import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraAmizade } from "@/lib/amizadeDb";

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const amizades = await db.amizade.findMany({
    where: { OR: [{ solicitanteId: sessao.usuarioId }, { destinatarioId: sessao.usuarioId }] },
    include: { solicitante: true, destinatario: true },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(amizades.map((a) => paraAmizade(a, sessao.usuarioId)));
}

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { destinatarioId } = (await req.json()) as { destinatarioId: string };
  if (!destinatarioId || destinatarioId === sessao.usuarioId) {
    return NextResponse.json({ erro: "Destinatário inválido." }, { status: 400 });
  }

  // Se a outra pessoa já te chamou, aceita direto em vez de duplicar o pedido.
  const inversa = await db.amizade.findUnique({
    where: { solicitanteId_destinatarioId: { solicitanteId: destinatarioId, destinatarioId: sessao.usuarioId } },
    include: { solicitante: true, destinatario: true },
  });
  if (inversa) {
    if (inversa.status === "pendente") {
      const atualizada = await db.amizade.update({
        where: { id: inversa.id },
        data: { status: "aceita" },
        include: { solicitante: true, destinatario: true },
      });
      return NextResponse.json(paraAmizade(atualizada, sessao.usuarioId));
    }
    return NextResponse.json(paraAmizade(inversa, sessao.usuarioId));
  }

  const criada = await db.amizade.upsert({
    where: { solicitanteId_destinatarioId: { solicitanteId: sessao.usuarioId, destinatarioId } },
    update: {},
    create: { solicitanteId: sessao.usuarioId, destinatarioId, status: "pendente" },
    include: { solicitante: true, destinatario: true },
  });

  return NextResponse.json(paraAmizade(criada, sessao.usuarioId), { status: 201 });
}
