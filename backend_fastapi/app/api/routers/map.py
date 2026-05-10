from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.models import Environment

router = APIRouter(prefix="/api/environment", tags=["map"])


def _build_map_points(session: Session) -> list[dict[str, Any]]:
    stmt = select(Environment)
    environments = session.exec(stmt).all()

    return [
        {
            "lat": env.latitude,
            "lng": env.longitude,
            "category": "air",
            "type": env.name,
            "value": 0,
            "metadata": {
                "id": env.id,
                "name": env.name,
                "source_id": env.source_id,
            },
        }
        for env in environments
    ]


@router.get("/map")
@router.get("/data")
def get_map_data(*, session: Session = Depends(get_session)):
    """
    Fetch unified map data from backend.
    Returns all environments as map points.
    """
    try:
        return _build_map_points(session)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to fetch map data") from error
