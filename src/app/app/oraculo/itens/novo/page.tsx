import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { EditorItem } from "@/components/compendio/EditorItem";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaNovoItem() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  const admin = sessao.admin ?? false;

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/oraculo/itens" />
      </div>
      <EditorItem souAdmin={admin} />
    </>
  );
}
