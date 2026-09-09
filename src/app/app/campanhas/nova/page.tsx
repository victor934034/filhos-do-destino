import { FormNovaCampanha } from "@/components/campanha/FormNovaCampanha";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export const metadata = { title: "Nova campanha — Filhos do Destino" };

export default function PaginaNovaCampanha() {
  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app/campanhas" />
      </div>
      <FormNovaCampanha />
    </>
  );
}
