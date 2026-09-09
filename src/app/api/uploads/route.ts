import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { diretorioDeUploads } from "@/lib/uploadDir";
import { obterSessao } from "@/lib/auth";

const TIPOS_ACEITOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const TAMANHO_MAXIMO = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const form = await req.formData();
  const arquivo = form.get("arquivo");
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: "Arquivo maior que 8MB" }, { status: 400 });
  }
  const extensao = TIPOS_ACEITOS[arquivo.type];
  if (!extensao) {
    return NextResponse.json({ erro: "Formato não suportado (use PNG, JPG, WEBP ou GIF)" }, { status: 400 });
  }

  const nomeArquivo = `${randomUUID()}.${extensao}`;

  // Vercel não tem disco persistente — quando o Blob Storage está conectado
  // (BLOB_READ_WRITE_TOKEN definida automaticamente), sobe o arquivo pra lá.
  // Localmente/Docker (sem essa variável) continua salvando em disco.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(nomeArquivo, arquivo, { access: "public" });
    return NextResponse.json({ url: blob.url });
  }

  const dir = await diretorioDeUploads();
  const bytes = Buffer.from(await arquivo.arrayBuffer());
  await writeFile(path.join(dir, nomeArquivo), bytes);

  return NextResponse.json({ url: `/api/uploads/${nomeArquivo}` });
}
