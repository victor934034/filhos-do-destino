import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { diretorioDeUploads } from "@/lib/uploadDir";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(filename)) {
    return NextResponse.json({ erro: "Arquivo inválido" }, { status: 400 });
  }
  const dir = await diretorioDeUploads();
  try {
    const bytes = await readFile(path.join(dir, filename));
    const extensao = filename.split(".").pop()!;
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": CONTENT_TYPES[extensao],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  }
}
