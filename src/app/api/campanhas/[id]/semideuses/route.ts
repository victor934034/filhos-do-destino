import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraFicha, paraFichaLimitada } from "@/lib/personagemDb";

/**
 * Fonte única e ao vivo dos personagens em jogo de uma campanha — usada pelo Hub,
 * Escudo do Oráculo e Mesa Ao Vivo via polling curto, pra nenhuma tela guardar uma
 * cópia parada dos dados do Personagem enquanto o jogador edita a própria ficha.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const c = await db.campanha.findUnique({
    where: { id },
    include: { jogadores: { include: { personagem: true } } },
  });
  if (!c) return NextResponse.json({ erro: "Campanha não encontrada." }, { status: 404 });

  const ehOraculo = c.oraculoId === sessao.usuarioId;
  const ehJogadorAprovado = c.jogadores.some((j) => j.usuarioId === sessao.usuarioId && j.status === "aprovado");
  if (!ehOraculo && !ehJogadorAprovado) {
    return NextResponse.json({ erro: "Sem acesso a esta campanha." }, { status: 403 });
  }

  const personagens = c.jogadores
    .filter((j) => j.status === "aprovado" && j.personagem)
    .map((j) => {
      const p = j.personagem!;
      const vejoTudo = ehOraculo || j.usuarioId === sessao.usuarioId || !p.bloqueadoParaJogadores;
      return vejoTudo ? { ...paraFicha(p), donoUsuarioId: j.usuarioId } : { ...paraFichaLimitada(p), donoUsuarioId: j.usuarioId };
    });

  return NextResponse.json(personagens);
}
