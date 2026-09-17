from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import current_user, get_db
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.usuario import AuthResponse, LoginRequest, RegistroRequest
from src.schemas.usuario import Usuario as UsuarioSchema
from src.services.auth_service import (
    AuthService,
    CredenciaisInvalidasError,
    EmailOuUsernameJaExisteError,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/registro", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def registro(dados: RegistroRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    service = AuthService(db)
    try:
        token, usuario = await service.registrar(dados)
    except EmailOuUsernameJaExisteError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="email ou username já em uso"
        ) from exc

    return AuthResponse(access_token=token, usuario=UsuarioSchema.model_validate(usuario))


@router.post("/login", response_model=AuthResponse)
async def login(dados: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    service = AuthService(db)
    try:
        token, usuario = await service.autenticar(dados)
    except CredenciaisInvalidasError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="credenciais inválidas"
        ) from exc

    return AuthResponse(access_token=token, usuario=UsuarioSchema.model_validate(usuario))


@router.get("/me", response_model=UsuarioSchema)
async def me(usuario: UsuarioModel = Depends(current_user)) -> UsuarioSchema:
    return UsuarioSchema.model_validate(usuario)
