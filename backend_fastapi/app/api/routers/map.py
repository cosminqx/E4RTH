from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.session import get_session
from app.models import Environment

router = APIRouter(prefix="/api/environment", tags=["map"])


class UnifiedMapPoint(BaseModel):
    lat: float
    lng: float
    category: str  # "air" | "weather" | "biodiversity"
    type: str
    value: float | str
    level: Optional[str] = None
    metadata: Optional[dict] = None


@router.get("/map", response_model=List[UnifiedMapPoint])
def get_map_data(*, session: Session = Depends(get_session)):
    """
    Fetch unified map data from backend.
    Returns all environments as map points.
    """
    stmt = select(Environment)
    environments = session.exec(stmt).all()
    
    map_points = []
    for env in environments:
        # Convert environment to map point
        # For now, all environments are treated as generic data points
        point = UnifiedMapPoint(
            lat=env.latitude,
            lng=env.longitude,
            category="air",  # Default category; can be customized based on source
            type=env.name,
            value=0,  # No measurement value yet
            metadata={
                "id": env.id,
                "name": env.name,
                "source_id": env.source_id,
            },
        )
        map_points.append(point)
    
    return map_points
