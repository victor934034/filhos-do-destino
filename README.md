# Filhos do Destino — Plataforma

Fase 1 do produto: design system, landing page, autenticação, criação de personagem (wizard de 9 etapas)
e ficha de personagem interativa. Ver `PRD.md`/documento de especificação para o escopo completo.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Prisma + SQLite — local via arquivo (`dev.db`); em produção (Vercel) via adaptador libSQL
  apontando para um banco Turso (mesmo dialeto SQLite, schema não muda)
- Sessão via cookie assinado com `jose` (JWT), senha com `bcryptjs`
- Framer Motion para as animações das barras de Vida/Estamina/Áspis

## Rodando localmente

```bash
npm install
npx prisma db push   # cria/sincroniza o banco SQLite local (dev.db)
npm run dev
```

Abra http://localhost:3000.

Variáveis de ambiente (`.env`, já criado para dev):

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="troque-esta-chave-em-producao-..."
```

Troque `SESSION_SECRET` antes de qualquer deploy real.

## Deploy na Vercel

Vercel não tem disco persistente, então dois pontos do app trocam de estratégia automaticamente
via variáveis de ambiente — nenhuma mudança de código é necessária para publicar:

1. **Banco de dados** — crie um banco grátis em [turso.tech](https://turso.tech), pegue a URL
   (`libsql://...`) e o auth token, e defina no projeto Vercel:
   ```
   TURSO_DATABASE_URL="libsql://seu-banco.turso.io"
   TURSO_AUTH_TOKEN="..."
   ```
   Quando essas variáveis existem, `src/lib/db.ts` usa o adaptador libSQL em vez do arquivo
   local. Rode `npx prisma db push` uma vez apontando pro Turso (`DATABASE_URL` temporária com a
   mesma URL/token, ver docs do `@prisma/adapter-libsql`) para criar as tabelas lá.
2. **Upload de imagens** — ative o **Blob Storage** no painel da Vercel (Storage → Blob →
   Connect). A variável `BLOB_READ_WRITE_TOKEN` é injetada automaticamente; quando presente,
   `POST /api/uploads` sobe o arquivo pro Blob em vez do disco local.
3. **Sessão** — defina `SESSION_SECRET` (uma string aleatória longa) nas variáveis de ambiente
   do projeto.

Sem `TURSO_DATABASE_URL`/`BLOB_READ_WRITE_TOKEN` configuradas, o app tenta usar disco local — o
que falha silenciosamente em produção na Vercel. Configure as duas antes do primeiro deploy real.

## Deploy: front na Vercel + banco/uploads no EasyPanel

O app inteiro (UI + rotas `/api/*`) roda na Vercel — Next.js não separa front/back
fisicamente, então não tem um "backend" à parte pra rodar no EasyPanel. O que muda nesse
cenário é onde ficam os dois pontos que a Vercel não guarda em disco (banco e uploads):
em vez de Turso/Vercel Blob, apontam pra serviços self-hosted no EasyPanel.

**1. Banco de dados — `sqld` (servidor do Turso) no EasyPanel**

O adaptador já usado (`@prisma/adapter-libsql`) fala o protocolo libSQL com qualquer
servidor compatível, não só o Turso Cloud — então rodar o [`sqld`](https://github.com/tursodatabase/libsql)
(imagem Docker `ghcr.io/tursodatabase/libsql-server`) como app no EasyPanel funciona sem
nenhuma mudança de código. No projeto Vercel:
```
TURSO_DATABASE_URL="libsql://seu-app-no-easypanel.dominio.com"
TURSO_AUTH_TOKEN="..."   # se o sqld estiver com --auth-jwt-key configurado; senão, omita
```
Rode `npx prisma db push` uma vez apontando pra essa URL (mesmo processo do Turso Cloud)
pra criar as tabelas. Se preferir Postgres em vez de sqld, dá pra trocar — mas exige mudar
`provider = "sqlite"` pro `"postgresql"` em `prisma/schema.prisma` e retestar as queries,
então só vale a pena se `sqld` não servir por algum motivo.

**2. Uploads — MinIO (S3-compatível) no EasyPanel**

`POST /api/uploads` (`src/app/api/uploads/route.ts`) escolhe o destino nesta ordem —
primeira variável configurada vence: **S3 → Vercel Blob → disco local**. Suba um app MinIO
no EasyPanel, crie um bucket público, e defina no projeto Vercel:
```
S3_ENDPOINT="https://seu-minio-no-easypanel.dominio.com"
S3_BUCKET="filhos-do-destino"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL_BASE="https://seu-minio-no-easypanel.dominio.com/filhos-do-destino"  # opcional
```
Com `S3_ENDPOINT` definida, o Blob da Vercel é ignorado — não precisa conectar os dois.

**3. Sessão** — mesma coisa de sempre: `SESSION_SECRET` nas env vars do projeto Vercel.

## Estrutura

- `src/lib/regras.ts` — fonte única de verdade das regras mecânicas (atributos, dados, dificuldades,
  Regra do Mito, teste de combate). Qualquer cálculo numérico do jogo deve importar daqui.
- `src/components/ui/` — primitivos do design system (ColunaFrame, SeloAtributo, BarraEssencia, Botao, Dica).
- `src/components/wizard/AssistenteCriacao.tsx` — wizard de criação de personagem (9 etapas).
- `src/components/ficha/FichaView.tsx` — ficha de personagem interativa (rolagem de dados, ajuste de Vida/Estamina).
- `prisma/schema.prisma` — modelos `Usuario` e `Personagem`.

## API pública para integrações (MCP)

Além da UI, o sistema expõe uma API pública em `/api/mcp/*` para ferramentas externas — por
exemplo, um servidor MCP que crie campanhas com história pronta, monstros ou itens de forma
programática.

**Autenticação:** gere uma chave em `/app/configuracoes` (menu "Configurações") e envie em todo
request como `Authorization: Bearer <chave>`. A chave age em nome do usuário dono dela — se a
conta for admin, a chave também é.

**Categorias:** conteúdo criado por qualquer chave entra como **Comunidade** (`oficial: false`).
Só uma chave de conta admin pode marcar `oficial: true` na criação — isso classifica o conteúdo
como **Original**, mesma curadoria usada para o bestiário/compêndio feitos pela UI.

Endpoints:

- `GET /api/mcp/me` — identifica a chave (usuário, se é admin).
- `GET /api/mcp/campanhas?categoria=original|comunidade` — lista campanhas públicas.
- `POST /api/mcp/campanhas` — cria campanha; body: `{ nome, sinopse?, tom?, capaUrl?, visibilidade?, vagasMaximas?, oficial?, missoes?: [{ titulo, descricao? }] }`.
- `POST /api/mcp/campanhas/[id]/missoes` — adiciona um capítulo/missão a uma campanha já criada por essa chave.
- `GET /api/mcp/monstros?categoria=original|comunidade` — lista o bestiário público.
- `POST /api/mcp/monstros` — cria um monstro público (`FichaMonstro`, ver `src/lib/tipos.ts`).
- `GET /api/mcp/itens?categoria=original|comunidade` — lista o compêndio público.
- `POST /api/mcp/itens` — cria um item público (`ItemCompendio`, ver `src/lib/tipos.ts`).
- `GET /api/mcp/poderes?categoria=original|comunidade` — lista o compêndio de poderes/habilidades público.
- `POST /api/mcp/poderes` — cria um poder público (`PoderCompendio`, ver `src/lib/tipos.ts`).

Todas as respostas são JSON; erros vêm como `{ erro: string }` com o status HTTP apropriado
(401 chave inválida, 400 corpo inválido, 404 recurso não encontrado/sem permissão).

## O que falta (próximas fases, fora do escopo desta entrega)

Campanhas/Oráculo, bestiário, compêndio de itens, mesa ao vivo (WebSocket), estúdio de streaming —
ver Seções 6.5–6.10 do documento de especificação.
