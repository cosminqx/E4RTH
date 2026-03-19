#!/usr/bin/env bash
set -euo pipefail

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump was not found. Install PostgreSQL client tools first."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql was not found. Install PostgreSQL client tools first."
  exit 1
fi

if [[ -z "${LOCAL_DATABASE_URL:-}" ]]; then
  echo "LOCAL_DATABASE_URL is missing. Set it in your environment or .env file."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is missing. Set it in your environment or .env file."
  exit 1
fi

echo "Copying data from LOCAL_DATABASE_URL to DATABASE_URL (Neon target)..."
echo "This imports data only for Measurement, WeatherData, and BiodiversityRecord."

pg_dump \
  --data-only \
  --column-inserts \
  --disable-triggers \
  --table='"Measurement"' \
  --table='"WeatherData"' \
  --table='"BiodiversityRecord"' \
  "$LOCAL_DATABASE_URL" \
| psql "$DATABASE_URL"

echo "Data copy completed."
