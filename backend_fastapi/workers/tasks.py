from app.models import Measurement, Environment, Source
from app.db.session import engine
from sqlmodel import Session, select
from workers.celery_app import app
import httpx
from datetime import datetime


@app.task(name="workers.tasks.fetch_external_data")
def fetch_external_data(source_name: str, url: str):
    """Simple ETL task: fetch JSON from `url` and insert measurements."""
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(url)
            r.raise_for_status()
            data = r.json()

        # placeholder: expect data to be list of entries with lat/lon, parameter, value
        with Session(engine) as session:
            # ensure source exists
            src = session.exec(select(Source).where(Source.name == source_name)).first()
            if not src:
                src = Source(name=source_name, description="Imported source")
                session.add(src)
                session.commit()
                session.refresh(src)

            for entry in data:
                env = Environment(name=entry.get("name", "imported"), latitude=entry.get("lat", 0.0), longitude=entry.get("lon", 0.0), source_id=src.id)
                session.add(env)
                session.commit()
                session.refresh(env)

                meas = Measurement(environment_id=env.id, timestamp=datetime.utcnow(), parameter=entry.get("parameter", "unknown"), value=float(entry.get("value", 0.0)))
                session.add(meas)
            session.commit()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "error": str(e)}
