"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Botao } from "@/components/ui/Botao";

/** Modal de recorte/zoom antes do upload — abre sempre que uma imagem é escolhida em CampoImagem. */
export function EditorRecorte({
  imagemSrc,
  aspecto,
  onConfirmar,
  onCancelar,
}: {
  imagemSrc: string;
  aspecto?: number;
  onConfirmar: (area: Area) => void;
  onCancelar: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  const aoCompletarRecorte = useCallback((_areaPercentual: Area, areaEmPixels: Area) => {
    setAreaPixels(areaEmPixels);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg rounded-sm border border-ouro/50 bg-[var(--surface)] p-5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)]">
        <p className="font-titulo text-sm uppercase tracking-wide text-bronze">Ajustar imagem</p>
        <p className="mt-1 text-xs text-foreground/60">
          Arraste para posicionar e use o zoom para enquadrar antes de enviar.
        </p>

        <div className="relative mt-4 h-72 w-full overflow-hidden rounded-sm border border-[var(--border-sutil)] bg-noite">
          <Cropper
            image={imagemSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspecto ?? 1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={aoCompletarRecorte}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="font-gravado text-[10px] uppercase tracking-widest text-bronze">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 flex-1 accent-ouro"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-sm border border-[var(--border-sutil)] px-4 py-2 text-xs uppercase tracking-wide text-foreground/70 hover:border-terracota hover:text-terracota"
          >
            Cancelar
          </button>
          <Botao onClick={() => areaPixels && onConfirmar(areaPixels)} disabled={!areaPixels}>
            Usar esta imagem
          </Botao>
        </div>
      </div>
    </div>
  );
}
