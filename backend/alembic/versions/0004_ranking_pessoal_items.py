"""ranking_pessoal_items

Revision ID: 0004_ranking_pessoal_items
Revises: 0003_comentarios_notas
Create Date: 2026-09-07

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004_ranking_pessoal_items"
down_revision: Union[str, None] = "0003_comentarios_notas"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ranking_pessoal_items",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "usuario_id",
            sa.Uuid(),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "cafe_id", sa.Uuid(), sa.ForeignKey("cafes.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("posicao", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("usuario_id", "cafe_id", name="uq_ranking_usuario_cafe"),
        sa.UniqueConstraint("usuario_id", "posicao", name="uq_ranking_usuario_posicao"),
        sa.CheckConstraint("posicao >= 1", name="ck_ranking_posicao_positiva"),
    )
    op.create_index("ix_ranking_usuario_id", "ranking_pessoal_items", ["usuario_id"])
    op.create_index("ix_ranking_cafe_id", "ranking_pessoal_items", ["cafe_id"])


def downgrade() -> None:
    op.drop_index("ix_ranking_cafe_id", table_name="ranking_pessoal_items")
    op.drop_index("ix_ranking_usuario_id", table_name="ranking_pessoal_items")
    op.drop_table("ranking_pessoal_items")
