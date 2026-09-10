import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { BarraLateral } from "@/components/app/BarraLateral";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  const ehAdmin = sessao.admin ?? false;

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      <BarraLateral nome={sessao.nome} patente={ehAdmin ? "Admin" : "Guia"} ehAdmin={ehAdmin} />
      <main className="min-w-0 flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
