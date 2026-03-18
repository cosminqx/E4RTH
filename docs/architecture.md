# E4RTH Architecture Overview

## System Architecture

E4RTH is a monorepo consisting of:

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 15 (App Router, TypeScript, Tailwind CSS) | User-facing web application |
| Backend | Node.js + Express + TypeScript | REST API server |
| Database *(planned)* | PostgreSQL + PostGIS | Geospatial data storage |
| AI Service *(planned)* | Python microservice | Environmental AI models |

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |

## Directory Structure

```
E4RTH/
├── frontend/          # Next.js application
│   ├── app/           # App Router pages & layouts
│   │   ├── components/ # Reusable UI components
│   │   ├── layout.tsx  # Root layout
│   │   └── page.tsx    # Homepage
│   └── lib/           # Shared utilities
├── backend/           # Express API server
│   └── src/
│       ├── controllers/ # Route handlers
│       ├── routes/      # Express routers
│       └── services/    # Business logic
└── docs/              # Project documentation
```

## Future Extensions

- **Mapbox** – Interactive geospatial map
- **PostgreSQL + PostGIS** – Spatial queries on environmental data
- **AI Microservice** – Climate simulation and anomaly detection (Python)
- **Volunteer System** – User registration, reporting, and engagement
