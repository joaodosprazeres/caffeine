"""opinioes

Revision ID: 0002_opinioes
Revises: 0001_usuarios_cafes
Create Date: 2026-09-07

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_opinioes"
down_revision: Union[str, None] = "0001_usuarios_cafes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "opinioes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "autor_id",
            sa.Uuid(),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "cafe_id", sa.Uuid(), sa.ForeignKey("cafes.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("grao_especial", sa.String(length=120), nullable=False),
        sa.Column("torra", sa.String(length=10), nullable=False),
        sa.Column("texto", sa.String(length=2000), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_opinioes_autor_id", "opinioes", ["autor_id"])
    op.create_index("ix_opinioes_cafe_id", "opinioes", ["cafe_id"])


def downgrade() -> None:
    op.drop_index("ix_opinioes_cafe_id", table_name="opinioes")
    op.drop_index("ix_opinioes_autor_id", table_name="opinioes")
    op.drop_table("opinioes")
