import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { paraFicha } from "@/lib/personagemDb";
import { FichaView } from "@/components/ficha/FichaView";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaFicha({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const p = await db.personagem.findUnique({ where: { id } });
  if (!p || p.usuarioId !== sessao.usuarioId) notFound();

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/personagens" />
      </div>
      <FichaView ficha={paraFicha(p)} />
    </>
  );
}
