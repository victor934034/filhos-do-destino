import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { EditorMonstro } from "@/components/bestiario/EditorMonstro";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaNovoMonstro() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  const admin = sessao.admin ?? false;

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/oraculo/monstros" />
      </div>
      <EditorMonstro souAdmin={admin} />
    </>
  );
}
