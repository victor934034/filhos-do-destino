import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paraCampanha, INCLUDE_CAMPANHA_COMPLETA } from "@/lib/campanhaDb";

export async function GET() {
  const campanhas = await db.campanha.findMany({
    where: { visibilidade: "publica" },
    include: INCLUDE_CAMPANHA_COMPLETA,
    orderBy: [{ oficial: "desc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json(campanhas.map(paraCampanha));
}
