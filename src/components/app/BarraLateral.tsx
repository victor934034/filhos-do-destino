"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutBotao } from "@/components/site/LogoutBotao";
import { rolarFormula } from "@/lib/regras";
import { dispararRolagem } from "@/lib/toastRolagens";

const ITENS_NAV = [
  { nome: "Personagens", href: "/app/personagens" },
  { nome: "Campanhas", href: "/app/campanhas" },
  { nome: "Homebrew", href: "/app/homebrew" },
  { nome: "Amigos", href: "/app/amigos" },
  { nome: "Configurações", href: "/app/configuracoes" },
];

export function BarraLateral({
  nome,
  patente,
  ehAdmin = false,
}: {
  nome: string;
  patente: string;
  ehAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [formula, setFormula] = useState("2d6+3");
  const [notificacoes, setNotificacoes] = useState({ amizadesPendentes: 0, solicitacoesCampanha: 0 });
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    function buscar() {
      fetch("/api/notificacoes")
        .then((r) => r.json())
        .then((d) => setNotificacoes({ amizadesPendentes: d.amizadesPendentes ?? 0, solicitacoesCampanha: d.solicitacoesCampanha ?? 0 }))
        .catch(() => {});
    }
    buscar();
    const t = setInterval(buscar, 20000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fecha o menu mobile ao navegar
    setMenuAberto(false);
  }, [pathname]);

  const BADGES: Record<string, number> = {
    "/app/campanhas": notificacoes.solicitacoesCampanha,
    "/app/amigos": notificacoes.amizadesPendentes,
  };
  const itensNav = ehAdmin ? [...ITENS_NAV, { nome: "Admin", href: "/app/admin" }] : ITENS_NAV;
  const totalBadges = notificacoes.solicitacoesCampanha + notificacoes.amizadesPendentes;

  function rolarLivre() {
    const resultado = rolarFormula(formula);
    if (!resultado) {
      dispararRolagem("Rolagem livre", "Fórmula ilegível", {
        dadoAtributo: 0,
        resultadosDado: [],
        d20: [],
        usouMito: false,
        critico: false,
        total: 0,
        detalhe: `Não entendi "${formula}". Tente 2d6+3.`,
      });
      return;
    }
    dispararRolagem("Rolagem livre", formula, resultado);
  }

  return (
    <>
      {/* Barra superior — só no mobile/tablet */}
      <div className="flex items-center justify-between border-b border-[var(--border-sutil)] bg-noite-alta px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ouro">
            <span className="h-2 w-2 rotate-45 bg-ouro" />
          </span>
          <span className="font-titulo text-xs uppercase tracking-[0.14em] text-pergaminho">Filhos do Destino</span>
        </Link>
        <button
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-sutil)] text-pergaminho hover:border-ouro"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="h-[2px] w-4 bg-current" />
            <span className="h-[2px] w-4 bg-current" />
            <span className="h-[2px] w-4 bg-current" />
          </span>
          {totalBadges > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-terracota px-1 font-gravado text-[10px] font-bold text-pergaminho">
              {totalBadges > 9 ? "9+" : totalBadges}
            </span>
          )}
        </button>
      </div>

      {/* Fundo escurecido atrás do menu, no mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMenuAberto(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[228px] shrink-0 -translate-x-full flex-col border-r border-[var(--border-sutil)] bg-noite-alta transition-transform duration-200 lg:static lg:z-auto lg:flex lg:translate-x-0 ${
          menuAberto ? "translate-x-0" : ""
        }`}
      >
        <Link href="/" className="hidden items-center gap-3 border-b border-[var(--border-sutil)] px-5 py-5 lg:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ouro">
            <span className="h-2.5 w-2.5 rotate-45 bg-ouro" />
          </span>
          <span className="font-titulo text-xs uppercase leading-tight tracking-[0.14em] text-pergaminho">
            Filhos do
            <br />
            Destino
          </span>
        </Link>

        <nav className="flex flex-col gap-1 overflow-y-auto p-2.5">
          {itensNav.map((item) => {
            const ativo = pathname.startsWith(item.href);
            const badge = BADGES[item.href] ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 border-l-2 px-3 py-2.5 font-titulo text-[13px] font-semibold tracking-wide ${
                  ativo
                    ? "border-ouro bg-ouro-claro/10 text-ouro"
                    : "border-transparent text-pergaminho/75 hover:text-ouro-claro"
                }`}
              >
                <span className="h-2 w-2 rotate-45 bg-current" />
                {item.nome.toUpperCase()}
                {badge > 0 && (
                  <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-terracota px-1 font-gravado text-[10px] font-bold text-pergaminho">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="border-t border-[var(--border-sutil)] p-4">
          <p className="mb-2 font-gravado text-[9px] uppercase tracking-[0.16em] text-foreground/50">
            Rolagem livre
          </p>
          <div className="flex gap-1.5">
            <input
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="2d6+3"
              className="w-0 flex-1 rounded-sm border border-[var(--border-sutil)] bg-background px-2.5 py-2 font-gravado text-sm text-pergaminho outline-none focus:border-ouro"
            />
            <button
              onClick={rolarLivre}
              className="shrink-0 rounded-sm bg-ouro px-3 font-titulo text-xs font-bold text-tinta hover:bg-ouro-claro"
            >
              D20
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-t border-[var(--border-sutil)] px-4 py-3.5">
          <span className="h-8 w-8 shrink-0 rounded-full border border-ouro bg-noite" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-pergaminho">{nome}</p>
            <p className="font-gravado text-[9px] uppercase tracking-wide text-ouro">{patente}</p>
          </div>
          <div className="ml-auto">
            <LogoutBotao />
          </div>
        </div>
      </aside>
    </>
  );
}
