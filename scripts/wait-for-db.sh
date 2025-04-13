#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

# Função para verificar se o host está resolvendo
wait_for_host() {
  until ping -c 1 $host > /dev/null 2>&1; do
    >&2 echo "Host $host is unavailable - sleeping"
    sleep 1
  done
  >&2 echo "Host $host is up"
}

# Função para verificar se o PostgreSQL está aceitando conexões
wait_for_postgres() {
  until PGPASSWORD=postgres psql -h "$host" -U "postgres" -d "spotify" -c '\q' > /dev/null 2>&1; do
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