import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class NotaUpsertRequest(BaseModel):
    valor: int = Field(ge=1, le=5)


class Nota(BaseModel):
    opiniao_id: uuid.UUID
    valor: int = Field(ge=1, le=5)
    updated_at: datetime
