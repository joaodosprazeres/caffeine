import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column

from src.core.db import Base


class Seguidor(Base):
    __tablename__ = "seguidores"
    __table_args__ = (
        CheckConstraint("seguidor_id <> seguido_id", name="ck_seguidores_nao_a_si_mesmo"),
        Index("ix_seguidores_seguido_id", "seguido_id"),
    )

    seguidor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True
    )
    seguido_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
