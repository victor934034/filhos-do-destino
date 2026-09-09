import Link from "next/link";
import { FormAutenticacao } from "@/components/site/FormoAutenticacao";

export const metadata = { title: "Entrar — Filhos do Destino" };

export default function PaginaEntrar() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <FormAutenticacao
        titulo="Retornar a Lua Nova"
        subtitulo="Entre para acessar suas fichas e campanhas."
        endpoint="/api/auth/login"
        textoBotao="Entrar"
        campos={[
          { nome: "email", label: "Email", tipo: "email", autoComplete: "email" },
          { nome: "senha", label: "Senha", tipo: "password", autoComplete: "current-password" },
        ]}
        rodape={
          <>
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="text-bronze underline underline-offset-2">
              Crie seu semideus
            </Link>
          </>
        }
      />
    </main>
  );
}
