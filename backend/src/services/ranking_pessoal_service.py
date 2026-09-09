import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.cafe import Cafe as CafeModel
from src.models.opiniao import Opiniao as OpiniaoModel
from src.models.ranking_pessoal import RankingPessoalItem
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.ranking import RankingPessoalItemResponse, RankingPessoalResponse
from src.schemas.usuario import Usuario as UsuarioSchema
from src.services.cafe_aggregates import build_cafe_response


class UsuarioNaoEncontradoError(Exception):
    pass


class CafeSemOpiniaoDoUsuarioError(Exception):
    def __init__(self, cafe_id: uuid.UUID):
        self.cafe_id = cafe_id


class RankingPessoalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _montar_resposta(self, usuario: UsuarioModel) -> RankingPessoalResponse:
        itens = (
            await self.db.scalars(
                select(RankingPessoalItem)
                .where(RankingPessoalItem.usuario_id == usuario.id)
                .order_by(RankingPessoalItem.posicao.asc())
            )
        ).all()

        items_resposta = []
        for item in itens:
            cafe = await self.db.get(CafeModel, item.cafe_id)
            assert cafe is not None
            items_resposta.append(
                RankingPessoalItemResponse(
                    posicao=item.posicao, cafe=await build_cafe_response(self.db, cafe)
                )
            )

        return RankingPessoalResponse(
            usuario=UsuarioSchema.model_validate(usuario), items=items_resposta
        )

    async def obter_por_username(self, username: str) -> RankingPessoalResponse | None:
        usuario = await self.db.scalar(
            select(UsuarioModel).where(UsuarioModel.username == username)
        )
        if usuario is None:
            return None
        return await self._montar_resposta(usuario)

    async def atualizar(
        self, usuario_id: uuid.UUID, cafe_ids_em_ordem: list[uuid.UUID]
    ) -> RankingPessoalResponse:
        for cafe_id in cafe_ids_em_ordem:
            tem_opiniao = await self.db.scalar(
                select(OpiniaoModel.id).where(
                    OpiniaoModel.autor_id == usuario_id, OpiniaoModel.cafe_id == cafe_id
                )
            )
            if tem_opiniao is None:
                raise CafeSemOpiniaoDoUsuarioError(cafe_id)

        await self.db.execute(
            delete(RankingPessoalItem).where(RankingPessoalItem.usuario_id == usuario_id)
        )
        await self.db.flush()

        for posicao, cafe_id in enumerate(cafe_ids_em_ordem, start=1):
            self.db.add(
                RankingPessoalItem(usuario_id=usuario_id, cafe_id=cafe_id, posicao=posicao)
            )

        await self.db.commit()

        usuario = await self.db.get(UsuarioModel, usuario_id)
        assert usuario is not None
        return await self._montar_resposta(usuario)
