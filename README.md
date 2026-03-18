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
npm run dev
```

The API server starts on **http://localhost:4000**.

Health check: `GET http://localhost:4000/api/health` → `{ "status": "ok" }`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The web app starts on **http://localhost:3000**.

## Documentation

See the [`docs/`](./docs/) folder for architecture details and future extension plans.

## License

MIT

