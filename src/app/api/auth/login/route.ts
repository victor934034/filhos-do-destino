import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { criarSessao } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido."),
  senha: z.string().min(1, "Informe sua senha."),
});

export async function POST(req: Request) {
  const corpo = await req.json().catch(() => null);
  const parsed = schema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const { email, senha } = parsed.data;

  const usuario = await db.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return NextResponse.json({ erro: "Email ou senha incorretos." }, { status: 401 });
  }

  const confere = await bcrypt.compare(senha, usuario.senhaHash);
  if (!confere) {
    return NextResponse.json({ erro: "Email ou senha incorretos." }, { status: 401 });
  }

  await criarSessao({ usuarioId: usuario.id, nome: usuario.nome, email: usuario.email });

  return NextResponse.json({ ok: true });
}
