#!/bin/sh

# Gera o cliente Prisma
npx prisma generate

# Executa as migrações
npx prisma migrate deploy

# Inicia a aplicação
npm run dev 