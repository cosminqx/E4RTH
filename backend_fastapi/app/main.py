from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import init_db
from app.api.routers import health, environment, map


def create_app() -> FastAPI:
    app = FastAPI(title="E4rth Backend")

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:5173",
            "https://e4rth.vercel.app",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(environment.router)
    app.include_router(map.router)

    @app.on_event("startup")
    def on_startup():
        init_db()

    return app


app = create_app()
