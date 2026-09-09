import uuid

from pydantic import BaseModel, Field

from src.schemas.cafe import Cafe
from src.schemas.usuario import Usuario


class RankingGeralEntry(BaseModel):
    cafe: Cafe
    nota_media: float | None
    total_notas: int
    score_final: float


class RankingGeralResponse(BaseModel):
    items: list[RankingGeralEntry]
    page: int
    page_size: int
    total: int


class RankingPessoalItemResponse(BaseModel):
    posicao: int = Field(ge=1)
    cafe: Cafe


class RankingPessoalResponse(BaseModel):
    usuario: Usuario
    items: list[RankingPessoalItemResponse]


class RankingPessoalUpdateRequest(BaseModel):
    cafe_ids_em_ordem: list[uuid.UUID] = Field(min_length=1)
