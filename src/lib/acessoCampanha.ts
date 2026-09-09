import { db } from "@/lib/db";

export async function verificarAcessoCampanha(campanhaId: string, usuarioId: string) {
  const campanha = await db.campanha.findUnique({
    where: { id: campanhaId },
    include: { jogadores: true },
  });
  if (!campanha) return { campanha: null, ehOraculo: false, ehJogadorAprovado: false };

  const ehOraculo = campanha.oraculoId === usuarioId;
  const ehJogadorAprovado = campanha.jogadores.some(
    (j) => j.usuarioId === usuarioId && j.status === "aprovado"
  );

  return { campanha, ehOraculo, ehJogadorAprovado };
}
