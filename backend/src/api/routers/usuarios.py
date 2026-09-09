from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import current_user, get_db
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.ranking import RankingPessoalResponse, RankingPessoalUpdateRequest
from src.schemas.usuario import PerfilUsuario
from src.services.ranking_pessoal_service import (
    CafeSemOpiniaoDoUsuarioError,
    RankingPessoalService,
)
from src.services.usuario_service import UsuarioNaoEncontradoError, UsuarioService

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/{username}", response_model=PerfilUsuario)
async def obter_perfil_usuario(
    username: str, db: AsyncSession = Depends(get_db)
) -> PerfilUsuario:
    try:
        return await UsuarioService(db).obter_perfil_publico(username)
    except UsuarioNaoEncontradoError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="usuário não encontrado"
        ) from exc


@router.get("/{username}/ranking", response_model=RankingPessoalResponse)
async def obter_ranking_pessoal(
    username: str, db: AsyncSession = Depends(get_db)
) -> RankingPessoalResponse:
    resposta = await RankingPessoalService(db).obter_por_username(username)
    if resposta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="usuário não encontrado")
    return resposta


@router.put("/me/ranking", response_model=RankingPessoalResponse)
async def atualizar_ranking_pessoal(
    dados: RankingPessoalUpdateRequest,
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> RankingPessoalResponse:
    try:
        return await RankingPessoalService(db).atualizar(usuario.id, dados.cafe_ids_em_ordem)
    except CafeSemOpiniaoDoUsuarioError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"café {exc.cafe_id} não tem opinião prévia deste usuário",
        ) from exc
