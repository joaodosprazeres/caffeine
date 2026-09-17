import uuid

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.nota import Nota as NotaModel
from src.models.opiniao import Opiniao as OpiniaoModel
from src.schemas.nota import Nota as NotaSchema
from src.schemas.nota import NotaUpsertRequest


class OpiniaoNaoEncontradaError(Exception):
    pass


class AutorNaoPodeNotarPropriaOpiniaoError(Exception):
    pass


class NotaService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def dar_ou_atualizar_nota(
        self, opiniao_id: uuid.UUID, avaliador_id: uuid.UUID, dados: NotaUpsertRequest
    ) -> NotaSchema:
        opiniao = await self.db.get(OpiniaoModel, opiniao_id)
        if opiniao is None:
            raise OpiniaoNaoEncontradaError

        if opiniao.autor_id == avaliador_id:
            raise AutorNaoPodeNotarPropriaOpiniaoError

        stmt = (
            insert(NotaModel)
            .values(opiniao_id=opiniao_id, avaliador_id=avaliador_id, valor=dados.valor)
            .on_conflict_do_update(
                index_elements=[NotaModel.opiniao_id, NotaModel.avaliador_id],
                set_={"valor": dados.valor, "updated_at": func.now()},
            )
            .returning(NotaModel)
        )
        result = await self.db.execute(stmt)
        nota = result.scalar_one()
        await self.db.commit()

        return NotaSchema(opiniao_id=nota.opiniao_id, valor=nota.valor, updated_at=nota.updated_at)

    async def obter_nota_do_usuario(
        self, opiniao_id: uuid.UUID, avaliador_id: uuid.UUID
    ) -> int | None:
        return await self.db.scalar(
            select(NotaModel.valor).where(
                NotaModel.opiniao_id == opiniao_id, NotaModel.avaliador_id == avaliador_id
            )
        )
