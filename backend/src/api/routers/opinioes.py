import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import current_user, get_db, optional_current_user
from src.models.usuario import Usuario as UsuarioModel
from src.schemas.comentario import Comentario, ComentarioCreateRequest
from src.schemas.nota import Nota, NotaUpsertRequest
from src.schemas.opiniao import Opiniao, OpiniaoCreateRequest, OpiniaoDetalhe, OpiniaoListaResponse
from src.services.comentario_service import (
    AutorNaoPodeComentarPropriaOpiniaoError,
    ComentarioService,
)
from src.services.comentario_service import OpiniaoNaoEncontradaError as ComentarioOpiniaoNaoEncontradaError
from src.services.nota_service import AutorNaoPodeNotarPropriaOpiniaoError, NotaService
from src.services.nota_service import OpiniaoNaoEncontradaError as NotaOpiniaoNaoEncontradaError
from src.services.opiniao_service import OpiniaoNaoEncontradaError, OpiniaoService

router = APIRouter(tags=["opinioes"])


@router.post("/opinioes", response_model=Opiniao, status_code=status.HTTP_201_CREATED)
async def publicar_opiniao(
    dados: OpiniaoCreateRequest,
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> Opiniao:
    service = OpiniaoService(db)
    return await service.criar(usuario.id, dados)


@router.get("/opinioes/{opiniao_id}", response_model=OpiniaoDetalhe)
async def obter_opiniao(
    opiniao_id: uuid.UUID,
    usuario_atual: UsuarioModel | None = Depends(optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> OpiniaoDetalhe:
    service = OpiniaoService(db)
    try:
        _, opiniao = await service.obter(opiniao_id)
    except OpiniaoNaoEncontradaError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="opinião não encontrada"
        ) from exc

    comentarios = await ComentarioService(db).listar_por_opiniao(opiniao_id)

    nota_do_usuario_atual = None
    if usuario_atual is not None:
        nota_do_usuario_atual = await NotaService(db).obter_nota_do_usuario(
            opiniao_id, usuario_atual.id
        )

    return OpiniaoDetalhe(
        **opiniao.model_dump(),
        comentarios=comentarios,
        nota_do_usuario_atual=nota_do_usuario_atual,
    )


@router.get("/usuarios/{username}/opinioes", response_model=OpiniaoListaResponse)
async def listar_opinioes_de_usuario(
    username: str,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
) -> OpiniaoListaResponse:
    service = OpiniaoService(db)
    resultado = await service.listar_por_usuario(username, page, page_size)
    if resultado is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="usuário não encontrado")

    items, total = resultado
    return OpiniaoListaResponse(items=items, page=page, page_size=page_size, total=total)


@router.post(
    "/opinioes/{opiniao_id}/comentarios",
    response_model=Comentario,
    status_code=status.HTTP_201_CREATED,
)
async def comentar_opiniao(
    opiniao_id: uuid.UUID,
    dados: ComentarioCreateRequest,
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> Comentario:
    service = ComentarioService(db)
    try:
        return await service.comentar(opiniao_id, usuario.id, dados)
    except ComentarioOpiniaoNaoEncontradaError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="opinião não encontrada"
        ) from exc
    except AutorNaoPodeComentarPropriaOpiniaoError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="autor não pode comentar na própria opinião",
        ) from exc


@router.put("/opinioes/{opiniao_id}/nota", response_model=Nota)
async def dar_ou_atualizar_nota(
    opiniao_id: uuid.UUID,
    dados: NotaUpsertRequest,
    usuario: UsuarioModel = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> Nota:
    service = NotaService(db)
    try:
        return await service.dar_ou_atualizar_nota(opiniao_id, usuario.id, dados)
    except NotaOpiniaoNaoEncontradaError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="opinião não encontrada"
        ) from exc
    except AutorNaoPodeNotarPropriaOpiniaoError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="autor não pode notar a própria opinião"
        ) from exc
