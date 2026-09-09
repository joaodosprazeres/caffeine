import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db
from src.schemas.cafe import CafeListaResponse
from src.schemas.opiniao import CafeConsolidado
from src.services.cafe_service import CafeNaoEncontradoError, CafeService

router = APIRouter(prefix="/cafes", tags=["cafes"])


@router.get("", response_model=CafeListaResponse)
async def buscar_cafes(
    q: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
) -> CafeListaResponse:
    return await CafeService(db).buscar(q, page, page_size)


@router.get("/{cafe_id}", response_model=CafeConsolidado)
async def obter_consolidado_cafe(
    cafe_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> CafeConsolidado:
    try:
        return await CafeService(db).obter_consolidado(cafe_id)
    except CafeNaoEncontradoError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="café não encontrado"
        ) from exc
