import type { Amizade as AmizadeDb, Usuario } from "@prisma/client";
import type { Amizade } from "@/lib/tipos";

type AmizadeComUsuarios = AmizadeDb & { solicitante: Usuario; destinatario: Usuario };

export function paraAmizade(a: AmizadeComUsuarios, meuId: string): Amizade {
  const souSolicitante = a.solicitanteId === meuId;
  const outro = souSolicitante ? a.destinatario : a.solicitante;
  return {
    id: a.id,
    status: a.status as Amizade["status"],
    criadoEm: a.criadoEm.toISOString(),
    eu: souSolicitante ? "solicitante" : "destinatario",
    outro: { id: outro.id, nome: outro.nome, email: outro.email },
  };
}
