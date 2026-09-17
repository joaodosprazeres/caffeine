from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db
from src.schemas.ranking import RankingGeralResponse
from src.services.ranking_service import RankingService

router = APIRouter(tags=["ranking"])


@router.get("/ranking-geral", response_model=RankingGeralResponse)
async def obter_ranking_geral(
    page: int = 1, page_size: int = 20, db: AsyncSession = Depends(get_db)
) -> RankingGeralResponse:
    return await RankingService(db).calcular_ranking_geral(page, page_size)
