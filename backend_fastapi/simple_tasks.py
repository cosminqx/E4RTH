import os
from celery import Celery
from sqlmodel import create_engine, Session, select
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://e4rth_user:password@localhost:5432/e4rth_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery = Celery("e4rth", broker=REDIS_URL, backend=REDIS_URL)

engine = create_engine(DATABASE_URL, echo=False)


@celery.task(name="simple_tasks.import_measurements")
def import_measurements(data: list):
    """Expect data to be list of dicts: {name, lat, lon, parameter, value}"""
    from sqlmodel import SQLModel, Field

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

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        for entry in data:
            env_stmt = select(Environment).where(Environment.name == entry.get("name"))
            env = session.exec(env_stmt).first()
            if not env:
                env = Environment(name=entry.get("name", "imported"), latitude=float(entry.get("lat", 0.0)), longitude=float(entry.get("lon", 0.0)))
                session.add(env)
                session.commit()
                session.refresh(env)

            meas = Measurement(environment_id=env.id, timestamp=datetime.utcnow(), parameter=entry.get("parameter", "unknown"), value=float(entry.get("value", 0.0)))
            session.add(meas)
        session.commit()
    return {"status": "ok"}
