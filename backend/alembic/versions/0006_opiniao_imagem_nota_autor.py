"""opiniao imagem embalagem e nota do autor

Revision ID: 0006_opiniao_imagem_nota_autor
Revises: 0005_usuario_avatar
Create Date: 2026-09-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0006_opiniao_imagem_nota_autor"
down_revision: Union[str, None] = "0005_usuario_avatar"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "opinioes", sa.Column("imagem_embalagem_url", sa.String(length=255), nullable=True)
    )
    op.add_column("opinioes", sa.Column("nota_autor", sa.Integer(), nullable=True))
    op.create_check_constraint(
        "ck_opinioes_nota_autor_1_5",
        "opinioes",
        "nota_autor IS NULL OR (nota_autor >= 1 AND nota_autor <= 5)",
    )


def downgrade() -> None:
    op.drop_constraint("ck_opinioes_nota_autor_1_5", "opinioes", type_="check")
    op.drop_column("opinioes", "nota_autor")
    op.drop_column("opinioes", "imagem_embalagem_url")
