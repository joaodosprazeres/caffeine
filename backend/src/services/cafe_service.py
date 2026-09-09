import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.cafe import Cafe as CafeModel
from src.models.opiniao import Opiniao as OpiniaoModel
from src.schemas.cafe import CafeListaResponse
from src.schemas.opiniao import CafeConsolidado
from src.services.cafe_aggregates import build_cafe_response
from src.services.opiniao_service import OpiniaoService


class CafeNaoEncontradoError(Exception):
    pass


class CafeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def buscar(self, termo: str | None, page: int, page_size: int) -> CafeListaResponse:
        query = select(CafeModel)
        if termo:
            padrao = f"%{termo}%"
            query = query.where(or_(CafeModel.nome.ilike(padrao), CafeModel.produtor.ilike(padrao)))

        total = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        cafes = (
            await self.db.scalars(
                query.order_by(CafeModel.nome.asc()).offset((page - 1) * page_size).limit(page_size)
            )
        ).all()

        items = [await build_cafe_response(self.db, cafe) for cafe in cafes]
        return CafeListaResponse(items=items, page=page, page_size=page_size, total=total or 0)

    async def obter_consolidado(self, cafe_id: uuid.UUID) -> CafeConsolidado:
        cafe = await self.db.get(CafeModel, cafe_id)
        if cafe is None:
            raise CafeNaoEncontradoError

        cafe_schema = await build_cafe_response(self.db, cafe)

        opiniao_service = OpiniaoService(self.db)
        opiniao_ids = (
            await self.db.scalars(
                select(OpiniaoModel.id)
                .where(OpiniaoModel.cafe_id == cafe_id)
                .order_by(OpiniaoModel.created_at.desc())
            )
        ).all()
        opinioes = [(await opiniao_service.obter(opiniao_id))[1] for opiniao_id in opiniao_ids]

        return CafeConsolidado(**cafe_schema.model_dump(), opinioes=opinioes)
