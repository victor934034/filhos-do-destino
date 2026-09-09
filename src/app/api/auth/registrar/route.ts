import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { criarSessao } from "@/lib/auth";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(60),
  email: z.string().trim().toLowerCase().email("Email inválido."),
  senha: z.string().min(8, "A senha precisa ter ao menos 8 caracteres."),
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
  const { nome, email, senha } = parsed.data;

  const existente = await db.usuario.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ erro: "Já existe uma conta com este email." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await db.usuario.create({
    data: { nome, email, senhaHash },
  });

  await criarSessao({ usuarioId: usuario.id, nome: usuario.nome, email: usuario.email });

  return NextResponse.json({ ok: true });
}
