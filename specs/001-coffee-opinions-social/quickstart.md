# Quickstart: Mini Rede Social de Opiniões sobre Cafés

Guia para rodar o feature end-to-end localmente e validar manualmente cada user story de
spec.md. Detalhes de schema/endpoints em [data-model.md](./data-model.md) e
[contracts/openapi.yaml](./contracts/openapi.yaml); passos de implementação ficam em
`tasks.md` (gerado por `/speckit-tasks`), não aqui.

## Opção A — Docker Compose (recomendado)

Sobe frontend, backend e PostgreSQL juntos, com as migrations do Alembic aplicadas
automaticamente pelo container do backend.

Pré-requisito: Docker + Docker Compose v2.

```bash
cp .env.example .env   # ajuste POSTGRES_*, JWT_SECRET, CORS_ALLOW_ORIGINS, VITE_API_BASE_URL se necessário
docker compose up --build
```

Popular o banco com usuários/cafés/opiniões de teste (idempotente — não faz nada se o seed já
tiver sido aplicado):

```bash
docker compose exec backend python -m scripts.seed
```

- Backend: `http://localhost:8000` (rotas em `/api/...`)
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432` (útil para inspecionar com `psql`/DBeaver)

Validação: `curl http://localhost:8000/api/ranking-geral` MUST retornar `200` com
`{"items": [], "page": 1, "page_size": 20, "total": 0}` em um banco recém-criado; abrir
`http://localhost:5173` MUST carregar a página inicial (ranking geral vazio) sem erros no
console.

Para parar e remover os containers: `docker compose down` (adicione `-v` para também apagar o
volume do banco e recomeçar do zero).

> Nota: como o frontend é uma SPA estática, `VITE_API_BASE_URL` é embutida no bundle em tempo
> de build (`docker compose build`), não em runtime — se mudar essa variável no `.env`, rode
> `docker compose up --build` novamente para que o frontend seja reconstruído.

## Opção B — Execução manual (sem Docker)

Útil para hot-reload de backend/frontend durante o desenvolvimento.

### Pré-requisitos

- Node.js 20+ e um gerenciador de pacotes (npm/pnpm)
- Python 3.12+ com [`uv`](https://docs.astral.sh/uv/) instalado
- PostgreSQL 16 acessível localmente (ex.: via Docker: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16`)

### Setup — Backend

```bash
cd backend
uv sync
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/caffeine"
export JWT_SECRET="dev-only-secret-troque-em-producao"
uv run alembic upgrade head
uv run uvicorn src.main:app --reload --port 8000
```

Validação: `curl http://localhost:8000/api/ranking-geral` MUST retornar `200` com
`{"items": [], "page": 1, "page_size": 20, "total": 0}` em um banco recém-migrado.

### Setup — Frontend

```bash
cd frontend
npm install
export VITE_API_BASE_URL="http://localhost:8000/api"
npm run dev
```

Validação: abrir `http://localhost:5173` MUST carregar a página inicial (ranking geral vazio)
sem erros no console e sem erros de TypeScript no terminal do Vite.

## Cenários de validação por user story

### US1 — Usuário publica uma opinião (P1)

1. `POST /api/auth/registro` com um e-mail/username novos → 201, retorna `access_token`.
2. Com o token, `POST /api/opinioes` informando `cafe_nome`, `cafe_produtor`,
   `grao_especial`, `torra`, `texto` → 201.
3. `GET /api/usuarios/{username}/opinioes` (sem token) MUST listar a opinião criada.
4. Repetir o passo 2 omitindo `texto` → MUST retornar 400/422 (FR-007).

**Critério de sucesso**: opinião aparece publicamente sem exigir novo login do visitante.

### US2 — Outro usuário comenta e dá nota (P2)

1. Registrar um segundo usuário (Usuário B).
2. Com o token de B, `POST /api/opinioes/{opiniao_id}/comentarios` na opinião do Usuário A →
   201.
3. Com o token de B, `PUT /api/opinioes/{opiniao_id}/nota` com `{"valor": 5}` → 200.
4. Repetir o passo 3 com `{"valor": 3}` → 200, e `GET /api/opinioes/{opiniao_id}` MUST mostrar
   `nota_media` refletindo só a última nota de B (substituição, FR-013), não duas notas.
5. Com o token do próprio autor (Usuário A) tentando comentar/notar a própria opinião →
   MUST retornar 403 (FR-012).

**Critério de sucesso**: nota duplicada nunca aparece; autor nunca consegue notar/comentar a
própria opinião.

### US3 — Visitante descobre os cafés mais bem avaliados (P3)

1. Com pelo menos uma Opiniao + uma Nota registradas (US1+US2), `GET /api/ranking-geral` (sem
   token) MUST listar o café com `score_final > 0`.
2. `GET /api/cafes/{cafe_id}` (sem token) MUST mostrar o consolidado com todas as opiniões
   daquele café.

**Critério de sucesso**: os dois endpoints respondem sem autenticação e refletem os dados de
US1/US2.

### US4 — Usuário organiza seu ranking pessoal (P4)

1. Com o token do Usuário A (que já tem ≥2 opiniões sobre cafés distintos — repetir passo 2 de
   US1 para um segundo café), `PUT /api/usuarios/me/ranking` com `cafe_ids_em_ordem` contendo
   os dois `cafe_id` → 200.
2. `GET /api/usuarios/{username}/ranking` (sem token) MUST refletir a ordem enviada.
3. Tentar incluir um `cafe_id` sobre o qual o usuário nunca opinou → MUST retornar 400 (regra
   "só cafés já opinados", FR-008).

**Critério de sucesso**: ordem enviada é preservada; café sem opinião prévia é rejeitado.

### US5 — Visitante consulta o perfil de um usuário (P5)

1. `GET /api/usuarios/{username}` (sem token) MUST retornar o perfil público.
2. `GET /api/usuarios/{username}/opinioes` e `GET /api/usuarios/{username}/ranking` (sem token)
   MUST retornar as opiniões e o ranking configurados nos cenários anteriores.

**Critério de sucesso**: nenhuma chamada de leitura acima exige `Authorization` header.

## Validação dos critérios de aceitação transversais

- **Navegação sem nova aba/reload** (FR-017): no frontend rodando (`npm run dev`), navegar
  entre Home → perfil de usuário → página de café → ranking geral usando os links da UI; MUST
  permanecer na mesma aba, sem um reload completo perceptível (verificar na aba Network do
  devtools que não há um novo request de documento HTML a cada navegação).
- **320px** (FR-018/SC-003): redimensionar a janela do navegador (ou emulador de dispositivo)
  para 320px de largura em cada página listada acima; MUST permanecer utilizável, sem conteúdo
  cortado ou sobreposto.
- **TypeScript strict** (SC-006): `cd frontend && npx tsc --noEmit` MUST terminar sem erros.
- **3G / <2s** (SC-002): usar o throttling "Slow 3G" do Chrome DevTools na página inicial; MUST
  ficar visível e interativa em menos de 2 segundos.
