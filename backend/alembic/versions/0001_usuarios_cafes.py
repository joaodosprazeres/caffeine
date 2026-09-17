"""usuarios e cafes

Revision ID: 0001_usuarios_cafes
Revises:
Create Date: 2026-09-07

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_usuarios_cafes"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=30), nullable=False),
        sa.Column("display_name", sa.String(length=80), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("bio", sa.String(length=280), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email", name="uq_usuarios_email"),
        sa.UniqueConstraint("username", name="uq_usuarios_username"),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"])
    op.create_index("ix_usuarios_username", "usuarios", ["username"])

    op.create_table(
        "cafes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("produtor", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("nome", "produtor", name="uq_cafes_nome_produtor"),
    )


def downgrade() -> None:
    op.drop_table("cafes")
    op.drop_index("ix_usuarios_username", table_name="usuarios")
    op.drop_index("ix_usuarios_email", table_name="usuarios")
    op.drop_table("usuarios")
