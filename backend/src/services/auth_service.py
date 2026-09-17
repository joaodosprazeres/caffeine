from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import create_access_token, hash_password, verify_password
from src.models.usuario import Usuario
from src.schemas.usuario import LoginRequest, RegistroRequest


class EmailOuUsernameJaExisteError(Exception):
    pass


class CredenciaisInvalidasError(Exception):
    pass


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def registrar(self, dados: RegistroRequest) -> tuple[str, Usuario]:
        existente = await self.db.scalar(
            select(Usuario).where(
                (Usuario.email == dados.email) | (Usuario.username == dados.username)
            )
        )
        if existente is not None:
            raise EmailOuUsernameJaExisteError

        usuario = Usuario(
            email=dados.email,
            username=dados.username,
            display_name=dados.display_name,
            password_hash=hash_password(dados.password),
        )
        self.db.add(usuario)
        await self.db.commit()
        await self.db.refresh(usuario)

        token = create_access_token(usuario.id)
        return token, usuario

    async def autenticar(self, dados: LoginRequest) -> tuple[str, Usuario]:
        usuario = await self.db.scalar(select(Usuario).where(Usuario.email == dados.email))
        if usuario is None or not verify_password(dados.password, usuario.password_hash):
            raise CredenciaisInvalidasError

        token = create_access_token(usuario.id)
        return token, usuario
