"""usuario avatar

Revision ID: 0005_usuario_avatar
Revises: 0004_ranking_pessoal_items
Create Date: 2026-09-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_usuario_avatar"
down_revision: Union[str, None] = "0004_ranking_pessoal_items"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("usuarios", sa.Column("avatar_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("usuarios", "avatar_url")
