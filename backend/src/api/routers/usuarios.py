from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import current_user, get_armazenamento_service, get_db, optional_current_user
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.ranking import RankingPessoalResponse, RankingPessoalUpdateRequest
from src.schemas.usuario import PerfilUsuario
from src.schemas.usuario import Usuario as UsuarioSchema
from src.schemas.usuario import UsuarioBuscaListaResponse, UsuarioListaResponse
from src.services.armazenamento_service import (
    ArmazenamentoService,
    ArquivoMuitoGrandeError,
    TipoArquivoInvalidoError,
)
from src.services.ranking_pessoal_service import (
    CafeSemOpiniaoDoUsuarioError,
    RankingPessoalService,
)
from src.services.usuario_service import (
    NaoPodeSeguirASiMesmoError,
    UsuarioNaoEncontradoError,
    UsuarioService,
)

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=UsuarioBuscaListaResponse)
async def buscar_usuarios(
    q: str = Query(..., min_length=1),
    page: int = 1,
    page_size: int = 20,
    usuario_atual: UsuarioModel | None = Depends(optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> UsuarioBuscaListaResponse:
    items, total = await UsuarioService(db).buscar(
        q, page, page_size, usuario_atual.id if usuario_atual else None
    )
    return UsuarioBuscaListaResponse(items=items, page=page, page_size=page_size, total=total)


@router.get("/me/seguidos", response_model=UsuarioListaResponse)
async def listar_meus_seguidos(
    page: int = 1,
    page_size: int = 20,
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> UsuarioListaResponse:
    items, total = await UsuarioService(db).listar_seguidos(usuario.id, page, page_size)
    return UsuarioListaResponse(items=items, page=page, page_size=page_size, total=total)


@router.post("/{username}/seguir", status_code=status.HTTP_204_NO_CONTENT)
async def seguir_usuario(
    username: str,
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    try:
        await UsuarioService(db).seguir(usuario.id, username)
    except UsuarioNaoEncontradoError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="usuário não encontrado"
        ) from exc
    except NaoPodeSeguirASiMesmoError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="não é possível seguir a si mesmo"
        ) from exc


@router.delete("/{username}/seguir", status_code=status.HTTP_204_NO_CONTENT)
async def deixar_de_seguir_usuario(
    username: str,
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await UsuarioService(db).deixar_de_seguir(usuario.id, username)


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


@router.post("/me/avatar", response_model=UsuarioSchema)
async def definir_avatar(
    arquivo: UploadFile = File(...),
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
    armazenamento: ArmazenamentoService = Depends(get_armazenamento_service),
) -> UsuarioSchema:
    try:
        return await UsuarioService(db).salvar_avatar(usuario.id, arquivo, armazenamento)
    except TipoArquivoInvalidoError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="tipo de arquivo não suportado (aceita apenas image/jpeg, image/png, image/webp)",
        ) from exc
    except ArquivoMuitoGrandeError as exc:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="arquivo excede o limite de tamanho permitido",
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
