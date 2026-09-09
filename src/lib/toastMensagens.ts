export interface MensagemToast {
  id: number;
  tipo: "erro" | "sucesso";
  texto: string;
}

type Ouvinte = (toast: MensagemToast) => void;

const ouvintes = new Set<Ouvinte>();

/** Dispara um toast simples de erro/sucesso — para falhas de rede, permissão, etc. */
export function dispararMensagem(tipo: MensagemToast["tipo"], texto: string) {
  const toast: MensagemToast = { id: Date.now() + Math.random(), tipo, texto };
  ouvintes.forEach((fn) => fn(toast));
}

export function dispararErro(texto: string) {
  dispararMensagem("erro", texto);
}

export function ouvirMensagens(fn: Ouvinte): () => void {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

/** Faz um fetch e, se a resposta não for ok, dispara um toast de erro com a mensagem da API. */
export async function fetchOuAvisar(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      dispararErro(json?.erro ?? "Algo deu errado. Tente novamente.");
      return null;
    }
    return res;
  } catch {
    dispararErro("Não foi possível conectar. Verifique sua internet.");
    return null;
  }
}
