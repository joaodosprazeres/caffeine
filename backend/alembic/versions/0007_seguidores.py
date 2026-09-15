"""seguidores

Revision ID: 0007_seguidores
Revises: 0006_opiniao_imagem_nota_autor
Create Date: 2026-09-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007_seguidores"
down_revision: Union[str, None] = "0006_opiniao_imagem_nota_autor"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "seguidores",
        sa.Column(
            "seguidor_id",
            sa.Uuid(),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "seguido_id",
            sa.Uuid(),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("seguidor_id <> seguido_id", name="ck_seguidores_nao_a_si_mesmo"),
    )
    op.create_index("ix_seguidores_seguido_id", "seguidores", ["seguido_id"])


def downgrade() -> None:
    op.drop_index("ix_seguidores_seguido_id", table_name="seguidores")
    op.drop_table("seguidores")
