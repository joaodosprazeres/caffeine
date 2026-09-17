from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.core.db import async_session_factory
from src.core.security import InvalidTokenError, decode_access_token
from src.models.usuario import Usuario
from src.services.armazenamento_service import ArmazenamentoService

_bearer_scheme = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


def get_armazenamento_service() -> ArmazenamentoService:
    return ArmazenamentoService(get_settings())


async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="não autenticado")

    try:
        usuario_id = decode_access_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="token inválido"
        ) from exc

    usuario = await db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="não autenticado")

    return usuario


async def optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Usuario | None:
    if credentials is None:
        return None

    try:
        usuario_id = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        return None

    return await db.get(Usuario, usuario_id)
