import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from src.core.db import Base


class Torra(str, enum.Enum):
    clara = "clara"
    media = "media"
    escura = "escura"


class Opiniao(Base):
    __tablename__ = "opinioes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    autor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cafe_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cafes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    grao_especial: Mapped[str] = mapped_column(String(120), nullable=False)
    torra: Mapped[Torra] = mapped_column(
        Enum(Torra, name="torra_enum", native_enum=False, length=10), nullable=False
    )
    texto: Mapped[str] = mapped_column(String(2000), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
