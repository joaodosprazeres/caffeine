import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from src.core.db import Base


class Nota(Base):
    __tablename__ = "notas"
    __table_args__ = (
        UniqueConstraint("opiniao_id", "avaliador_id", name="uq_notas_opiniao_avaliador"),
        CheckConstraint("valor >= 1 AND valor <= 5", name="ck_notas_valor_1_5"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    opiniao_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("opinioes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    avaliador_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    valor: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
