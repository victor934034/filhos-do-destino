import { redirect } from "next/navigation";
import { obterSessao, souAdmin } from "@/lib/auth";
import { EditorMonstro } from "@/components/bestiario/EditorMonstro";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaNovoMonstro() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  const admin = await souAdmin(sessao.usuarioId);

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/oraculo/monstros" />
      </div>
      <EditorMonstro souAdmin={admin} />
    </>
  );
}
