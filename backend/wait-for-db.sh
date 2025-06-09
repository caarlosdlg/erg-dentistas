#!/bin/bash
# wait-for-db.sh - Espera a que PostgreSQL esté disponible

set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "PostgreSQL no está disponible - esperando..."
  sleep 1
done

>&2 echo "PostgreSQL está disponible - ejecutando comando"
exec $cmd
