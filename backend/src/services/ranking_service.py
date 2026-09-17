from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.cafe import Cafe as CafeModel
from src.models.nota import Nota as NotaModel
from src.models.opiniao import Opiniao as OpiniaoModel
from src.models.ranking_pessoal import RankingPessoalItem
from src.schemas.ranking import RankingGeralEntry, RankingGeralResponse
from src.services.cafe_aggregates import build_cafe_response


class RankingService:
    """Calcula o ranking geral (research.md #8): combina média de notas de terceiros com o
    sinal de posição nos rankings pessoais dos usuários (Borda count), 50/50, ambos
    normalizados para 0-1."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _calcular_sinal_ranking_pessoal(self) -> dict:
        itens_por_usuario: dict = defaultdict(list)
        linhas = await self.db.execute(
            select(
                RankingPessoalItem.usuario_id,
                RankingPessoalItem.cafe_id,
                RankingPessoalItem.posicao,
            )
        )
        for usuario_id, cafe_id, posicao in linhas:
            itens_por_usuario[usuario_id].append((cafe_id, posicao))

        sinal_por_cafe: dict = defaultdict(float)
        for itens in itens_por_usuario.values():
            n = len(itens)
            for cafe_id, posicao in itens:
                sinal_por_cafe[cafe_id] += (n - posicao + 1) / n

        return sinal_por_cafe

    async def calcular_ranking_geral(self, page: int, page_size: int) -> RankingGeralResponse:
        cafes = (await self.db.scalars(select(CafeModel))).all()

        media_por_cafe: dict = {}
        total_notas_por_cafe: dict = {}
        linhas_nota = await self.db.execute(
            select(OpiniaoModel.cafe_id, func.avg(NotaModel.valor), func.count(NotaModel.id))
            .select_from(NotaModel)
            .join(OpiniaoModel, OpiniaoModel.id == NotaModel.opiniao_id)
            .group_by(OpiniaoModel.cafe_id)
        )
        for cafe_id, media, total in linhas_nota:
            media_por_cafe[cafe_id] = float(media)
            total_notas_por_cafe[cafe_id] = total

        sinal_por_cafe = await self._calcular_sinal_ranking_pessoal()
        max_sinal = max(sinal_por_cafe.values(), default=0.0)

        entradas: list[RankingGeralEntry] = []
        for cafe in cafes:
            nota_media = media_por_cafe.get(cafe.id)
            nota_normalizada = (nota_media - 1) / 4 if nota_media is not None else 0.0
            sinal_normalizado = (sinal_por_cafe.get(cafe.id, 0.0) / max_sinal) if max_sinal > 0 else 0.0
            score_final = 0.5 * nota_normalizada + 0.5 * sinal_normalizado

            cafe_schema = await build_cafe_response(self.db, cafe)
            entradas.append(
                RankingGeralEntry(
                    cafe=cafe_schema,
                    nota_media=nota_media,
                    total_notas=total_notas_por_cafe.get(cafe.id, 0),
                    score_final=score_final,
                )
            )

        entradas.sort(key=lambda entrada: entrada.score_final, reverse=True)

        total = len(entradas)
        inicio = (page - 1) * page_size
        pagina = entradas[inicio : inicio + page_size]

        return RankingGeralResponse(items=pagina, page=page, page_size=page_size, total=total)
