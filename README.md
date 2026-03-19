# E4RTH

E4RTH is an integrated digital and community platform tackling the **Triple Planetary Crisis** — climate change, pollution, and biodiversity loss — by transforming environmental data into actionable insights and civic engagement.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS (App Router) |
| Backend | Node.js, Express, TypeScript |
| Database *(planned)* | PostgreSQL + PostGIS |
| AI Service *(planned)* | Python microservice |

## Project Structure

```
E4RTH/
├── frontend/   # Next.js web application
├── backend/    # Express REST API
└── docs/       # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API server starts on **http://localhost:5001**.

Health check: `GET http://localhost:5001/api/health` -> `{ "status": "ok" }`

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The web app starts on **http://localhost:3000**.

## Neon Cloud Database Deployment

Use this when promoting your local backend database setup to Neon.

### 1. Configure backend environment for Neon

Set these in `backend/.env` (local) and in your deployment platform secrets:

- `DATABASE_URL` = Neon pooled connection string (`sslmode=require`)
- `OPENAQ_API_KEY`
- `NODE_ENV=production` (in production)

Optional for one-time local-to-Neon copy:

- `LOCAL_DATABASE_URL` = your local Postgres URL

### 2. Apply schema on Neon

Run from `backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
```

Important: use `prisma migrate deploy` in cloud, not `prisma migrate dev`.

### 3. Copy local data to Neon (optional)

If you already have local records and want them online:

```bash
cd backend
set -a; source .env; set +a
npm run db:copy:local-to-neon
```

This copies data for:

- `Measurement`
- `WeatherData`
- `BiodiversityRecord`

### 4. Backend production start command

Use:

```bash
npm run build
npm run start:prod
```

`start:prod` runs migrations first, then starts the server.

### 5. Frontend production environment

Set in `frontend/.env.local` locally and on your frontend host in production:

- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_API_URL` = your deployed backend URL

### 6. Smoke test after deploy

- `GET /api/health`
- `GET /api/environment/map`
- `GET /api/environment/all`

## Documentation

See the [`docs/`](./docs/) folder for architecture details and future extension plans.

## License

MIT

