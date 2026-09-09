import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.schemas.usuario import Usuario


class ComentarioCreateRequest(BaseModel):
    texto: str = Field(min_length=1, max_length=1000)


class Comentario(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    autor: Usuario
    texto: str
    created_at: datetime
