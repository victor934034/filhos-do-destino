import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

const CHAVE = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "chave-de-desenvolvimento-nao-usar-em-producao"
);
const COOKIE = "fd_sessao";
const DURACAO_DIAS = 30;

export interface SessaoPayload {
  usuarioId: string;
  nome: string;
  email: string;
  // Presente desde que o banco passou a ser remoto (Turso/sqld) — consultar isso a cada
  // navegação vinha custando uma ida à rede por clique. Fica embutido no JWT (assinado,
  // não falsificável) só pra decisões de UI (mostrar/esconder menu, toggle "Original");
  // ações administrativas de verdade nas rotas de API continuam checando o banco (ver
  // souAdmin) — então revogar admin de alguém vale imediatamente pra essas, só a sessão
  // já aberta leva até a próxima renovação (login/registro) pra refletir no menu.
  admin?: boolean;
}

export async function criarSessao(payload: SessaoPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_DIAS}d`)
    .sign(CHAVE);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * DURACAO_DIAS,
  });
}

export async function encerrarSessao() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function obterSessao(): Promise<SessaoPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, CHAVE);
    return payload as unknown as SessaoPayload;
  } catch {
    return null;
  }
}

// Não guardamos "admin" no JWT (evita ter que deslogar todo mundo quando promovemos
// alguém) — consulta o banco a cada checagem, mas é uma query barata por id indexado.
export async function souAdmin(usuarioId: string): Promise<boolean> {
  const { db } = await import("@/lib/db");
  const usuario = await db.usuario.findUnique({ where: { id: usuarioId }, select: { admin: true } });
  return usuario?.admin ?? false;
}

// ---------- Chaves de API (para integrações externas, ex.: um MCP) ----------

const PREFIXO_CHAVE = "fdd_";

function hashChave(chave: string) {
  return createHash("sha256").update(chave).digest("hex");
}

/** Gera uma nova chave em texto puro (mostrada só uma vez) + o hash que vai pro banco. */
export function gerarChaveApi() {
  const chave = `${PREFIXO_CHAVE}${randomBytes(24).toString("hex")}`;
  return { chave, chaveHash: hashChave(chave), prefixo: chave.slice(0, 12) };
}

export interface SessaoApi {
  usuarioId: string;
  nome: string;
  email: string;
  admin: boolean;
}

/** Autentica uma requisição da API pública via `Authorization: Bearer <chave>`. */
export async function autenticarChaveApi(req: Request): Promise<SessaoApi | null> {
  const cabecalho = req.headers.get("authorization") ?? "";
  const [tipo, chave] = cabecalho.split(" ");
  if (tipo?.toLowerCase() !== "bearer" || !chave) return null;

  const { db } = await import("@/lib/db");
  const registro = await db.chaveApi.findUnique({
    where: { chaveHash: hashChave(chave) },
    include: { usuario: { select: { id: true, nome: true, email: true, admin: true } } },
  });
  if (!registro) return null;

  db.chaveApi.update({ where: { id: registro.id }, data: { ultimoUsoEm: new Date() } }).catch(() => {});

  return {
    usuarioId: registro.usuario.id,
    nome: registro.usuario.nome,
    email: registro.usuario.email,
    admin: registro.usuario.admin,
  };
}
