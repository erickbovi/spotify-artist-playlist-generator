#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

# Extrai as credenciais da DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  >&2 echo "Error: DATABASE_URL is not set"
  exit 1
fi

# Remove o prefixo postgresql://
DB_URL=${DATABASE_URL#postgresql://}

# Extrai as partes da URL
DB_USER=$(echo $DB_URL | cut -d':' -f1)
DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d'/' -f1)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2 | cut -d'?' -f1)

# Valida as variáveis
if [ -z "$DB_HOST" ]; then
  >&2 echo "Error: Could not extract host from DATABASE_URL"
  >&2 echo "DATABASE_URL: $DATABASE_URL"
  exit 1
fi

>&2 echo "Waiting for database connection..."
>&2 echo "Host: $DB_HOST"
>&2 echo "User: $DB_USER"
>&2 echo "Database: $DB_NAME"

# Função para verificar se o host está resolvendo
wait_for_host() {
  until ping -c 1 $DB_HOST > /dev/null 2>&1; do
    >&2 echo "Host $DB_HOST is unavailable - sleeping"
    sleep 1
  done
  >&2 echo "Host $DB_HOST is up"
}

# Função para verificar se o PostgreSQL está aceitando conexões
wait_for_postgres() {
  until PGPASSWORD=$DB_PASS psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' > /dev/null 2>&1; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
  >&2 echo "Postgres is up"
}

# Primeiro espera o host estar disponível
wait_for_host

# Depois espera o PostgreSQL estar pronto
wait_for_postgres

# Executa as migrações do Prisma
>&2 echo "Running Prisma migrations..."
npx prisma migrate deploy

>&2 echo "Postgres is up - executing command"
exec $cmd 