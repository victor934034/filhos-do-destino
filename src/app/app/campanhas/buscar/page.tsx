import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { BuscarCampanhas } from "@/components/campanha/BuscarCampanhas";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaBuscarCampanhas() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/campanhas" />
      </div>
      <BuscarCampanhas usuarioId={sessao.usuarioId} />
    </>
  );
}
