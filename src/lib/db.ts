import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Local: usa o arquivo SQLite direto (DATABASE_URL="file:./dev.db").
 * Produção (Vercel): sem disco persistente — troca para o adaptador libSQL
 * apontando para um banco Turso, definido por TURSO_DATABASE_URL/TURSO_AUTH_TOKEN.
 * Continua sendo "SQLite por baixo", então o schema não muda entre os dois.
 */
function criarPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

export const db = globalForPrisma.prisma ?? criarPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
