from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Source(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    environments: List["Environment"] = Relationship(back_populates="source")


class Environment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    latitude: float
    longitude: float
    source_id: Optional[int] = Field(default=None, foreign_key="source.id")
    source: Optional[Source] = Relationship(back_populates="environments")


class Measurement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    environment_id: Optional[int] = Field(default=None, foreign_key="environment.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    parameter: str
    value: float
