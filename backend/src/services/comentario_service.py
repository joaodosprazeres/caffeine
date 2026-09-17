import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.comentario import Comentario as ComentarioModel
from src.models.opiniao import Opiniao as OpiniaoModel
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.comentario import Comentario as ComentarioSchema
from src.schemas.comentario import ComentarioCreateRequest
from src.schemas.usuario import Usuario as UsuarioSchema


class OpiniaoNaoEncontradaError(Exception):
    pass


class AutorNaoPodeComentarPropriaOpiniaoError(Exception):
    pass


class ComentarioService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def comentar(
        self, opiniao_id: uuid.UUID, autor_id: uuid.UUID, dados: ComentarioCreateRequest
    ) -> ComentarioSchema:
        opiniao = await self.db.get(OpiniaoModel, opiniao_id)
        if opiniao is None:
            raise OpiniaoNaoEncontradaError

        if opiniao.autor_id == autor_id:
            raise AutorNaoPodeComentarPropriaOpiniaoError

        comentario = ComentarioModel(opiniao_id=opiniao_id, autor_id=autor_id, texto=dados.texto)
        self.db.add(comentario)
        await self.db.commit()
        await self.db.refresh(comentario)

        autor = await self.db.get(UsuarioModel, autor_id)
        assert autor is not None
        return ComentarioSchema(
            id=comentario.id,
            autor=UsuarioSchema.model_validate(autor),
            texto=comentario.texto,
            created_at=comentario.created_at,
        )

    async def listar_por_opiniao(self, opiniao_id: uuid.UUID) -> list[ComentarioSchema]:
        comentarios = (
            await self.db.scalars(
                select(ComentarioModel)
                .where(ComentarioModel.opiniao_id == opiniao_id)
                .order_by(ComentarioModel.created_at.asc())
            )
        ).all()

        resultado = []
        for comentario in comentarios:
            autor = await self.db.get(UsuarioModel, comentario.autor_id)
            assert autor is not None
            resultado.append(
                ComentarioSchema(
                    id=comentario.id,
                    autor=UsuarioSchema.model_validate(autor),
                    texto=comentario.texto,
                    created_at=comentario.created_at,
                )
            )
        return resultado
