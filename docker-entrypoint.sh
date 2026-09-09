#!/bin/sh
set -e

# Aplica o schema atual ao volume persistido — cria o banco no primeiro boot
# e adiciona tabelas/colunas novas em boots seguintes (SQLite, sem perda de dados existentes).
node_modules/.bin/prisma db push --skip-generate --accept-data-loss --schema=./prisma/schema.prisma

exec "$@"
