import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from src.core.db import Base


class RankingPessoalItem(Base):
    __tablename__ = "ranking_pessoal_items"
    __table_args__ = (
        UniqueConstraint("usuario_id", "cafe_id", name="uq_ranking_usuario_cafe"),
        UniqueConstraint("usuario_id", "posicao", name="uq_ranking_usuario_posicao"),
        CheckConstraint("posicao >= 1", name="ck_ranking_posicao_positiva"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cafe_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cafes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    posicao: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
