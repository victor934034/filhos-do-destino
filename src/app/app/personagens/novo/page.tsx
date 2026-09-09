import { AssistenteCriacao } from "@/components/wizard/AssistenteCriacao";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export const metadata = { title: "Criar personagem — Filhos do Destino" };

export default async function PaginaNovoPersonagem({
  searchParams,
}: {
  searchParams: Promise<{ campanhaId?: string }>;
}) {
  const { campanhaId } = await searchParams;
  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref={campanhaId ? `/app/campanhas/${campanhaId}` : "/app/personagens"} />
      </div>
      <AssistenteCriacao campanhaId={campanhaId} />
    </>
  );
}
