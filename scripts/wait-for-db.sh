#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

# Extrai as credenciais da DATABASE_URL
DB_URL=${DATABASE_URL#postgresql://}
DB_USER=$(echo $DB_URL | cut -d':' -f1)
DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d'/' -f1)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2 | cut -d'?' -f1)

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

>&2 echo "Postgres is up - executing command"
exec $cmd 