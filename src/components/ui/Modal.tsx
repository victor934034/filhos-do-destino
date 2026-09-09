import { ReactNode } from "react";
import { ColunaFrame } from "@/components/ui/ColunaFrame";

/** Janela flutuante centralizada — usada pra formulários de edição que não podem
 * ficar escondidos no meio de uma lista rolável (ex.: editar item/poder na ficha). */
export function Modal({
  titulo,
  onFechar,
  children,
  largura = "max-w-lg",
}: {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  largura?: string;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
      <ColunaFrame className={`w-full ${largura} max-h-[90vh] overflow-y-auto p-6`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-titulo text-lg text-pergaminho">{titulo}</h3>
          <button onClick={onFechar} aria-label="Fechar" className="text-foreground/50 hover:text-terracota">
            ✕
          </button>
        </div>
        {children}
      </ColunaFrame>
    </div>
  );
}
