Northflank deployment guide — Backend + Worker + Data
=============================================

This document shows the recommended steps to deploy the backend services to Northflank.

Overview
--------
- Services to create on Northflank:
  - backend (HTTP web service running `uvicorn app.main:app`)
  - worker (background Celery worker)
  - postgres (managed Postgres DB via Northflank "Databases")
  - redis (managed Redis via Northflank "Databases" or external provider)
  - a one-off migration job to run `alembic upgrade head`

High-level flow
---------------
1. Build container images for `backend` and `worker` and push to a registry (we use GitHub Container Registry in the provided workflow).
2. Create Northflank services pointing to those images, add environment variables/secrets, connect to managed Postgres and Redis.
3. Run migrations using a one-off job (or run as a startup job) and confirm the API is healthy.

Prerequisites
-------------
- A container registry (the example workflow pushes to GitHub Container Registry / GHCR).
- A Northflank account and access to create Projects, Services and Databases.
- GitHub repository with the code and the workflow in `.github/workflows/build-and-push.yml` (included in repo).

Secrets & Environment Variables
--------------------------------
Create the following secrets in the Northflank project (and in GitHub actions secrets as needed):

- `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@host:5432/dbname`). Use the connection details from Northflank Database.
- `REDIS_URL` — Redis connection string (e.g. `redis://:password@host:6379/0`).
- `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` — For the frontend Get Involved form.
- `JWT_SECRET_KEY` — App JWT secret (if used).
- `OPENAI_API_KEY`, `MAPBOX_TOKEN`, etc. — any external API keys used by the app.
- Container registry credentials (if using a private registry): `CR_USERNAME`, `CR_PAT` or configure Northflank's registry integration.

Northflank service configuration notes
-------------------------------------
- Backend (web service):
  - Image: `ghcr.io/<OWNER>/<REPO>/backend:{{GITHUB_SHA}}` (or the tag you push).
  - Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
  - HTTP Port: `8000` (Health path `/health`).
  - Environment variables: `DATABASE_URL`, `REDIS_URL`, `ENVIRONMENT=production`, and all API keys/secrets.
  - CPU / Memory: choose small-medium to start (e.g., 0.5 CPU / 512-1024 MB).
  - Autoscaling: optional, set min=1, max=3.

- Worker (background):
  - Image: `ghcr.io/<OWNER>/<REPO>/worker:{{GITHUB_SHA}}`.
  - Command: `celery -A workers.celery_app worker -Q etl --loglevel=info`
  - Environment variables: same DB and REDIS credentials so Celery can access them.
  - CPU / Memory: background worker needs adequate memory depending on tasks.

- Postgres and Redis:
  - Use Northflank managed Postgres (Database -> Create). Note the connection URL and user/password.
  - For Redis, if Northflank offers Redis, create it; otherwise use a managed Redis (Upstash, Redis Cloud) and add URL to env.

Running migrations on Northflank
-------------------------------
Use Northflank one-off job or an ad-hoc container instance to run Alembic migrations using the deployed image.

Example command for a migration job using the backend image:

```
alembic -c alembic.ini upgrade head
```

Make sure the job has `DATABASE_URL` pointing to the Northflank Postgres.

CI: Build and push images (GitHub Actions)
----------------------------------------
The repository includes a workflow that builds both `backend` and `worker` images and pushes them to GHCR. After images are pushed you can point Northflank services to the new image tags.

Notes & recommended next steps
-----------------------------
- Enable Northflank GitHub integration if available — this allows automatic deploys when a new container image is pushed or when a branch changes.
- Use Northflank secrets for all sensitive values and never commit secrets to the repo.
- Configure health checks for the backend (`/health`) and set up log forwarding / alerts.

If you want, I can:
- Add the GitHub Actions workflow (build + push) to this repo (already included).
- Create a short script that runs migrations against the Northflank DB using the backend image.
- Prepare a sample `nf-templates` folder with service settings you can paste into Northflank UI.
