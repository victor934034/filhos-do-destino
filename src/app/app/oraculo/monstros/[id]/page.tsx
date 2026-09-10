import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraMonstro } from "@/lib/monstroDb";
import { EditorMonstro } from "@/components/bestiario/EditorMonstro";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaEditarMonstro({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const m = await db.monstro.findUnique({ where: { id } });
  if (!m || m.oraculoId !== sessao.usuarioId) notFound();

  const admin = sessao.admin ?? false;
  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/oraculo/monstros" />
      </div>
      <EditorMonstro inicial={paraMonstro(m)} monstroId={m.id} souAdmin={admin} />
    </>
  );
}
