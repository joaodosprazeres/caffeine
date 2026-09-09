import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.models.opiniao import Torra
from src.schemas.cafe import Cafe
from src.schemas.comentario import Comentario
from src.schemas.usuario import Usuario


class OpiniaoCreateRequest(BaseModel):
    cafe_nome: str = Field(min_length=1, max_length=120)
    cafe_produtor: str = Field(min_length=1, max_length=120)
    grao_especial: str = Field(min_length=1, max_length=120)
    torra: Torra
    texto: str = Field(min_length=1, max_length=2000)


class Opiniao(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    autor: Usuario
    cafe: Cafe
    grao_especial: str
    torra: Torra
    texto: str
    nota_media: float | None = None
    total_notas: int = 0
    total_comentarios: int = 0
    created_at: datetime


class OpiniaoDetalhe(Opiniao):
    comentarios: list[Comentario]
    nota_do_usuario_atual: int | None = None


class OpiniaoListaResponse(BaseModel):
    items: list[Opiniao]
    page: int
    page_size: int
    total: int


class CafeConsolidado(Cafe):
    opinioes: list[Opiniao]
