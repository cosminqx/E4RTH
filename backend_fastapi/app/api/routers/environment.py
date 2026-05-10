from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.models import Environment

router = APIRouter(prefix="/environments", tags=["environments"])


@router.get("/", response_model=List[Environment])
def list_environments(*, session: Session = Depends(get_session)):
    stmt = select(Environment)
    results = session.exec(stmt).all()
    return results


@router.post("/", response_model=Environment)
def create_environment(*, environment: Environment, session: Session = Depends(get_session)):
    session.add(environment)
    session.commit()
    session.refresh(environment)
    return environment


@router.get("/{environment_id}", response_model=Environment)
def get_environment(environment_id: int, session: Session = Depends(get_session)):
    env = session.get(Environment, environment_id)
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return env
