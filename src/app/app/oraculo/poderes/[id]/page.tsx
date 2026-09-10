import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraPoderCompendio } from "@/lib/poderCompendioDb";
import { EditorPoder } from "@/components/compendio/EditorPoder";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaEditarPoder({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const p = await db.poderCompendio.findUnique({ where: { id } });
  if (!p || p.oraculoId !== sessao.usuarioId) notFound();

  const admin = sessao.admin ?? false;
  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/oraculo/poderes" />
      </div>
      <EditorPoder inicial={paraPoderCompendio(p)} poderId={p.id} souAdmin={admin} />
    </>
  );
}
