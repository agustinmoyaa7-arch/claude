#!/usr/bin/env bash
# Prueba las migraciones + RLS en un Postgres local (imita Supabase con un shim).
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=fichaje_test
PSQL="psql -v ON_ERROR_STOP=1 -q -U postgres -h localhost"
${PSQL} -d postgres -c "drop database if exists ${DB}" -c "create database ${DB}"
${PSQL} -d ${DB} -f supabase/tests/shim_supabase.sql
for f in supabase/migrations/*.sql; do ${PSQL} -d ${DB} -f "$f"; done
${PSQL} -d ${DB} -f supabase/tests/aislamiento.test.sql
