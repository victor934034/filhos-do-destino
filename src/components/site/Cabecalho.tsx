import Link from "next/link";
import { obterSessao } from "@/lib/auth";

const NAV = [
  { nome: "Rolagens", href: "/#rolagens" },
  { nome: "Escudo do Oráculo", href: "/#escudo" },
  { nome: "Bestiário", href: "/#bestiario" },
  { nome: "Ficha", href: "/#ficha" },
];

const REDES = [
  { nome: "Instagram", href: "https://instagram.com" },
  { nome: "TikTok", href: "https://tiktok.com" },
  { nome: "X", href: "https://x.com" },
];

export async function Cabecalho() {
  const sessao = await obterSessao();

  return (
    <header className="sticky top-0 z-40 bg-noite text-pergaminho">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-titulo text-sm uppercase tracking-[0.14em] text-ouro-claro">
          Filhos do Destino
        </Link>

        <nav className="hidden items-center gap-7 font-titulo text-xs uppercase tracking-[0.1em] text-pergaminho/80 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ouro-claro">
              {item.nome}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {REDES.map((r) => (
              <a
                key={r.nome}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                aria-label={r.nome}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-pergaminho/25 text-[10px] uppercase text-pergaminho/70 hover:border-ouro hover:text-ouro-claro"
              >
                {r.nome[0]}
              </a>
            ))}
          </div>
          <Link
            href={sessao ? "/app" : "/cadastro"}
            className="rounded-full bg-ouro px-5 py-2 font-titulo text-xs font-bold uppercase tracking-[0.1em] text-tinta hover:bg-ouro-claro"
          >
            {sessao ? "Abrir a mesa" : "Criar conta"}
          </Link>
        </div>
      </div>
      <div className="faixa-meandro" />
    </header>
  );
}
