"""Popula o banco com dados iniciais para desenvolvimento/testes manuais.

Uso:
    uv run python -m scripts.seed
    # ou, dentro do container:
    docker compose exec backend python -m scripts.seed

É idempotente: se o usuário "teste@caffeine.dev" já existir, o script não
faz nada.
"""

import asyncio

from sqlalchemy import select

from src.core.db import async_session_factory
from src.core.security import hash_password
from src.models.cafe import Cafe
from src.models.comentario import Comentario
from src.models.nota import Nota
from src.models.opiniao import Opiniao, Torra
from src.models.ranking_pessoal import RankingPessoalItem
from src.models.usuario import Usuario

USUARIOS = [
    {
        "email": "teste@caffeine.dev",
        "username": "usuario_teste",
        "display_name": "Usuário de Teste",
        "password": "teste1234",
        "bio": "Conta de teste para desenvolvimento local.",
    },
    {
        "email": "ana@caffeine.dev",
        "username": "ana_cafeina",
        "display_name": "Ana Cafeína",
        "password": "teste1234",
        "bio": "Apaixonada por cafés especiais.",
    },
    {
        "email": "bruno@caffeine.dev",
        "username": "bruno_barista",
        "display_name": "Bruno Barista",
        "password": "teste1234",
        "bio": "Barista e caçador de torras claras.",
    },
]

CAFES = [
    {"nome": "Sítio Boa Vista", "produtor": "Fazenda Boa Vista"},
    {"nome": "Cerrado Mineiro", "produtor": "Cooperativa Cerrado"},
    {"nome": "Mantiqueira de Minas", "produtor": "Fazenda Serra Azul"},
]


async def seed() -> None:
    async with async_session_factory() as db:
        ja_existe = await db.scalar(select(Usuario).where(Usuario.email == USUARIOS[0]["email"]))
        if ja_existe is not None:
            print("Seed já aplicado anteriormente, nada a fazer.")
            return

        usuarios = [
            Usuario(
                email=dados["email"],
                username=dados["username"],
                display_name=dados["display_name"],
                bio=dados["bio"],
                password_hash=hash_password(dados["password"]),
            )
            for dados in USUARIOS
        ]
        db.add_all(usuarios)

        cafes = [Cafe(nome=dados["nome"], produtor=dados["produtor"]) for dados in CAFES]
        db.add_all(cafes)

        await db.flush()

        opinioes = [
            Opiniao(
                autor_id=usuarios[0].id,
                cafe_id=cafes[0].id,
                grao_especial="Bourbon Amarelo",
                torra=Torra.media,
                texto="Doçura equilibrada com notas de caramelo e castanha.",
            ),
            Opiniao(
                autor_id=usuarios[1].id,
                cafe_id=cafes[1].id,
                grao_especial="Catuaí Vermelho",
                torra=Torra.escura,
                texto="Corpo encorpado, final amargo e persistente.",
            ),
            Opiniao(
                autor_id=usuarios[2].id,
                cafe_id=cafes[2].id,
                grao_especial="Geisha",
                torra=Torra.clara,
                texto="Acidez cítrica marcante, lembra chá floral.",
            ),
        ]
        db.add_all(opinioes)

        await db.flush()

        notas = [
            Nota(opiniao_id=opinioes[0].id, avaliador_id=usuarios[1].id, valor=5),
            Nota(opiniao_id=opinioes[0].id, avaliador_id=usuarios[2].id, valor=4),
            Nota(opiniao_id=opinioes[1].id, avaliador_id=usuarios[0].id, valor=3),
            Nota(opiniao_id=opinioes[2].id, avaliador_id=usuarios[0].id, valor=5),
        ]
        db.add_all(notas)

        comentarios = [
            Comentario(
                opiniao_id=opinioes[0].id,
                autor_id=usuarios[2].id,
                texto="Concordo, esse café é excelente para pós-almoço.",
            ),
            Comentario(
                opiniao_id=opinioes[2].id,
                autor_id=usuarios[1].id,
                texto="Geisha realmente surpreende, quero experimentar.",
            ),
        ]
        db.add_all(comentarios)

        ranking = [
            RankingPessoalItem(usuario_id=usuarios[0].id, cafe_id=cafes[2].id, posicao=1),
            RankingPessoalItem(usuario_id=usuarios[0].id, cafe_id=cafes[0].id, posicao=2),
            RankingPessoalItem(usuario_id=usuarios[0].id, cafe_id=cafes[1].id, posicao=3),
        ]
        db.add_all(ranking)

        await db.commit()

        print("Seed aplicado com sucesso.")
        print(f"Usuário de teste: {USUARIOS[0]['email']} / senha: {USUARIOS[0]['password']}")


if __name__ == "__main__":
    asyncio.run(seed())
