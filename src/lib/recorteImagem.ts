export interface AreaRecorte {
  x: number;
  y: number;
  width: number;
  height: number;
}

const LADO_MAXIMO = 1600;

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => resolve(imagem);
    imagem.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    imagem.src = src;
  });
}

/** Recorta e redimensiona (limitando o lado maior a 1600px) uma imagem, devolvendo um Blob pronto pra upload. */
export async function gerarImagemRecortada(
  imagemSrc: string,
  area: AreaRecorte,
  tipoSaida: string,
  qualidade = 0.92
): Promise<Blob> {
  const imagem = await carregarImagem(imagemSrc);

  let largura = Math.round(area.width);
  let altura = Math.round(area.height);
  if (Math.max(largura, altura) > LADO_MAXIMO) {
    const escala = LADO_MAXIMO / Math.max(largura, altura);
    largura = Math.round(largura * escala);
    altura = Math.round(altura * escala);
  }

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador.");

  ctx.drawImage(imagem, area.x, area.y, area.width, area.height, 0, 0, largura, altura);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem recortada."))),
      tipoSaida,
      qualidade
    );
  });
}
