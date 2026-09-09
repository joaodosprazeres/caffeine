import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.cafe import Cafe as CafeModel
from src.models.opiniao import Opiniao as OpiniaoModel
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.opiniao import Opiniao as OpiniaoSchema
from src.schemas.opiniao import OpiniaoCreateRequest
from src.schemas.usuario import Usuario as UsuarioSchema
from src.services.cafe_aggregates import build_cafe_response, contar_notas_e_comentarios


class OpiniaoNaoEncontradaError(Exception):
    pass


class OpiniaoService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _buscar_ou_criar_cafe(self, nome: str, produtor: str) -> CafeModel:
        cafe = await self.db.scalar(
            select(CafeModel).where(CafeModel.nome == nome, CafeModel.produtor == produtor)
        )
        if cafe is None:
            cafe = CafeModel(nome=nome, produtor=produtor)
            self.db.add(cafe)
            await self.db.flush()
        return cafe

    async def _montar_resposta(self, opiniao: OpiniaoModel) -> OpiniaoSchema:
        autor = await self.db.get(UsuarioModel, opiniao.autor_id)
        cafe = await self.db.get(CafeModel, opiniao.cafe_id)
        assert autor is not None and cafe is not None

        cafe_schema = await build_cafe_response(self.db, cafe)
        nota_media, total_notas, total_comentarios = await contar_notas_e_comentarios(
            self.db, opiniao.id
        )

        return OpiniaoSchema(
            id=opiniao.id,
            autor=UsuarioSchema.model_validate(autor),
            cafe=cafe_schema,
            grao_especial=opiniao.grao_especial,
            torra=opiniao.torra,
            texto=opiniao.texto,
            nota_media=nota_media,
            total_notas=total_notas,
            total_comentarios=total_comentarios,
            created_at=opiniao.created_at,
        )

    async def criar(self, autor_id: uuid.UUID, dados: OpiniaoCreateRequest) -> OpiniaoSchema:
        cafe = await self._buscar_ou_criar_cafe(dados.cafe_nome, dados.cafe_produtor)

        opiniao = OpiniaoModel(
            autor_id=autor_id,
            cafe_id=cafe.id,
            grao_especial=dados.grao_especial,
            torra=dados.torra,
            texto=dados.texto,
        )
        self.db.add(opiniao)
        await self.db.commit()
        await self.db.refresh(opiniao)

        return await self._montar_resposta(opiniao)

    async def obter(self, opiniao_id: uuid.UUID) -> tuple[OpiniaoModel, OpiniaoSchema]:
        opiniao = await self.db.get(OpiniaoModel, opiniao_id)
        if opiniao is None:
            raise OpiniaoNaoEncontradaError
        return opiniao, await self._montar_resposta(opiniao)

    async def listar_por_usuario(
        self, username: str, page: int, page_size: int
    ) -> tuple[list[OpiniaoSchema], int] | None:
        usuario = await self.db.scalar(
            select(UsuarioModel).where(UsuarioModel.username == username)
        )
        if usuario is None:
            return None

        total = await self.db.scalar(
            select(func.count(OpiniaoModel.id)).where(OpiniaoModel.autor_id == usuario.id)
        )
        opinioes = (
            await self.db.scalars(
                select(OpiniaoModel)
                .where(OpiniaoModel.autor_id == usuario.id)
                .order_by(OpiniaoModel.created_at.desc())
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        ).all()

        items = [await self._montar_resposta(opiniao) for opiniao in opinioes]
        return items, total or 0
