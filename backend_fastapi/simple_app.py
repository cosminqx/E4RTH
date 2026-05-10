import os
from typing import List
from datetime import datetime

from fastapi import FastAPI, HTTPException
from sqlmodel import SQLModel, Field, create_engine, Session, select

# Simple models (reuse or mirror app.models)
class Environment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    latitude: float
    longitude: float

class Measurement(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    environment_id: int
    timestamp: datetime
    parameter: str
    value: float

# Database URL from env
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://e4rth_user:password@localhost:5432/e4rth_db")

engine = create_engine(DATABASE_URL, echo=False)

app = FastAPI(title="E4rth MVP")


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/environments", response_model=List[Environment])
def list_envs():
    with Session(engine) as session:
        return session.exec(select(Environment)).all()


@app.post("/environments", response_model=Environment)
def create_env(env: Environment):
    with Session(engine) as session:
        session.add(env)
        session.commit()
        session.refresh(env)
        return env


@app.post("/measurements")
def create_measurement(m: Measurement):
    with Session(engine) as session:
        # ensure env exists
        env = session.get(Environment, m.environment_id)
        if not env:
            raise HTTPException(status_code=404, detail="Environment not found")
        session.add(m)
        session.commit()
        session.refresh(m)
        return {"status": "ok", "id": m.id}
