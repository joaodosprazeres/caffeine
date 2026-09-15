# Implementation Plan: Perfil Social Visual e Rede de Seguidores

**Branch**: `002-perfil-social-visual` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-perfil-social-visual/spec.md`

## Summary

Evolução visual e social do perfil do Caffeine: identidade visual com tema café (grãos, xícara),
capa padrão da aplicação (asset estático do frontend, sem custo de backend), avatar do usuário
(upload próprio, persistido no backend), lista rolável das opiniões do dono do perfil (reuso do
endpoint de listagem paginada já existente), anexo opcional de foto da embalagem do café e nota
opcional do autor no cadastro da opinião, e uma relação de "seguir" entre usuários com busca,
listagem de seguidos e navegação para perfis de terceiros. Login passa a redirecionar para o
próprio perfil; publicar opinião passa a redirecionar de volta a ele.

## Technical Context

**Language/Version**: Frontend: TypeScript 5.x (strict) sobre React 19; Backend: Python 3.12
(mesma base de 001-coffee-opinions-social — nenhuma mudança de linguagem/versão)

**Primary Dependencies**:
- Frontend: React 19, TypeScript, Vite, TailwindCSS, react-router, `lucide-react` (já adotada) —
  nenhuma dependência nova de runtime
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2.x (async), Alembic, `bcrypt`, `PyJWT` (já
  autorizadas em 001) — upload/serving de arquivo usa `UploadFile`/`StaticFiles`, que já vêm com
  FastAPI/Starlette (não são dependência adicional); nenhuma biblioteca nova de framework
  web/ORM/migração é introduzida

**Storage**: PostgreSQL 16 (mesma instância) para dados relacionais (avatar/imagem armazenados
como caminho/URL, nunca como blob no banco); arquivos de imagem (avatar e foto de embalagem) em
disco local do container `backend`, num diretório dedicado montado como volume Docker nomeado
(persistente entre reinícios, análogo ao volume já existente `db_data`), servido como estático
pela própria API sob o prefixo `/api/media/`

**Testing**: Frontend: Vitest + React Testing Library; Backend: pytest + httpx `AsyncClient` +
pytest-asyncio (mesmo setup de 001)

**Target Platform**: Frontend: navegador (SPA responsiva, 320px+); Backend: servidor Linux
containerizado expondo API HTTP (mesmo docker-compose, com um volume adicional)

**Project Type**: web (frontend + backend, mesma estrutura de 001-coffee-opinions-social)

**Performance Goals**: mantém SC-002 de 001 (carregamento < 2s em 3G); imagens enviadas por
usuário MUST ser limitadas em tamanho (ver Constraints) para não comprometer essa meta

**Constraints**: além das já vigentes em 001 (TS strict, 320px+, WCAG AA, aria-label/alt,
navegação client-side via react-router, JSON-LD/meta tags dinâmicas via API): upload de imagem
(avatar e foto de embalagem) limitado a `image/jpeg`, `image/png` e `image/webp`, até 5MB por
arquivo, validado tanto no cliente (feedback imediato) quanto no servidor (fonte da verdade); nota
do autor (1–5, mesma escala de `NotaSelector`) é exibida junto à opinião mas **MUST NOT** ser
somada/contabilizada no cálculo de `nota_media`/`total_notas` do café (FR-021); autor continua
impedido de dar nota de terceiro na própria opinião (regra herdada de 001, inalterada)

**Scale/Scope**: mesma escala de 001 (~10k usuários); adiciona 1 nova entidade (`Seguidor`), 2
colunas em `Usuario`/`Opiniao` cada, ~7 endpoints novos/alterados, 1 página nova (busca de
usuários), 1 componente de navegação global, redesenho visual de `PerfilPage`, `OpiniaoForm`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

Constituição avaliada: v3.0.0 (mesma versão de 001, sem emendas necessárias).

| Princípio / Regra | Requisito | Status | Notas |
|---|---|---|---|
| I. TypeScript Estrito e Componentes Funcionais | `strict`, zero `any`, componentes funcionais, props tipadas em `types.ts`, zero lógica de negócio em UI | PASS | Upload de arquivo e busca de usuários ganham hooks dedicados (`useAvatarUpload`, `useBuscaUsuarios`, `useSeguidores`); componentes de página só renderizam |
| II. Arquitetura Config → Types → Components | `config.ts` só estático/apresentacional; dados dinâmicos via API; deps de runtime ⊆ lista autorizada | PASS | A imagem de capa padrão é um asset estático de branding (`config.ts`/`public/`), coerente com a Regra II — não é dado de domínio dinâmico. Avatar, foto de opinião e seguidores são dados de usuário e vêm da API. Nenhuma dependência nova de runtime |
| III. Design Mobile-First e Acessível | 320px, tokens de `design-system.md`, `aria-label`/`alt`/contraste AA | PASS | Novo componente de navegação e cards de opinião com thumbnail seguem os mesmos tokens; inputs de arquivo têm `aria-label`; imagens (avatar, capa, thumbnail) têm `alt` descritivo |
| IV. SEO Local e Estruturado | JSON-LD e meta tags dinâmicas via API em páginas de café/usuário/opinião | PASS | `PerfilPage` passa a incluir `avatar_url` no JSON-LD `Person`/meta Open Graph, vindo da API; nenhuma mudança na fonte de metadados estáticos |
| V. Backend Tipado, Migrável e Sem Lógica em Rotas | stack fixo; fronteiras via Pydantic; toda mudança de schema via Alembic; rotas finas; acesso a dados só via SQLAlchemy | PASS | Novo modelo `Seguidor` e colunas novas via migração Alembic; `usuario_service`/`opiniao_service` ganham métodos (`seguir`, `deixar_de_seguir`, `buscar`, `salvar_avatar`); rotas apenas validam e delegam; upload de arquivo tratado por um `ArmazenamentoService` dedicado (não lógica em rota) |
| Restrições Tecnológicas (frontend) | só React/TS/Vite/Tailwind/react-router/1 lib de ícones | PASS | Ícones novos (upload, seguir, buscar, logoff) vêm de `lucide-react`, já adotada |
| Restrições Tecnológicas (backend) | só Python/FastAPI/Pydantic/SQLAlchemy/Alembic para framework/ORM/migração | PASS | `StaticFiles`/`UploadFile` são parte do Starlette (dependência transitiva já existente do FastAPI), não uma nova biblioteca de framework/ORM/migração |

**Resultado**: nenhuma violação. Nenhuma linha em Complexity Tracking é necessária.

**Re-check pós-Phase 1**: revisado após gerar research.md, data-model.md, contracts/openapi.yaml
e quickstart.md — a decisão de servir arquivos como estático via Starlette e persistir em volume
Docker nomeado não introduz dependência nova nem contorna a Regra V (mudança de schema via
Alembic, acesso via SQLAlchemy). Gate permanece PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-perfil-social-visual/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── openapi.yaml     # Delta sobre specs/001-coffee-opinions-social/contracts/openapi.yaml
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── core/
│   │   └── config.py               # + settings de armazenamento (diretório de uploads, limite de tamanho)
│   ├── models/
│   │   ├── usuario.py              # + avatar_url
│   │   ├── opiniao.py              # + imagem_embalagem_url, nota_autor
│   │   └── seguidor.py             # NOVO: relação seguidor_id / seguido_id
│   ├── schemas/
│   │   ├── usuario.py              # + avatar_url em Usuario/PerfilUsuario; + UsuarioBusca
│   │   ├── opiniao.py              # + imagem_embalagem_url, nota_autor em Opiniao
│   │   └── seguidor.py             # NOVO: SeguidorResponse, SeguidosListaResponse
│   ├── services/
│   │   ├── usuario_service.py      # + seguir, deixar_de_seguir, listar_seguidos, buscar, salvar_avatar
│   │   ├── opiniao_service.py      # + suporte a imagem/nota_autor na criação
│   │   └── armazenamento_service.py # NOVO: validação de tipo/tamanho + persistência em disco
│   └── api/routers/
│       ├── usuarios.py             # + POST/DELETE seguir, GET seguidos, GET busca, POST avatar
│       └── opinioes.py             # criação passa a aceitar multipart/form-data
├── alembic/versions/                # NOVA migração: seguidores + colunas novas
└── tests/                           # contract/integration/unit cobrindo os itens acima

frontend/
├── public/
│   └── capa-perfil-padrao.svg       # NOVO: asset estático de capa (tema café), servido pelo Vite
├── src/
│   ├── config.ts                    # + referência ao asset de capa padrão
│   ├── types.ts                     # + avatar_url, imagem_embalagem_url, nota_autor, tipos de Seguidor/Busca
│   ├── components/
│   │   ├── NavegacaoPrincipal.tsx   # NOVO: nav global (perfil, ranking, sair) com ícones lucide-react
│   │   ├── AvatarUsuario.tsx        # NOVO: avatar com placeholder tema café
│   │   ├── OpiniaoCard.tsx          # NOVO: card de opinião com thumbnail, reusado no perfil
│   │   ├── OpiniaoForm.tsx          # + input de arquivo (embalagem) + NotaSelector (nota do autor)
│   │   └── UsuarioBuscaResultado.tsx # NOVO: item de resultado de busca com botão seguir/deixar de seguir
│   ├── pages/
│   │   ├── PerfilPage.tsx           # redesenho: capa, avatar, lista rolável, link para seguidos/busca
│   │   ├── BuscaUsuariosPage.tsx    # NOVO
│   │   ├── SeguidosPage.tsx         # NOVO
│   │   ├── LoginPage.tsx            # redireciona para /u/:username após login
│   │   └── NovaOpiniaoPage.tsx      # redireciona para /u/:username após publicar
│   ├── hooks/
│   │   ├── useAvatarUpload.ts       # NOVO
│   │   ├── useBuscaUsuarios.ts      # NOVO
│   │   ├── useSeguidores.ts         # NOVO (seguir/deixar de seguir/listar)
│   │   └── useCriarOpiniao.ts       # + envio multipart quando há imagem
│   └── services/
│       └── api.ts                   # + apiFetchMultipart para upload
└── tests/                           # unit/integration cobrindo os itens acima
```

**Structure Decision**: Mantém a mesma estrutura "web application" (frontend + backend irmãos) de
001-coffee-opinions-social — esta feature estende os mesmos diretórios em vez de criar novos
projetos. Nenhum lado assume responsabilidade do outro: uploads são recebidos, validados e
servidos exclusivamente pelo backend; o frontend apenas envia `FormData` e exibe as URLs
retornadas pela API.

## Complexity Tracking

> Constitution Check não encontrou violações — esta seção não se aplica.
