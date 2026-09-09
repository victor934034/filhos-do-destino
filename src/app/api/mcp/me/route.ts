import { NextResponse } from "next/server";
import { autenticarChaveApi } from "@/lib/auth";

export async function GET(req: Request) {
  const sessao = await autenticarChaveApi(req);
  if (!sessao) return NextResponse.json({ erro: "Chave de API inválida." }, { status: 401 });

  return NextResponse.json(sessao);
}
