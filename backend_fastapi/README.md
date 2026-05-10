E4rth Backend (FastAPI) — Simplified MVP

This folder contains a simplified MVP backend using:

- FastAPI
- PostgreSQL
- Redis
- Celery
- Docker (Dockerfile + docker-compose)

Quick start (MVP, Docker Compose):

1. Build and start services (Postgres, Redis, web, worker):

```bash
cd backend_fastapi
docker compose up --build
```

2. The FastAPI app will be available at `http://localhost:8000`.

3. To run Celery tasks locally (without Docker), set `DATABASE_URL` and `REDIS_URL`, then:

```bash
# start worker
celery -A workers.celery_app worker -Q etl --loglevel=info

# example of calling task from Python REPL
from workers.tasks import fetch_external_data
fetch_external_data.delay("demo-source", "https://example.com/data.json")
```

Notes:
- The project keeps a modular structure under `app/` for a production-ready layout supporting future GIS and AI work.
- `simple_app.py` remains available as a compact reference but the Docker Compose and images use the modular `app.main` entrypoint.

**Development Workflow**

Use the included `Makefile` and `docker-compose.yml` for local development.

- Build and start everything in the background:

```bash
cd backend_fastapi
make up
```

- Start only the backend (development, mounted code, with reload):

```bash
make dev
```

- Stop and remove containers:

```bash
make down
```

- Follow logs:

```bash
make logs
```

- Run DB migrations (Alembic must be configured; initial revision may need to be created once):

```bash
make migrate
```

Healthchecks:
- `postgres` service uses `pg_isready`
- `redis` uses `redis-cli ping`
- `backend` uses the `/health` HTTP endpoint

Services in `docker-compose.yml`:
- `postgres` (Postgres 15)
- `redis` (Redis 7)
- `backend` (FastAPI app — `app.main`)
- `worker` (Celery worker using `workers.celery_app`)
- `ai-service` (placeholder for future AI/ML service)
