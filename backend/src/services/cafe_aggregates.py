from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.cafe import Cafe as CafeModel
from src.models.comentario import Comentario as ComentarioModel
from src.models.nota import Nota as NotaModel
from src.models.opiniao import Opiniao as OpiniaoModel
from src.schemas.cafe import Cafe as CafeSchema


async def build_cafe_response(db: AsyncSession, cafe: CafeModel) -> CafeSchema:
    ultima_opiniao = await db.scalar(
        select(OpiniaoModel)
        .where(OpiniaoModel.cafe_id == cafe.id)
        .order_by(OpiniaoModel.created_at.desc())
        .limit(1)
    )
    total_opinioes = await db.scalar(
        select(func.count(OpiniaoModel.id)).where(OpiniaoModel.cafe_id == cafe.id)
    )
    nota_media, total_notas = (
        await db.execute(
            select(func.avg(NotaModel.valor), func.count(NotaModel.id))
            .select_from(NotaModel)
            .join(OpiniaoModel, OpiniaoModel.id == NotaModel.opiniao_id)
            .where(OpiniaoModel.cafe_id == cafe.id)
        )
    ).one()

    return CafeSchema(
        id=cafe.id,
        nome=cafe.nome,
        produtor=cafe.produtor,
        grao_especial_atual=ultima_opiniao.grao_especial if ultima_opiniao else None,
        torra_atual=ultima_opiniao.torra if ultima_opiniao else None,
        nota_media=float(nota_media) if nota_media is not None else None,
        total_opinioes=total_opinioes or 0,
        total_notas=total_notas or 0,
    )


async def contar_notas_e_comentarios(db: AsyncSession, opiniao_id) -> tuple[float | None, int, int]:
    nota_media, total_notas = (
        await db.execute(
            select(func.avg(NotaModel.valor), func.count(NotaModel.id)).where(
                NotaModel.opiniao_id == opiniao_id
            )
        )
    ).one()
    total_comentarios = await db.scalar(
        select(func.count(ComentarioModel.id)).where(ComentarioModel.opiniao_id == opiniao_id)
    )
    return (float(nota_media) if nota_media is not None else None, total_notas or 0, total_comentarios or 0)
