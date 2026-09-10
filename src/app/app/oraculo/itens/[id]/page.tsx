import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraItemCompendio } from "@/lib/itemCompendioDb";
import { EditorItem } from "@/components/compendio/EditorItem";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaEditarItem({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const it = await db.itemCompendio.findUnique({ where: { id } });
  if (!it || it.oraculoId !== sessao.usuarioId) notFound();

  const admin = sessao.admin ?? false;
  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/oraculo/itens" />
      </div>
      <EditorItem inicial={paraItemCompendio(it)} itemId={it.id} souAdmin={admin} />
    </>
  );
}
