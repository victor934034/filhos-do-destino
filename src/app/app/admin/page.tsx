import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao, souAdmin } from "@/lib/auth";
import { PainelAdmin } from "@/components/admin/PainelAdmin";
import { BotaoVoltar } from "@/components/ui/BotaoVoltar";

export default async function PaginaAdmin() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  if (!(await souAdmin(sessao.usuarioId))) notFound();

  const usuarios = await db.usuario.findMany({
    orderBy: { criadoEm: "desc" },
    select: { id: true, nome: true, email: true, admin: true, criadoEm: true },
  });

  return (
    <>
      <div className="px-5 pt-5">
        <BotaoVoltar fallbackHref="/app" />
      </div>
      <PainelAdmin
        inicial={usuarios.map((u) => ({ ...u, criadoEm: u.criadoEm.toISOString() }))}
        meuId={sessao.usuarioId}
      />
    </>
  );
}
