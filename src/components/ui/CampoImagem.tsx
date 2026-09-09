"use client";

import { useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { EditorRecorte } from "@/components/ui/EditorRecorte";
import { gerarImagemRecortada } from "@/lib/recorteImagem";
import { dispararErro } from "@/lib/toastMensagens";

/**
 * Campo de imagem com duas formas de preencher: colar uma URL ou enviar um
 * arquivo do computador. Ao escolher um arquivo, abre um editor de recorte/zoom
 * antes de subir — a imagem enviada já sai enquadrada e redimensionada.
 */
export function CampoImagem({
  value,
  onChange,
  placeholder = "https://…",
  aspecto,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  /** Proporção largura/altura do recorte (1 = quadrado, 16/9 = banner). Padrão: 1. */
  aspecto?: number;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [recortando, setRecortando] = useState<{ src: string; tipo: string } | null>(null);
  const inputArquivo = useRef<HTMLInputElement>(null);

  function escolherArquivo(arquivo: File) {
    const src = URL.createObjectURL(arquivo);
    setRecortando({ src, tipo: arquivo.type });
  }

  async function confirmarRecorte(area: Area) {
    if (!recortando) return;
    setEnviando(true);
    setErro(null);
    try {
      const blob = await gerarImagemRecortada(recortando.src, area, recortando.tipo);
      const extensao = recortando.tipo === "image/png" ? "png" : recortando.tipo === "image/webp" ? "webp" : "jpg";
      const arquivoFinal = new File([blob], `imagem.${extensao}`, { type: recortando.tipo });

      const form = new FormData();
      form.append("arquivo", arquivoFinal);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro ?? "Falha no upload");
      onChange(dados.url);
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : "Falha no upload";
      setErro(mensagem);
      dispararErro(mensagem);
    } finally {
      URL.revokeObjectURL(recortando.src);
      setRecortando(null);
      setEnviando(false);
    }
  }

  function cancelarRecorte() {
    if (recortando) URL.revokeObjectURL(recortando.src);
    setRecortando(null);
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-sm border border-[var(--border-sutil)] bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ouro"
        />
        <input
          ref={inputArquivo}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) escolherArquivo(arquivo);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputArquivo.current?.click()}
          disabled={enviando}
          className="shrink-0 rounded-sm border border-[var(--border-sutil)] px-3 py-2.5 text-xs uppercase tracking-wide hover:border-ouro disabled:opacity-50"
        >
          {enviando ? "Enviando…" : "Enviar arquivo"}
        </button>
      </div>
      {erro && <p className="mt-1.5 text-xs text-terracota">{erro}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mt-2 h-24 w-24 rounded-sm border border-[var(--border-sutil)] object-cover"
        />
      )}

      {recortando && (
        <EditorRecorte
          imagemSrc={recortando.src}
          aspecto={aspecto}
          onConfirmar={confirmarRecorte}
          onCancelar={cancelarRecorte}
        />
      )}
    </div>
  );
}
