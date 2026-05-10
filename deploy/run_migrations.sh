#!/usr/bin/env sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Set the DATABASE_URL env var and retry."
  exit 1
fi

echo "Running Alembic migrations against: ${DATABASE_URL}"

# The repository copies files into /app in the Docker image. Use the alembic.ini
# at the repository root (backend_fastapi/alembic.ini) so we reference the correct
# config. Adjust path if your image sets a different working directory.

alembic -c backend_fastapi/alembic.ini upgrade head

echo "Migrations complete."
