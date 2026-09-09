from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.opiniao import Opiniao as OpiniaoModel
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.usuario import PerfilUsuario


class UsuarioNaoEncontradoError(Exception):
    pass


class UsuarioService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def obter_perfil_publico(self, username: str) -> PerfilUsuario:
        usuario = await self.db.scalar(
            select(UsuarioModel).where(UsuarioModel.username == username)
        )
        if usuario is None:
            raise UsuarioNaoEncontradoError

        total_opinioes = await self.db.scalar(
            select(func.count(OpiniaoModel.id)).where(OpiniaoModel.autor_id == usuario.id)
        )

        return PerfilUsuario(
            id=usuario.id,
            username=usuario.username,
            display_name=usuario.display_name,
            bio=usuario.bio,
            created_at=usuario.created_at,
            total_opinioes=total_opinioes or 0,
        )
