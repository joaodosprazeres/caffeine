"""comentarios e notas

Revision ID: 0003_comentarios_notas
Revises: 0002_opinioes
Create Date: 2026-09-07

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_comentarios_notas"
down_revision: Union[str, None] = "0002_opinioes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "comentarios",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "opiniao_id",
            sa.Uuid(),
            sa.ForeignKey("opinioes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "autor_id",
            sa.Uuid(),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("texto", sa.String(length=1000), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_comentarios_opiniao_id", "comentarios", ["opiniao_id"])
    op.create_index("ix_comentarios_autor_id", "comentarios", ["autor_id"])

    op.create_table(
        "notas",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "opiniao_id",
            sa.Uuid(),
            sa.ForeignKey("opinioes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "avaliador_id",
            sa.Uuid(),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("valor", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("opiniao_id", "avaliador_id", name="uq_notas_opiniao_avaliador"),
        sa.CheckConstraint("valor >= 1 AND valor <= 5", name="ck_notas_valor_1_5"),
    )
    op.create_index("ix_notas_opiniao_id", "notas", ["opiniao_id"])
    op.create_index("ix_notas_avaliador_id", "notas", ["avaliador_id"])


def downgrade() -> None:
    op.drop_index("ix_notas_avaliador_id", table_name="notas")
    op.drop_index("ix_notas_opiniao_id", table_name="notas")
    op.drop_table("notas")
    op.drop_index("ix_comentarios_autor_id", table_name="comentarios")
    op.drop_index("ix_comentarios_opiniao_id", table_name="comentarios")
    op.drop_table("comentarios")
