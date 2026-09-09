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
  const bytes = Buffer.from(await arquivo.arrayBuffer());

  // Ordem de prioridade — a primeira opção configurada via env var vence:
  // 1) S3/MinIO self-hosted (ex.: EasyPanel) — S3_ENDPOINT definida.
  // 2) Vercel Blob — BLOB_READ_WRITE_TOKEN definida automaticamente ao conectar o Storage.
  // 3) Disco local — dev/Docker, sem nenhuma das duas acima.
  if (process.env.S3_ENDPOINT) {
    const url = await subirParaS3(nomeArquivo, bytes, arquivo.type);
    return NextResponse.json({ url });
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(nomeArquivo, arquivo, { access: "public" });
    return NextResponse.json({ url: blob.url });
  }

  const dir = await diretorioDeUploads();
  await writeFile(path.join(dir, nomeArquivo), bytes);

  return NextResponse.json({ url: `/api/uploads/${nomeArquivo}` });
}

/**
 * Sobe o arquivo pra um bucket S3-compatível (MinIO no EasyPanel, ou qualquer outro).
 * Variáveis: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
 * S3_REGION (opcional, default "auto"), S3_PUBLIC_URL_BASE (opcional — domínio público
 * na frente do bucket; sem ela, monta a URL como `${S3_ENDPOINT}/${S3_BUCKET}/${arquivo}`).
 */
async function subirParaS3(nomeArquivo: string, bytes: Buffer, contentType: string) {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET não configurada.");

  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    forcePathStyle: true, // exigido pelo MinIO
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: nomeArquivo,
      Body: bytes,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  const base = process.env.S3_PUBLIC_URL_BASE || `${process.env.S3_ENDPOINT}/${bucket}`;
  return `${base.replace(/\/$/, "")}/${nomeArquivo}`;
}
