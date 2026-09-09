import { redirect } from "next/navigation";
import { obterSessao, souAdmin } from "@/lib/auth";
import { EditorPoder } from "@/components/compendio/EditorPoder";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaNovoPoder() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  const admin = await souAdmin(sessao.usuarioId);

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/oraculo/poderes" />
      </div>
      <EditorPoder souAdmin={admin} />
    </>
  );
}
