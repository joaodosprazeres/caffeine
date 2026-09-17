# Implementation Plan: Mini Rede Social de Opiniões sobre Cafés

**Branch**: `001-coffee-opinions-social` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-coffee-opinions-social/spec.md`

## Summary

Uma mini rede social onde usuários autenticados publicam opiniões estruturadas sobre cafés
(café, produtor, grão especial, torra + texto livre), reagem a opiniões de outros usuários com
comentários e notas (1–5), e organizam um ranking pessoal dos cafés que já experimentaram.
Visitantes não autenticados consultam livremente opiniões, perfis, o consolidado por café e um
ranking geral agregado. Frontend: SPA React 19 + TypeScript + Vite + TailwindCSS + react-router,
navegação 100% client-side (sem novas abas, sem reload completo). Backend: API REST em Python
com FastAPI + Pydantic + SQLAlchemy + Alembic sobre PostgreSQL, autenticação por e-mail/senha
com token JWT.

## Technical Context

**Language/Version**: Frontend: TypeScript 5.x (strict) sobre React 19; Backend: Python 3.12

**Primary Dependencies**:
- Frontend (runtime, todas autorizadas pela constituição v3.0.0): React 19, TypeScript, Vite,
  TailwindCSS, react-router, lucide-react (biblioteca de ícones única do projeto)
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2.x (engine assíncrono), Alembic; mais bibliotecas
  não travadas pela Regra V (framework web/ORM/migração) por não pertencerem a essas
  categorias: `bcrypt` (hash de senha) e `PyJWT` (token de sessão)

**Storage**: PostgreSQL 16 (via SQLAlchemy async + driver `asyncpg`)

**Testing**: Frontend: Vitest + React Testing Library (devDependencies, fora do teto de
dependências de runtime da Regra II — ver research.md #12); Backend: pytest + httpx
`AsyncClient` + pytest-asyncio

**Target Platform**: Frontend: navegador (SPA responsiva, 320px+); Backend: servidor Linux
containerizado expondo API HTTP

**Project Type**: web (frontend + backend detectados na spec e no stack informado)

**Performance Goals**: carregamento inicial < 2s em conexão 3G (SC-002); respostas de API com
p95 < 500ms (default razoável, sem meta explícita na spec)

**Constraints**: TypeScript strict sem `any` implícito; interface utilizável a partir de 320px;
contraste WCAG AA; `aria-label`/`alt` obrigatórios; navegação interna sem nova aba e sem reload
completo (react-router); dados estruturados JSON-LD nas páginas públicas; escrita
(publicar/comentar/notar/ranquear) exige autenticação, leitura permanece livre

**Scale/Scope**: rede social "mini" em fase inicial — assumido até ~10k usuários e dezenas de
milhares de opiniões/comentários/notas (ver research.md #16); 5 user stories (P1–P5), ~9
entidades/telas principais

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

Constituição avaliada: v3.0.0 (sem tensões conhecidas após as emendas de backend, TailwindCSS,
react-router e reescopo das Regras II/IV).

| Princípio / Regra | Requisito | Status | Notas |
|---|---|---|---|
| I. TypeScript Estrito e Componentes Funcionais | `strict: true`, zero `any` implícito, só componentes funcionais, props tipadas em `types.ts`, zero lógica de negócio em UI | PASS | Lógica de negócio/data-fetching vive em `hooks/` e `services/`; componentes de página/UI só renderizam |
| II. Arquitetura Config → Types → Components | `config.ts` só para conteúdo estático/apresentacional; dados dinâmicos via API; deps de runtime ⊆ {React, TypeScript, Vite, TailwindCSS, react-router, 1 lib de ícones} | PASS | `config.ts` guarda branding/textos institucionais/meta padrão; opiniões/comentários/notas/perfis/rankings vêm da API. Nenhuma dependência de runtime além da lista autorizada — ver research.md #12 sobre devDependencies não contarem para esse teto |
| III. Design Mobile-First e Acessível | 320px, tokens de `design-system.md` via `tailwind.config`, `aria-label`/`alt`/contraste AA | PASS | Compromisso de design a verificar por componente durante implementação (checklist de revisão da constituição) |
| IV. SEO Local e Estruturado | JSON-LD (`LocalBusiness`/`Review`/`AggregateRating`); meta tags estáticas de `config.ts`, dinâmicas da API | PASS | Páginas de café/usuário/opinião geram meta tags e JSON-LD a partir da resposta da API (ver data-model.md e contracts/) |
| V. Backend Tipado, Migrável e Sem Lógica em Rotas | Stack fixo Python/FastAPI/Pydantic/SQLAlchemy/Alembic; toda fronteira via Pydantic; toda mudança de schema via Alembic; rotas finas; acesso a dados só via SQLAlchemy | PASS | Rotas em `api/routers/` delegam para `services/`; schemas Pydantic em `schemas/`; `bcrypt`/`PyJWT` não são framework web/ORM/migração, logo não exigem emenda |
| Restrições Tecnológicas (frontend) | apenas React/TypeScript/Vite/TailwindCSS/react-router/1 lib de ícones | PASS | `lucide-react` escolhida como a lib de ícones única (research.md #4) |
| Restrições Tecnológicas (backend) | apenas Python/FastAPI/Pydantic/SQLAlchemy/Alembic para framework web/ORM/migração; frontend e backend não assumem responsabilidade um do outro | PASS | Comunicação via API HTTP consumida com `fetch` nativo (sem lib de HTTP client adicional) |

**Resultado**: nenhuma violação. Nenhuma linha em Complexity Tracking é necessária.

**Re-check pós-Phase 1**: revisado após gerar research.md, data-model.md, contracts/openapi.yaml
e quickstart.md — nenhuma decisão de design introduziu dependência, entidade ou endpoint fora do
que os princípios acima autorizam (ex.: sem `react-helmet`, sem cliente HTTP adicional, sem ORM
alternativo). Gate permanece PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-coffee-opinions-social/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py               # instância FastAPI, registro de routers
│   ├── core/
│   │   ├── config.py         # settings via env vars (DATABASE_URL, JWT_SECRET, ...)
│   │   ├── security.py       # hash de senha (bcrypt), emissão/validação de JWT
│   │   └── db.py             # engine assíncrono, session factory
│   ├── models/                # modelos SQLAlchemy (1 arquivo por entidade)
│   │   ├── usuario.py
│   │   ├── cafe.py
│   │   ├── opiniao.py
│   │   ├── comentario.py
│   │   ├── nota.py
│   │   └── ranking_pessoal.py
│   ├── schemas/                # modelos Pydantic de request/response
│   ├── services/                # lógica de negócio (auth, opinioes, ranking, ...)
│   └── api/
│       ├── deps.py              # dependências compartilhadas (sessão de DB, usuário atual)
│       └── routers/
│           ├── auth.py
│           ├── usuarios.py
│           ├── cafes.py
│           ├── opinioes.py
│           └── ranking.py
├── alembic/
│   ├── env.py
│   └── versions/
└── tests/
    ├── contract/                 # testes contra contracts/openapi.yaml
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # <BrowserRouter> + definição de rotas
│   ├── config.ts                   # conteúdo estático/apresentacional (Regra II)
│   ├── types.ts                     # contratos TS, incl. tipos de resposta da API
│   ├── pages/                        # componentes de rota (thin, sem lógica de negócio)
│   │   ├── RankingGeralPage.tsx      # também serve como home ("/")
│   │   ├── CafePage.tsx
│   │   ├── OpiniaoPage.tsx
│   │   ├── NovaOpiniaoPage.tsx
│   │   ├── PerfilPage.tsx
│   │   ├── MeuRankingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegistroPage.tsx
│   ├── components/                    # UI reutilizável
│   ├── hooks/                          # data-fetching e lógica (useOpiniao, useRankingGeral, ...)
│   ├── services/                        # api.ts (wrapper de fetch), authContext.tsx
│   └── styles/
│       └── tailwind.css
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Opção "Web application" (frontend + backend detectados). `backend/` e
`frontend/` são projetos irmãos na raiz do repositório, cada um com seu próprio stack fixo
conforme a Regra V e a Regra II/Restrições Tecnológicas da constituição — nenhum lado assume
responsabilidade do outro (comunicação só via API HTTP com `fetch` nativo).

## Complexity Tracking

> Constitution Check não encontrou violações — esta seção não se aplica.
