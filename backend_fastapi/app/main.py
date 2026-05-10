from fastapi import FastAPI
from app.core.config import settings
from app.db.session import init_db
from app.api.routers import health, environment


def create_app() -> FastAPI:
    app = FastAPI(title="E4rth Backend")
    app.include_router(health.router)
    app.include_router(environment.router)

    @app.on_event("startup")
    def on_startup():
        init_db()

    return app


app = create_app()
