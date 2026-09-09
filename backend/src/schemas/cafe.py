import uuid

from pydantic import BaseModel, ConfigDict

from src.models.opiniao import Torra


class Cafe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str
    produtor: str
    grao_especial_atual: str | None = None
    torra_atual: Torra | None = None
    nota_media: float | None = None
    total_opinioes: int = 0
    total_notas: int = 0


class CafeListaResponse(BaseModel):
    items: list[Cafe]
    page: int
    page_size: int
    total: int
