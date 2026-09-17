import uuid

from fastapi import UploadFile
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.opiniao import Opiniao as OpiniaoModel
from src.models.seguidor import Seguidor as SeguidorModel
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.usuario import PerfilUsuario
from src.schemas.usuario import Usuario as UsuarioSchema
from src.schemas.usuario import UsuarioBusca
from src.services.armazenamento_service import ArmazenamentoService


class UsuarioNaoEncontradoError(Exception):
    pass


class NaoPodeSeguirASiMesmoError(Exception):
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
            avatar_url=usuario.avatar_url,
            created_at=usuario.created_at,
            total_opinioes=total_opinioes or 0,
        )

    async def salvar_avatar(
        self,
        usuario_id: uuid.UUID,
        arquivo: UploadFile,
        armazenamento: ArmazenamentoService,
    ) -> UsuarioSchema:
        usuario = await self.db.get(UsuarioModel, usuario_id)
        if usuario is None:
            raise UsuarioNaoEncontradoError

        avatar_anterior = usuario.avatar_url
        usuario.avatar_url = await armazenamento.salvar(arquivo, "avatars")
        await self.db.commit()
        await self.db.refresh(usuario)

        armazenamento.remover(avatar_anterior)

        return UsuarioSchema.model_validate(usuario)

    async def buscar(
        self,
        query: str,
        page: int,
        page_size: int,
        usuario_atual_id: uuid.UUID | None,
    ) -> tuple[list[UsuarioBusca], int]:
        filtro = f"%{query}%"
        condicao = or_(
            UsuarioModel.username.ilike(filtro),
            UsuarioModel.display_name.ilike(filtro),
        )

        total = await self.db.scalar(select(func.count(UsuarioModel.id)).where(condicao))
        usuarios = (
            await self.db.scalars(
                select(UsuarioModel)
                .where(condicao)
                .order_by(UsuarioModel.username)
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        ).all()

        seguidos_ids: set[uuid.UUID] = set()
        if usuario_atual_id is not None and usuarios:
            seguidos_ids = set(
                (
                    await self.db.scalars(
                        select(SeguidorModel.seguido_id).where(
                            SeguidorModel.seguidor_id == usuario_atual_id,
                            SeguidorModel.seguido_id.in_([usuario.id for usuario in usuarios]),
                        )
                    )
                ).all()
            )

        items = [
            UsuarioBusca(
                **UsuarioSchema.model_validate(usuario).model_dump(),
                ja_seguido=usuario.id in seguidos_ids,
            )
            for usuario in usuarios
        ]
        return items, total or 0

    async def seguir(self, seguidor_id: uuid.UUID, username_seguido: str) -> None:
        seguido = await self.db.scalar(
            select(UsuarioModel).where(UsuarioModel.username == username_seguido)
        )
        if seguido is None:
            raise UsuarioNaoEncontradoError
        if seguido.id == seguidor_id:
            raise NaoPodeSeguirASiMesmoError

        existente = await self.db.get(SeguidorModel, (seguidor_id, seguido.id))
        if existente is None:
            self.db.add(SeguidorModel(seguidor_id=seguidor_id, seguido_id=seguido.id))
            await self.db.commit()

    async def deixar_de_seguir(self, seguidor_id: uuid.UUID, username_seguido: str) -> None:
        seguido = await self.db.scalar(
            select(UsuarioModel).where(UsuarioModel.username == username_seguido)
        )
        if seguido is None:
            return

        await self.db.execute(
            delete(SeguidorModel).where(
                SeguidorModel.seguidor_id == seguidor_id,
                SeguidorModel.seguido_id == seguido.id,
            )
        )
        await self.db.commit()

    async def listar_seguidos(
        self, seguidor_id: uuid.UUID, page: int, page_size: int
    ) -> tuple[list[UsuarioSchema], int]:
        total = await self.db.scalar(
            select(func.count())
            .select_from(SeguidorModel)
            .where(SeguidorModel.seguidor_id == seguidor_id)
        )
        usuarios = (
            await self.db.scalars(
                select(UsuarioModel)
                .join(SeguidorModel, SeguidorModel.seguido_id == UsuarioModel.id)
                .where(SeguidorModel.seguidor_id == seguidor_id)
                .order_by(SeguidorModel.created_at.desc())
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        ).all()

        items = [UsuarioSchema.model_validate(usuario) for usuario in usuarios]
        return items, total or 0
