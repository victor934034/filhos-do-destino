# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# libssl é exigido pelo motor do Prisma; instalado aqui (base) para que o engine gerado
# no build e o executado em runtime sejam consistentes (debian-openssl-3.0.x nos dois).
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# ---------- deps ----------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- runtime ----------
FROM base AS runner
ENV NODE_ENV=production
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# node_modules completo (não o subconjunto do standalone) para que o CLI do Prisma
# (usado no boot para aplicar o schema mais recente ao volume) esteja disponível.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /app/prisma
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/app/data/dev.db"
ENV SESSION_SECRET="troque-esta-chave-em-producao-0123456789abcdef"
ENV UPLOAD_DIR="/app/data/uploads"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
