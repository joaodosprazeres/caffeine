# Tasks: Mini Rede Social de Opiniões sobre Cafés

**Input**: Design documents from `/specs/001-coffee-opinions-social/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml),
[quickstart.md](./quickstart.md)

**Tests**: nenhum teste automatizado foi pedido explicitamente na spec, então nenhuma tarefa de
teste (contract/integration/unit) foi gerada. O ferramental de teste (Vitest/pytest) é apenas
instalado no Setup, para uso posterior se o time decidir escrever testes.

**Organization**: tarefas agrupadas por user story (P1–P5 de spec.md) para permitir
implementação e teste independentes de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: a qual user story a tarefa pertence (US1–US5)
- Caminhos de arquivo exatos em cada descrição, conforme a estrutura de plan.md

## Path Conventions

Web app conforme plan.md § Project Structure: `backend/src/`, `backend/alembic/`,
`frontend/src/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicialização dos dois projetos (backend/frontend) e ferramental básico

- [X] T001 Create backend project structure (backend/src/core/, backend/src/models/,
      backend/src/schemas/, backend/src/services/, backend/src/api/routers/,
      backend/alembic/versions/, backend/tests/{contract,integration,unit}/) per plan.md
- [X] T002 Create frontend project structure (frontend/src/{pages,components,hooks,services,styles}/,
      frontend/tests/{unit,integration}/) per plan.md
- [X] T003 [P] Initialize backend Python project in backend/pyproject.toml with FastAPI,
      Pydantic v2, SQLAlchemy[asyncio], Alembic, asyncpg, bcrypt, PyJWT, uvicorn as runtime
      deps and pytest, httpx, pytest-asyncio, ruff, black as dev deps (research.md #1, #3, #7, #13)
- [X] T004 [P] Initialize frontend project in frontend/package.json with react@19, react-dom@19,
      typescript, vite, tailwindcss, react-router, lucide-react as runtime deps and vitest,
      @testing-library/react, jsdom, eslint, prettier as devDependencies (research.md #4, #5, #12, #13)
- [X] T005 [P] Configure frontend/tsconfig.json with `strict: true` and no implicit `any`
      (Constitution Principle I)
- [X] T006 [P] Configure frontend/tailwind.config.ts to source colors/typography/spacing from
      design-system.md tokens (Constitution Principle III / Restrições Tecnológicas)
- [X] T007 [P] Configure backend linting/formatting (ruff + black) in backend/pyproject.toml
- [X] T008 [P] Configure frontend/.eslintrc.cjs and frontend/.prettierrc
- [X] T009 Create backend environment settings loader (DATABASE_URL, JWT_SECRET, etc.) in
      backend/src/core/config.py
- [X] T010 Configure Alembic scaffolding wired to backend/src/core/config.py and the SQLAlchemy
      Base metadata in backend/alembic/env.py (depends on T009)

**Checkpoint**: os dois projetos instalam e rodam vazios (`uvicorn` sobe, `vite dev` sobe)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: autenticação, identidade de Usuario/Cafe e esqueleto de app — infraestrutura que
TODA user story depende (inclusive US1, já que publicar opinião exige estar autenticado)

**⚠️ CRITICAL**: nenhuma user story pode começar antes desta fase estar completa

- [X] T011 [P] Create SQLAlchemy declarative Base + async engine/session factory in
      backend/src/core/db.py (depends on T009)
- [X] T012 [P] Implement password hashing (bcrypt) and JWT issuing/validation in
      backend/src/core/security.py (research.md #7)
- [X] T013 [P] Create Usuario SQLAlchemy model in backend/src/models/usuario.py (data-model.md
      § Usuario) (depends on T011)
- [X] T014 [P] Create Cafe SQLAlchemy model in backend/src/models/cafe.py (data-model.md § Cafe,
      incl. `UNIQUE(nome, produtor)`) (depends on T011)
- [X] T015 Generate initial Alembic migration for tabelas `usuarios` e `cafes` in
      backend/alembic/versions/ (depends on T013, T014)
- [X] T016 [P] Create Usuario Pydantic schemas (RegistroRequest, LoginRequest, AuthResponse,
      Usuario, PerfilUsuario) in backend/src/schemas/usuario.py per contracts/openapi.yaml
- [X] T017 [P] Create Cafe Pydantic schemas (Cafe, CafeListaResponse) in
      backend/src/schemas/cafe.py per contracts/openapi.yaml
- [X] T018 Implement AuthService (registrar, autenticar) in
      backend/src/services/auth_service.py (depends on T012, T013, T016)
- [X] T019 [P] Implement dependência `current_user` (valida JWT do header Authorization) in
      backend/src/api/deps.py (depends on T012)
- [X] T020 Implement auth router (POST /auth/registro, POST /auth/login, GET /auth/me) in
      backend/src/api/routers/auth.py (depends on T018, T019)
- [X] T021 Create instância FastAPI, registro do auth router e configuração de CORS in
      backend/src/main.py (depends on T020)
- [X] T022 [P] Create frontend API client (wrapper de `fetch` com header Authorization) in
      frontend/src/services/api.ts (research.md #6)
- [X] T023 [P] Create AuthContext (token em memória, funções login/registro/logout) in
      frontend/src/services/authContext.tsx (research.md #7; depends on T022)
- [X] T024 [P] Define base TypeScript types (Usuario, Cafe, Torra) in frontend/src/types.ts per
      contracts/openapi.yaml
- [X] T025 Create esqueleto de rotas com `<BrowserRouter>` em frontend/src/App.tsx (research.md #5)
- [X] T026 [P] Create conteúdo estático/apresentacional (branding, textos institucionais, meta
      padrão) in frontend/src/config.ts per Constitution Principle II
- [X] T027 [P] Create hook `useDocumentMeta` (aplica title/meta tags/JSON-LD dinamicamente no
      `<head>`) in frontend/src/hooks/useDocumentMeta.ts (research.md #14)
- [X] T028 [P] Create LoginPage (formulário de login) in frontend/src/pages/LoginPage.tsx
      (depends on T022, T023, T025)
- [X] T029 [P] Create RegistroPage (formulário de registro) in
      frontend/src/pages/RegistroPage.tsx (depends on T022, T023, T025)
- [X] T030 Wire /login e /registro routes in frontend/src/App.tsx (depends on T028, T029)

**Checkpoint**: registro/login funcionam ponta a ponta (backend + frontend); fundação pronta
para as user stories começarem

---

## Phase 3: User Story 1 - Usuário publica uma opinião sobre um café (Priority: P1) 🎯 MVP

**Goal**: um usuário autenticado publica uma opinião estruturada (café, produtor, grão especial,
torra, texto) e ela fica visível publicamente de imediato.

**Independent Test**: publicar uma opinião completa e verificar que ela aparece na página
pública do autor e ao consultar `GET /usuarios/{username}/opinioes` sem login (quickstart.md § US1).

### Implementation for User Story 1

- [X] T031 [P] [US1] Create Opiniao SQLAlchemy model in backend/src/models/opiniao.py
      (data-model.md § Opiniao)
- [X] T032 [US1] Generate Alembic migration for tabela `opinioes` in backend/alembic/versions/
      (depends on T031)
- [X] T033 [P] [US1] Create Opiniao Pydantic schemas (OpiniaoCreateRequest, Opiniao,
      OpiniaoListaResponse) in backend/src/schemas/opiniao.py per contracts/openapi.yaml
- [X] T034 [US1] Implement OpiniaoService (busca-ou-cria Cafe por nome+produtor, cria Opiniao,
      lista opiniões por usuário) in backend/src/services/opiniao_service.py (FR-006, FR-007,
      FR-010, FR-014; depends on T031, T033, T014)
- [X] T035 [US1] Implement opinioes router (POST /opinioes, GET /opinioes/{opiniao_id},
      GET /usuarios/{username}/opinioes) in backend/src/api/routers/opinioes.py (depends on
      T034, T019). FR-016: só `POST /opinioes` usa `Depends(current_user)`; os dois `GET`
      MUST permanecer públicos, sem essa dependência
- [X] T036 [US1] Register opinioes router in backend/src/main.py (depends on T035)
- [X] T037 [P] [US1] Add Opiniao/OpiniaoCreateRequest types to frontend/src/types.ts
- [X] T038 [P] [US1] Create hook `useCriarOpiniao` (chama POST /opinioes) in
      frontend/src/hooks/useCriarOpiniao.ts (depends on T022)
- [X] T039 [P] [US1] Create hook `useOpinioesDeUsuario` (chama GET /usuarios/{username}/opinioes)
      in frontend/src/hooks/useOpinioesDeUsuario.ts (depends on T022)
- [X] T040 [US1] Create OpiniaoForm component (campos café/produtor/grão/torra/texto com
      validação client-side espelhando FR-007) in frontend/src/components/OpiniaoForm.tsx
      (depends on T038)
- [X] T041 [US1] Create NovaOpiniaoPage integrando OpiniaoForm in
      frontend/src/pages/NovaOpiniaoPage.tsx (depends on T040)
- [X] T042 [US1] Wire /opinioes/nova route in frontend/src/App.tsx (depends on T025, T041)

**Checkpoint**: User Story 1 completa e testável de forma independente (quickstart.md § US1)

---

## Phase 4: User Story 2 - Usuário comenta e dá sua nota na opinião de outro usuário (Priority: P2)

**Goal**: um usuário autenticado comenta e/ou dá uma nota (1–5) na opinião publicada por outro
usuário, sem poder reagir à própria.

**Independent Test**: com uma opinião existente (US1) e um segundo usuário autenticado, comentar
e notar essa opinião; confirmar que o autor original não consegue comentar/notar a própria
opinião, e que uma segunda nota do mesmo avaliador substitui a primeira (quickstart.md § US2).

### Implementation for User Story 2

- [X] T043 [P] [US2] Create Comentario SQLAlchemy model in backend/src/models/comentario.py
      (data-model.md § Comentario)
- [X] T044 [P] [US2] Create Nota SQLAlchemy model in backend/src/models/nota.py (data-model.md
      § Nota, incl. `UNIQUE(opiniao_id, avaliador_id)`)
- [X] T045 [US2] Generate Alembic migration for tabelas `comentarios` e `notas` in
      backend/alembic/versions/ (depends on T043, T044)
- [X] T046 [P] [US2] Create Comentario Pydantic schemas (ComentarioCreateRequest, Comentario) in
      backend/src/schemas/comentario.py per contracts/openapi.yaml
- [X] T047 [P] [US2] Create Nota Pydantic schemas (NotaUpsertRequest, Nota) in
      backend/src/schemas/nota.py per contracts/openapi.yaml
- [X] T048 [US2] Implement ComentarioService (cria comentário, valida autor ≠ autor da opinião)
      in backend/src/services/comentario_service.py (FR-010, FR-012; depends on T043, T046)
- [X] T049 [US2] Implement NotaService (upsert de nota via `ON CONFLICT ... DO UPDATE`, valida
      autor ≠ autor da opinião) in backend/src/services/nota_service.py (FR-011, FR-012, FR-013;
      depends on T044, T047)
- [X] T050 [US2] Implement comentário/nota endpoints (POST /opinioes/{id}/comentarios,
      PUT /opinioes/{id}/nota) in backend/src/api/routers/opinioes.py (depends on T048, T049, T035).
      FR-016: ambos exigem `Depends(current_user)` (são escrita); nenhum dos dois GET já
      existentes em opinioes.py (T035) deve ganhar essa dependência
- [X] T051 [US2] Extend GET /opinioes/{opiniao_id} para incluir `comentarios` e
      `nota_do_usuario_atual` in backend/src/api/routers/opinioes.py (depends on T050)
- [X] T052 [P] [US2] Add Comentario/Nota types to frontend/src/types.ts
- [X] T053 [P] [US2] Create hook `useComentarOpiniao` in
      frontend/src/hooks/useComentarOpiniao.ts (depends on T022)
- [X] T054 [P] [US2] Create hook `useDarNota` in frontend/src/hooks/useDarNota.ts (depends on T022)
- [X] T055 [US2] Create ComentarioForm component in frontend/src/components/ComentarioForm.tsx
      (depends on T053)
- [X] T056 [US2] Create NotaSelector component (seletor 1–5) in
      frontend/src/components/NotaSelector.tsx (depends on T054)
- [X] T057 [US2] Create OpiniaoPage (detalhe da opinião, lista de comentários, NotaSelector;
      oculta ações de comentar/notar quando o usuário atual é o autor, conforme FR-012) in
      frontend/src/pages/OpiniaoPage.tsx (depends on T055, T056)
- [X] T058 [US2] Wire /opinioes/:opiniaoId route in frontend/src/App.tsx (depends on T057)

**Checkpoint**: User Stories 1 e 2 funcionam de forma independente e integrada

---

## Phase 5: User Story 3 - Visitante descobre os cafés mais bem avaliados da rede (Priority: P3)

**Goal**: um visitante sem login consulta o ranking geral da rede e o consolidado de opiniões de
um café específico.

**Independent Test**: sem autenticação, `GET /ranking-geral` lista o(s) café(s) com opiniões/notas
já publicadas (US1+US2) ordenados por apreciação; `GET /cafes/{cafe_id}` mostra o consolidado
daquele café (quickstart.md § US3).

### Implementation for User Story 3

- [X] T059 [P] [US3] Create RankingPessoalItem SQLAlchemy model in
      backend/src/models/ranking_pessoal.py (data-model.md § RankingPessoalItem) — necessário
      estruturalmente para a fórmula do ranking geral (research.md #8) mesmo antes da US4 expor
      o recurso ao usuário
- [X] T060 [US3] Generate Alembic migration for tabela `ranking_pessoal_items` in
      backend/alembic/versions/ (depends on T059)
- [X] T061 [P] [US3] Create RankingGeral Pydantic schemas (RankingGeralEntry,
      RankingGeralResponse) in backend/src/schemas/ranking.py per contracts/openapi.yaml
- [X] T062 [P] [US3] Create CafeConsolidado Pydantic schema (estende Cafe) in
      backend/src/schemas/cafe.py per contracts/openapi.yaml
- [X] T063 [US3] Implement RankingService.calcular_ranking_geral (fórmula research.md #8,
      agrega Nota + RankingPessoalItem por café) in backend/src/services/ranking_service.py
      (depends on T059, T044)
- [X] T064 [US3] Implement CafeService.obter_consolidado (opiniões + nota_media + grão/torra
      mais recentes de um café, data-model.md § Cafe) in backend/src/services/cafe_service.py
      (depends on T031, T044)
- [X] T065 [US3] Implement cafes router (GET /cafes, GET /cafes/{cafe_id}) in
      backend/src/api/routers/cafes.py (depends on T064)
- [X] T066 [US3] Implement ranking router (GET /ranking-geral) in
      backend/src/api/routers/ranking.py (depends on T063)
- [X] T067 [US3] Register cafes e ranking routers in backend/src/main.py (depends on T065, T066)
- [X] T068 [P] [US3] Add RankingGeralEntry/CafeConsolidado types to frontend/src/types.ts
- [X] T069 [P] [US3] Create hook `useRankingGeral` in frontend/src/hooks/useRankingGeral.ts
      (depends on T022)
- [X] T070 [P] [US3] Create hook `useCafeConsolidado` in frontend/src/hooks/useCafeConsolidado.ts
      (depends on T022)
- [X] T071 [US3] Create RankingGeralPage (lista paginada, home da aplicação) in
      frontend/src/pages/RankingGeralPage.tsx (depends on T069)
- [X] T072 [US3] Create CafePage (consolidado + JSON-LD `AggregateRating` via `useDocumentMeta`,
      Constitution Principle IV) in frontend/src/pages/CafePage.tsx (depends on T070, T027)
- [X] T073 [US3] Wire `/` (home = ranking geral) e `/cafes/:cafeId` routes in
      frontend/src/App.tsx (depends on T071, T072)

**Checkpoint**: User Stories 1–3 funcionam de forma independente (US3 funciona mesmo com zero
linhas em `ranking_pessoal_items`, já que a fórmula trata esse termo como 0)

---

## Phase 6: User Story 4 - Usuário organiza seu ranking pessoal de cafés (Priority: P4)

**Goal**: um usuário autenticado ordena por preferência os cafés sobre os quais já publicou
opinião.

**Independent Test**: com um usuário que já tem ≥2 opiniões sobre cafés distintos,
`PUT /usuarios/me/ranking` define a ordem; `GET /usuarios/{username}/ranking` sem login reflete
essa ordem; incluir um café sem opinião prévia é rejeitado (quickstart.md § US4).

### Implementation for User Story 4

- [X] T074 [P] [US4] Create RankingPessoal Pydantic schemas (RankingPessoalItemResponse,
      RankingPessoalResponse, RankingPessoalUpdateRequest) in backend/src/schemas/ranking.py
      per contracts/openapi.yaml
- [X] T075 [US4] Implement RankingPessoalService (substitui o ranking inteiro em transação
      única; valida que cada `cafe_id` já tem Opiniao do usuário, FR-008) in
      backend/src/services/ranking_pessoal_service.py (depends on T059, T031)
- [X] T076 [US4] Implement ranking pessoal endpoints (GET /usuarios/{username}/ranking,
      PUT /usuarios/me/ranking) in backend/src/api/routers/usuarios.py (depends on T075, T019).
      FR-016: só `PUT /usuarios/me/ranking` usa `Depends(current_user)`; `GET` MUST permanecer
      público
- [X] T077 [US4] Register usuarios router in backend/src/main.py (depends on T076)
- [X] T078 [P] [US4] Add RankingPessoal types to frontend/src/types.ts
- [X] T079 [P] [US4] Create hook `useRankingPessoal` (leitura) in
      frontend/src/hooks/useRankingPessoal.ts (depends on T022)
- [X] T080 [P] [US4] Create hook `useAtualizarRankingPessoal` (escrita) in
      frontend/src/hooks/useAtualizarRankingPessoal.ts (depends on T022)
- [X] T081 [US4] Create RankingPessoalEditor component (reordenar itens por setas/drag) in
      frontend/src/components/RankingPessoalEditor.tsx (depends on T080)
- [X] T082 [US4] Create MeuRankingPage in frontend/src/pages/MeuRankingPage.tsx (depends on T081)
- [X] T083 [US4] Wire /meu-ranking route in frontend/src/App.tsx (depends on T082)

**Checkpoint**: User Stories 1–4 funcionam de forma independente

---

## Phase 7: User Story 5 - Visitante consulta o perfil de um usuário específico (Priority: P5)

**Goal**: um visitante sem login vê as opiniões publicadas por um usuário e o ranking pessoal
dele, se existir.

**Independent Test**: sem autenticação, `GET /usuarios/{username}` retorna o perfil público;
combinado com os endpoints de US1/US4 já existentes, a página exibe opiniões e ranking
(quickstart.md § US5).

### Implementation for User Story 5

- [X] T084 [US5] Implement UsuarioService.obter_perfil_publico (dados do usuário +
      `total_opinioes`) in backend/src/services/usuario_service.py (depends on T013)
- [X] T085 [US5] Implement GET /usuarios/{username} endpoint in
      backend/src/api/routers/usuarios.py (depends on T084). FR-016: este endpoint é leitura
      pública — MUST NOT usar `Depends(current_user)`
- [X] T086 [P] [US5] Add PerfilUsuario type to frontend/src/types.ts
- [X] T087 [P] [US5] Create hook `usePerfilUsuario` in frontend/src/hooks/usePerfilUsuario.ts
      (depends on T022)
- [X] T088 [US5] Create PerfilPage (dados do usuário + lista de opiniões via
      `useOpinioesDeUsuario` (US1) + ranking pessoal via `useRankingPessoal` (US4)) in
      frontend/src/pages/PerfilPage.tsx (depends on T087, T039, T079)
- [X] T089 [US5] Wire /u/:username route in frontend/src/App.tsx (depends on T088)

**Checkpoint**: todas as 5 user stories funcionam de forma independente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: qualidade transversal a todas as user stories

- [X] T090 [P] Add global error boundary + feedback de erro (toast/banner) in
      frontend/src/components/ErrorBoundary.tsx
- [X] T091 [P] Add loading/skeleton state component reutilizável in
      frontend/src/components/Skeleton.tsx
- [X] T092 [P] Verify contraste WCAG AA e cobertura de `aria-label`/`alt` em todas as páginas e
      componentes (Constitution Principle III) — verificado por revisão estática: todo `<Link>`
      e botão somente-ícone tem `aria-label`; nenhum `<img>` foi introduzido (logo nenhum `alt`
      pendente); paleta de design-system.md documentada com pares texto/fundo ≥4.5:1. Não
      verificado com ferramenta de contraste automatizada em navegador real (sem acesso de rede
      neste ambiente para instalar tooling — ver nota em T095/T097/T098/T099 abaixo)
- [X] T093 [P] Verify todas as páginas usáveis a partir de 320px de largura (Constitution
      Principle III / SC-003) — construído mobile-first (flex-col, `max-w-*` como teto e não
      como largura fixa, sem valores de largura fixos em px); não verificado visualmente em
      navegador/emulador real neste ambiente
- [X] T094 [P] Add JSON-LD `LocalBusiness`/`Review` faltantes em PerfilPage e OpiniaoPage via
      `useDocumentMeta` (Constitution Principle IV) — OpiniaoPage usa `Review`; PerfilPage usa
      `ProfilePage`/`Person` (mais apropriado que `LocalBusiness` para uma página de pessoa,
      que não representa um estabelecimento físico)
- [ ] T095 Run `npx tsc --noEmit` em frontend/ e corrigir eventuais erros de tipo (SC-006) —
      **BLOQUEADO neste ambiente**: `npm install` falhou por falta de acesso de rede ao
      registry interno configurado (`binarios.intranet.bb.com.br`, DNS não resolvido); código
      revisado manualmente (sem `any`, todas as páginas com `export default`, tipos consistentes
      entre `types.ts` e `contracts/openapi.yaml`), mas não compilado de fato. Rodar
      `cd frontend && npm install && npx tsc --noEmit` assim que houver acesso de rede
- [X] T096 [P] Hardening de CORS (restringir à origem do frontend) in backend/src/main.py — já
      restrito por padrão a `http://localhost:5173` via `CORS_ALLOW_ORIGINS` (T009/T021), sem uso
      de `*`
- [ ] T097 [P] Add lazy-loading das rotas (`React.lazy`/`Suspense` por página) em
      frontend/src/App.tsx e checagem de tamanho de bundle (`vite build` + relatório de
      tamanho) para perseguir a meta de carregamento (SC-002/FR-019), não só validá-la no final
      — lazy-loading implementado (rotas exceto home usam `React.lazy`); checagem de tamanho de
      bundle **BLOQUEADA** pela mesma falta de acesso de rede de T095. Rodar
      `cd frontend && npm run build` quando houver acesso de rede
- [ ] T098 [P] Run teste de usabilidade informal (5 usuários, tarefa: "encontre o consolidado de
      opiniões de um café específico a partir da home") e registrar taxa de sucesso observada
      em specs/001-coffee-opinions-social/quickstart.md § Validação, para cobrir SC-005 —
      **NÃO EXECUTADO**: requer usuários reais e a aplicação rodando, indisponível nesta sessão
- [ ] T099 Run quickstart.md validation ponta a ponta (US1–US5 + critérios transversais: 320px,
      3G, TS strict, navegação sem nova aba) (depends on T097, T098) — **NÃO EXECUTADO**: requer
      PostgreSQL, `pip install`/`npm install` e os dois servidores rodando; nenhum destes está
      disponível neste ambiente sandboxed sem acesso de rede. Backend verificado via
      `python3 -m py_compile` (sem erros de sintaxe) como verificação parcial substituta

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as user stories (inclusive US1,
  que exige autenticação)
- **User Stories (Phase 3–7)**: todas dependem do Foundational completo
  - US1 (P1) e US3 (P3, exceto pela leitura de `ranking_pessoal_items` — ver nota abaixo) podem
    prosseguir em paralelo entre si depois do Foundational
  - US2 (P2) depende de US1 já ter o endpoint `GET /opinioes/{id}` e o router `opinioes.py`
    criados (T035) — não é independente no nível de infraestrutura, mas é testável
    independentemente assim que isso existe
  - US4 (P4) depende do modelo `RankingPessoalItem` criado em US3 (T059) — ver nota abaixo
  - US5 (P5) reutiliza hooks de leitura de US1 (T039) e US4 (T079), mas sua própria
    implementação de backend (T084–T085) é independente
- **Polish (Phase 8)**: depende de todas as user stories desejadas estarem completas

**Nota sobre a ordem US3 → US4**: a entidade `RankingPessoalItem` é criada em US3 (T059) porque
a fórmula do ranking geral (research.md #8) precisa da tabela existir para o `JOIN`, mesmo que
vazia — não porque US3 usa a feature de ranking pessoal do usuário. US4 reaproveita esse modelo
e adiciona os serviços/endpoints que dão significado de produto a ele (escrever/ler o ranking de
um usuário). Isso é intencional (regra "entidade usada por múltiplas stories vai na primeira que
precisa dela") e está documentado aqui para não ser confundido com uma violação de independência.

### Within Each User Story

- Models antes de Services
- Services antes de Endpoints/Routers
- Backend (model → schema → service → router → registro em main.py) antes do Frontend
  correspondente (types → hook → component → page → rota em App.tsx)
- Story completa e validada (checkpoint) antes de mover para a próxima prioridade

### Parallel Opportunities

- Todas as tarefas [P] do Setup podem rodar em paralelo
- Todas as tarefas [P] do Foundational podem rodar em paralelo (respeitando as dependências
  indicadas entre parênteses)
- Depois do Foundational completo, US1 e US3 podem começar em paralelo (times diferentes); US2
  precisa aguardar o router de opiniões de US1 (T035); US4 precisa aguardar o modelo de US3
  (T059); US5 pode começar seu backend (T084–T085) em paralelo com qualquer outra, mas sua
  página final (T088) só fecha depois que US1 e US4 expuserem os hooks que ela reusa
- Dentro de cada story, models/schemas/types marcados [P] rodam em paralelo entre si

---

## Parallel Example: User Story 1

```bash
# Depois do Foundational completo, lançar em paralelo:
Task: "Create Opiniao SQLAlchemy model in backend/src/models/opiniao.py"
Task: "Create Opiniao Pydantic schemas in backend/src/schemas/opiniao.py"
Task: "Add Opiniao/OpiniaoCreateRequest types to frontend/src/types.ts"

# Depois que o backend de US1 estiver pronto (T035), lançar em paralelo:
Task: "Create hook useCriarOpiniao in frontend/src/hooks/useCriarOpiniao.ts"
Task: "Create hook useOpinioesDeUsuario in frontend/src/hooks/useOpinioesDeUsuario.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 apenas)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloqueia todas as stories, inclusive autenticação)
3. Completar Phase 3: User Story 1
4. **PARAR e VALIDAR**: rodar o cenário US1 de quickstart.md independentemente
5. Deploy/demo se pronto — já resolve "usuário publica opinião rapidamente", núcleo da spec

### Incremental Delivery

1. Setup + Foundational → base pronta (auth funcionando)
2. US1 → validar → Deploy/Demo (MVP: publicar opiniões)
3. US2 → validar → Deploy/Demo (engajamento social: comentar/notar)
4. US3 → validar → Deploy/Demo (proposta de valor central: descobrir os mais apreciados)
5. US4 → validar → Deploy/Demo (ranking pessoal)
6. US5 → validar → Deploy/Demo (perfil público)
7. Phase 8 (Polish) → hardening final e validação completa via quickstart.md

### Parallel Team Strategy

Com múltiplos desenvolvedores, depois do Foundational:

- Dev A: US1 → depois US2 (mesmo router `opinioes.py`)
- Dev B: US3 → depois US4 (mesmo modelo `RankingPessoalItem`)
- Dev C: US5 (backend independente; página final aguarda hooks de US1/US4)

---

## Notes

- [P] = arquivos diferentes, sem dependência pendente
- Rótulo [Story] mapeia a tarefa à user story correspondente, para rastreabilidade
- Nenhuma tarefa de teste automatizado foi incluída (não pedido explicitamente) — o ferramental
  (Vitest, pytest) está instalado desde o Setup caso o time decida adicionar testes depois
- Cada story deve ser completável e testável de forma independente, respeitando as duas
  dependências estruturais documentadas acima (US2→US1, US4→US3)
- Commitar após cada tarefa ou grupo lógico de tarefas
- Parar em qualquer checkpoint para validar a story isoladamente antes de seguir
