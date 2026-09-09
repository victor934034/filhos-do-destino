import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { verificarAcessoCampanha } from "@/lib/acessoCampanha";
import type { CenaDeStream } from "@/lib/tipos";

function paraCena(cena: {
  layout: string;
  camerasConfig: string;
  fundoId: string;
  fundoCustomUrl: string | null;
  tituloCena: string;
  overlayAtivo: boolean;
}): CenaDeStream {
  return {
    layout: cena.layout as CenaDeStream["layout"],
    camerasConfig: JSON.parse(cena.camerasConfig),
    fundoId: cena.fundoId,
    fundoCustomUrl: cena.fundoCustomUrl,
    tituloCena: cena.tituloCena,
    overlayAtivo: cena.overlayAtivo,
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo, ehJogadorAprovado } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || (!ehOraculo && !ehJogadorAprovado)) {
    return NextResponse.json({ erro: "Sem acesso." }, { status: 403 });
  }

  const cena = await db.cenaDeStream.upsert({
    where: { campanhaId: id },
    update: {},
    create: { campanhaId: id },
  });

  return NextResponse.json(paraCena(cena));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const { campanha, ehOraculo } = await verificarAcessoCampanha(id, sessao.usuarioId);
  if (!campanha || !ehOraculo) {
    return NextResponse.json({ erro: "Só o Oráculo pode editar a cena." }, { status: 403 });
  }

  const corpo = (await req.json()) as CenaDeStream;
  const dados = {
    layout: corpo.layout,
    camerasConfig: JSON.stringify(corpo.camerasConfig),
    fundoId: corpo.fundoId,
    fundoCustomUrl: corpo.fundoCustomUrl ?? null,
    tituloCena: corpo.tituloCena ?? "",
    overlayAtivo: corpo.overlayAtivo,
  };

  const cena = await db.cenaDeStream.upsert({
    where: { campanhaId: id },
    update: dados,
    create: { campanhaId: id, ...dados },
  });

  return NextResponse.json(paraCena(cena));
}
