import Link from "next/link";
import { FormAutenticacao } from "@/components/site/FormoAutenticacao";

export const metadata = { title: "Criar conta — Filhos do Destino" };

export default function PaginaCadastro() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <FormAutenticacao
        titulo="Descubra seu sangue divino"
        subtitulo="Crie sua conta para começar sua jornada em Lua Nova."
        endpoint="/api/auth/registrar"
        textoBotao="Criar minha conta"
        campos={[
          { nome: "nome", label: "Nome", tipo: "text", autoComplete: "name" },
          { nome: "email", label: "Email", tipo: "email", autoComplete: "email" },
          { nome: "senha", label: "Senha", tipo: "password", autoComplete: "new-password" },
        ]}
        rodape={
          <>
            Já tem uma conta?{" "}
            <Link href="/entrar" className="text-bronze underline underline-offset-2">
              Entrar
            </Link>
          </>
        }
      />
    </main>
  );
}
