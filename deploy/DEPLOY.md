# Deploy: front na Vercel + banco/uploads no EasyPanel

Passo a passo completo. Veja `deploy/easypanel-sqld-minio.yml` pros dois serviços que
sobem no EasyPanel — este documento é o "como usar" ao redor daquele arquivo.

## 1. EasyPanel — subir `sqld` (banco) e MinIO (uploads)

1. No EasyPanel, crie um novo serviço do tipo **App**, aba **Compose**, e cole o conteúdo
   de `deploy/easypanel-sqld-minio.yml`. Ele sobe dois serviços: `sqld` e `minio`.
   (Se sua versão do EasyPanel não tiver a aba Compose, recrie os dois como serviços
   separados — imagem, porta e variáveis exatamente como no arquivo.)
2. Antes de subir: troque `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` por valores reais.
3. Ative **Domains** em cada serviço (isso já vem com HTTPS automático):
   - `sqld` → domínio A, ex. `banco-fdd.seudominio.com`, apontando pra porta `8080`.
   - `minio` → domínio B, ex. `uploads-fdd.seudominio.com`, apontando pra porta `9000`
     (a porta `9001` é só o console de admin — não precisa de domínio público, acesse
     via IP/porta direto se precisar entrar nele).

## 2. MinIO — criar o bucket

1. Abra o console do MinIO (porta `9001`, usuário/senha definidos no passo 1).
2. Crie um bucket, ex. `filhos-do-destino`.
3. Torne o bucket público pra leitura: **Bucket → Access Policy → Public** (só leitura
   pública é necessária — as imagens do site precisam ser acessíveis sem autenticação).
4. Em **Access Keys**, crie uma chave nova — anote `Access Key` e `Secret Key`, são as
   duas variáveis `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` do passo 4.

## 3. sqld — criar as tabelas

Com o domínio do `sqld` já público, rode isso **uma vez**, local, na raiz do projeto:

```bash
DATABASE_URL="libsql://banco-fdd.seudominio.com" npx prisma db push
```

Se você configurou autenticação por JWT no `sqld` (ver comentário no arquivo compose),
inclua o token: consulte a doc do `@prisma/adapter-libsql`/`@libsql/client` pra passar
`authToken` num script Node ao invés do `prisma db push` direto, já que o CLI do Prisma
não aceita token separado por env var pronto — nesse caso é mais simples deixar o `sqld`
sem auth só durante esse passo inicial (isolado, sem domínio público ainda) e ativar auth
depois de confirmar que as tabelas foram criadas.

## 4. Vercel — importar o projeto e configurar

1. [vercel.com/new](https://vercel.com/new) → importar `victor934034/filhos-do-destino`.
2. Em **Environment Variables**, adicionar:
   ```
   TURSO_DATABASE_URL=libsql://banco-fdd.seudominio.com
   TURSO_AUTH_TOKEN=...          # só se ativou auth no sqld
   S3_ENDPOINT=https://uploads-fdd.seudominio.com
   S3_BUCKET=filhos-do-destino
   S3_ACCESS_KEY_ID=...
   S3_SECRET_ACCESS_KEY=...
   SESSION_SECRET=...            # string aleatória longa, gere com openssl rand -hex 32
   ```
3. Deploy. O build da Vercel já roda `next build` normal — não precisa de configuração
   extra de build command/output (o `next.config.ts` já tem `output: "standalone"`, que a
   Vercel ignora automaticamente no ambiente serverless dela, sem conflito).

## 5. Conferir

- Abrir o domínio da Vercel, criar uma conta, criar um personagem com foto — se a foto
  aparecer, o MinIO está funcionando.
- Checar no console do MinIO (bucket → Objects) se o arquivo realmente subiu lá.
- Deslogar/logar de novo, atualizar a página — se os dados persistirem, o `sqld` está
  funcionando (contrário: se sumir tudo a cada novo deploy, é sinal de que caiu no
  fallback de disco local — confira se `TURSO_DATABASE_URL` está mesmo definida na Vercel).
