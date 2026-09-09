import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraAmizade } from "@/lib/amizadeDb";
import { PainelAmigos } from "@/components/amigos/PainelAmigos";

export default async function PaginaAmigos() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const amizades = await db.amizade.findMany({
    where: { OR: [{ solicitanteId: sessao.usuarioId }, { destinatarioId: sessao.usuarioId }] },
    include: { solicitante: true, destinatario: true },
    orderBy: { criadoEm: "desc" },
  });

  return <PainelAmigos inicial={amizades.map((a) => paraAmizade(a, sessao.usuarioId))} />;
}
