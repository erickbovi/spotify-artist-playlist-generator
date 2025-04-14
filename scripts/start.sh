#!/bin/sh

# Executa o prisma db push para criar as tabelas no banco de dados
npx prisma db push

# Inicia a aplicação
npm start 