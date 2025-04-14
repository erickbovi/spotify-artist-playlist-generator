#!/bin/sh
# wait-for-db.sh

set -e

# Debug: mostrar todas as variáveis de ambiente
>&2 echo "Debugging environment variables:"
env | grep -i database || true
env | grep -i postgres || true

# Verifica se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  >&2 echo "Error: DATABASE_URL is not set"
  >&2 echo "Current environment variables:"
  env
  exit 1
fi

>&2 echo "Waiting for database to be ready..."

# Espera inicial para garantir que o banco esteja pronto (aumentado para 3 segundos conforme recomendação)
sleep 3

# Adiciona suporte a IPv6 na URL do banco de dados se necessário
if [[ "$DATABASE_URL" == *"railway.internal"* ]]; then
  export DATABASE_URL="${DATABASE_URL}?family=0"
  >&2 echo "Added IPv6 support to DATABASE_URL"
fi

# Executa as migrações do Prisma
>&2 echo "Running Prisma migrations..."
npx prisma migrate deploy

>&2 echo "Database is up - executing command"
exec $@ 