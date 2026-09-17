# Tasks: Perfil Social Visual e Rede de Seguidores

**Input**: Design documents from `/specs/002-perfil-social-visual/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml),
[quickstart.md](./quickstart.md)

**Tests**: nenhum teste automatizado foi pedido explicitamente na spec, então nenhuma tarefa de
teste (contract/integration/unit) foi gerada, seguindo a mesma convenção de
`001-coffee-opinions-social/tasks.md`.

**Organization**: tarefas agrupadas por user story (P1–P4 de spec.md) para permitir
implementação e teste independentes de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: a qual user story a tarefa pertence (US1–US4)
- Caminhos de arquivo exatos em cada descrição, conforme plan.md § Project Structure

## Path Conventions

Web app conforme plan.md § Project Structure: `backend/src/`, `backend/alembic/`,
`frontend/src/` — mesmos projetos de 001-coffee-opinions-social, estendidos por esta feature.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar infraestrutura de armazenamento de arquivos usada por mais de uma user
story (avatar em US1, foto de embalagem em US2)

- [X] T001 [P] Add volume nomeado `uploads_data` (montado em `/app/uploads` no serviço
      `backend`) e variáveis `UPLOADS_DIR`/`MAX_UPLOAD_SIZE_MB` to docker-compose.yml e
      .env.example (research.md #2, #3)
- [X] T002 [P] Add settings `uploads_dir`/`max_upload_size_mb` to backend/src/core/config.py

**Checkpoint**: variáveis de ambiente e volume disponíveis para o serviço de armazenamento

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: serviço de armazenamento de imagens e cliente HTTP multipart — infraestrutura que
US1 (avatar) e US2 (foto de embalagem) dependem

**⚠️ CRITICAL**: nenhuma user story de upload pode começar antes desta fase estar completa

- [X] T003 Implement `ArmazenamentoService` (valida `Content-Type` declarado + assinatura/magic
      bytes do arquivo contra `image/jpeg`, `image/png`, `image/webp`; rejeita acima de
      `max_upload_size_mb`; salva com nome único em `UPLOADS_DIR/{avatars|opinioes}/`; retorna
      caminho relativo `/api/media/...`; remove arquivo antigo quando substituído) in
      backend/src/services/armazenamento_service.py (research.md #2, #3; depends on T002)
- [X] T004 Mount `StaticFiles` em `/api/media` servindo `UPLOADS_DIR` in backend/src/main.py
      (depends on T003)
- [X] T005 [P] Add `apiFetchMultipart` (envia `FormData` com header `Authorization`, sem definir
      `Content-Type` manualmente) in frontend/src/services/api.ts

**Checkpoint**: infraestrutura de upload pronta — user stories de imagem podem começar

---

## Phase 3: User Story 1 - Usuário chega ao próprio perfil após login e revisita suas opiniões (Priority: P1) 🎯 MVP

**Goal**: login redireciona para `/u/{username}`; o perfil exibe capa padrão da aplicação,
avatar próprio (ou placeholder tema café) editável pelo dono, e a lista rolável das opiniões já
publicadas, cada uma com thumbnail da imagem anexada quando houver.

**Independent Test**: autenticar um usuário com opiniões já publicadas, confirmar redirecionamento
automático para o próprio perfil, ver capa/avatar/lista rolável, e testar o upload de um novo
avatar (quickstart.md § Cenário 1).

### Implementation for User Story 1

- [X] T006 [P] [US1] Add `avatar_url` column to Usuario model in
      backend/src/models/usuario.py (data-model.md § Usuario)
- [X] T007 [US1] Generate Alembic migration adicionando `avatar_url` a `usuarios` in
      backend/alembic/versions/ (depends on T006)
- [X] T008 [P] [US1] Add `avatar_url` a Usuario/PerfilUsuario Pydantic schemas in
      backend/src/schemas/usuario.py per contracts/openapi.yaml
- [X] T009 [US1] Implement `salvar_avatar` em `UsuarioService` (usa `ArmazenamentoService`,
      substitui e remove arquivo anterior) in backend/src/services/usuario_service.py (depends
      on T003, T006, T008)
- [X] T010 [US1] Implement endpoint `POST /usuarios/me/avatar` in
      backend/src/api/routers/usuarios.py per contracts/openapi.yaml (depends on T009)
- [X] T011 [P] [US1] Create frontend/public/capa-perfil-padrao.svg (asset estático com tema
      café — grãos/xícara — para a capa padrão do perfil) (research.md #1)
- [X] T012 [P] [US1] Add referência ao asset de capa padrão e textos de placeholder de avatar to
      frontend/src/config.ts (Constitution Principle II; research.md #1)
- [X] T013 [P] [US1] Add `avatar_url` ao tipo `Usuario`/`PerfilUsuario` in frontend/src/types.ts
- [X] T014 [P] [US1] Create hook `useAvatarUpload` (chama `POST /usuarios/me/avatar` via
      `apiFetchMultipart`) in frontend/src/hooks/useAvatarUpload.ts (depends on T005)
- [X] T015 [P] [US1] Create component `AvatarUsuario` (exibe `avatar_url` ou placeholder tema
      café; quando `editavel`, expõe input de upload com `aria-label`) in
      frontend/src/components/AvatarUsuario.tsx
- [X] T016 [P] [US1] Create component `OpiniaoCard` (renderiza uma opinião com thumbnail de
      `imagem_embalagem_url` — `alt` descritivo — quando existir, e apresentação consistente sem
      espaço quebrado quando não existir) in frontend/src/components/OpiniaoCard.tsx
- [X] T017 [US1] Redesign `PerfilPage`: capa padrão, `AvatarUsuario` (editável apenas no próprio
      perfil, usando `useAvatarUpload`), lista de opiniões com paginação incremental via
      `useOpinioesDeUsuario` renderizada com `OpiniaoCard`, identidade visual tema café conforme
      design-system.md in frontend/src/pages/PerfilPage.tsx (depends on T013, T014, T015, T016)
- [X] T018 [US1] Update `LoginPage` para navegar para `/u/{username}` do usuário autenticado
      após login bem-sucedido (em vez da rota atual) in frontend/src/pages/LoginPage.tsx

**Checkpoint**: User Story 1 funcional e testável independentemente

---

## Phase 4: User Story 2 - Usuário publica uma opinião com foto da embalagem e sua nota, e retorna ao perfil (Priority: P1)

**Goal**: o formulário de nova opinião ganha anexo opcional de foto da embalagem e nota opcional
do autor; a publicação usa `multipart/form-data`; ao concluir, o usuário retorna ao próprio
perfil vendo a nova opinião entre as demais.

**Independent Test**: a partir do perfil, publicar uma opinião com foto e nota, e sem foto/nota,
confirmando em ambos os casos o retorno ao perfil com a opinião visível (quickstart.md §
Cenário 2).

### Implementation for User Story 2

- [X] T019 [P] [US2] Add `imagem_embalagem_url`, `nota_autor` columns to Opiniao model in
      backend/src/models/opiniao.py (data-model.md § Opiniao)
- [X] T020 [US2] Generate Alembic migration adicionando essas colunas a `opinioes` in
      backend/alembic/versions/ (depends on T019)
- [X] T021 [P] [US2] Update `OpiniaoCreateRequest` para campos de formulário multipart
      (`cafe_nome`, `cafe_produtor`, `grao_especial`, `torra`, `texto`, `nota_autor` opcional
      1–5, `imagem_embalagem` opcional) e adicionar `imagem_embalagem_url`/`nota_autor` ao
      schema de resposta `Opiniao` in backend/src/schemas/opiniao.py per
      contracts/openapi.yaml
- [X] T022 [US2] Update `OpiniaoService.criar` para aceitar upload opcional (via
      `ArmazenamentoService`) e `nota_autor`, garantindo que `nota_autor` **NUNCA** seja somado
      a `Nota`/`nota_media`/`total_notas` do café (FR-021) in
      backend/src/services/opiniao_service.py (depends on T003, T019, T021)
- [X] T023 [US2] Update rota `POST /opinioes` para receber `multipart/form-data` (`Form` +
      `UploadFile` opcional) in backend/src/api/routers/opinioes.py per
      contracts/openapi.yaml (depends on T022)
- [X] T024 [P] [US2] Add `imagem_embalagem_url`, `nota_autor` ao tipo `Opiniao` e ajustar
      `OpiniaoCreateRequest` in frontend/src/types.ts
- [X] T025 [US2] Update hook `useCriarOpiniao` para montar e enviar `FormData` via
      `apiFetchMultipart` (imagem e nota opcionais) in frontend/src/hooks/useCriarOpiniao.ts
      (depends on T005, T024)
- [X] T026 [US2] Update `OpiniaoForm`: input de arquivo para foto da embalagem (`accept
      image/jpeg,image/png,image/webp`, validação client-side de tipo/tamanho com mensagem
      amigável) + reuso de `NotaSelector` para a nota opcional do autor in
      frontend/src/components/OpiniaoForm.tsx
- [X] T027 [US2] Update `NovaOpiniaoPage` para navegar de volta a `/u/{username}` do autor após
      publicar com sucesso in frontend/src/pages/NovaOpiniaoPage.tsx (depends on T025, T026)

**Checkpoint**: User Stories 1 e 2 funcionais independentemente

---

## Phase 5: User Story 3 - Usuário descobre e segue outros usuários a partir do próprio perfil (Priority: P2)

**Goal**: a partir do perfil, buscar usuários por username/nome de exibição, seguir/deixar de
seguir, listar quem o usuário segue, e navegar para o perfil/opiniões de terceiros.

**Independent Test**: buscar um segundo usuário existente, segui-lo, confirmar que aparece na
lista de seguidos, navegar até o perfil dele, e depois deixar de segui-lo (quickstart.md §
Cenário 3).

### Implementation for User Story 3

- [X] T028 [P] [US3] Create `Seguidor` SQLAlchemy model (PK composta `seguidor_id`/`seguido_id`,
      `ON DELETE CASCADE`, `CHECK (seguidor_id <> seguido_id)`, índice em `seguido_id`) in
      backend/src/models/seguidor.py (data-model.md § Seguidor)
- [X] T029 [US3] Generate Alembic migration para tabela `seguidores` in
      backend/alembic/versions/ (depends on T028)
- [X] T030 [P] [US3] Create schemas `UsuarioBusca`, `UsuarioBuscaListaResponse`,
      `UsuarioListaResponse` in backend/src/schemas/usuario.py per contracts/openapi.yaml
- [X] T031 [US3] Implement em `UsuarioService`: `buscar` (ILIKE em `username`/`display_name`,
      paginado, com `ja_seguido` relativo ao usuário autenticado quando houver), `seguir`,
      `deixar_de_seguir` (idempotentes, `CHECK` FR-015), `listar_seguidos` (FR-012 a FR-017) in
      backend/src/services/usuario_service.py (depends on T028, T030)
- [X] T032 [US3] Implement endpoints `GET /usuarios`, `POST /usuarios/{username}/seguir`,
      `DELETE /usuarios/{username}/seguir`, `GET /usuarios/me/seguidos` in
      backend/src/api/routers/usuarios.py per contracts/openapi.yaml (depends on T031)
- [X] T033 [P] [US3] Add tipos `UsuarioBusca`, `UsuarioBuscaListaResponse`,
      `UsuarioListaResponse` to frontend/src/types.ts
- [X] T034 [P] [US3] Create hook `useBuscaUsuarios` (chama `GET /usuarios?q=`) in
      frontend/src/hooks/useBuscaUsuarios.ts (depends on T005)
- [X] T035 [P] [US3] Create hook `useSeguidores` (seguir, deixar de seguir, listar
      `/usuarios/me/seguidos`) in frontend/src/hooks/useSeguidores.ts (depends on T005)
- [X] T036 [P] [US3] Create component `UsuarioBuscaResultado` (avatar via `AvatarUsuario`, nome,
      botão seguir/deixar de seguir refletindo `ja_seguido`) in
      frontend/src/components/UsuarioBuscaResultado.tsx (depends on T015)
- [X] T037 [P] [US3] Create `BuscaUsuariosPage` (campo de busca + lista de
      `UsuarioBuscaResultado`, estado "nada encontrado") in
      frontend/src/pages/BuscaUsuariosPage.tsx (depends on T034, T036)
- [X] T038 [P] [US3] Create `SeguidosPage` (lista de quem o usuário autenticado segue, link para
      cada perfil, estado vazio convidando a buscar usuários) in
      frontend/src/pages/SeguidosPage.tsx (depends on T035)
- [X] T039 [US3] Add links de "Buscar usuários" e "Quem eu sigo" a partir de `PerfilPage` in
      frontend/src/pages/PerfilPage.tsx (depends on T037, T038)
- [X] T040 [US3] Wire rotas protegidas `/buscar-usuarios` e `/seguidos` in
      frontend/src/App.tsx (depends on T037, T038)

**Checkpoint**: User Stories 1, 2 e 3 funcionais independentemente

---

## Phase 6: User Story 4 - Usuário navega entre perfil, ranking geral e logoff de forma intuitiva (Priority: P3)

**Goal**: navegação principal visível em toda página autenticada, com ícones e rótulos claros
para perfil, ranking geral e logoff; identidade visual tema café aplicada de forma consistente.

**Independent Test**: a partir de qualquer página autenticada, alcançar perfil, ranking geral e
logoff em no máximo dois cliques, e confirmar usabilidade a partir de 320px (quickstart.md §
Cenário 4).

### Implementation for User Story 4

- [X] T041 [P] [US4] Create component `NavegacaoPrincipal` (ícones `lucide-react` + rótulo para
      "Meu perfil", "Ranking geral", "Sair"; `aria-label` em cada link) in
      frontend/src/components/NavegacaoPrincipal.tsx
- [X] T042 [US4] Wire `NavegacaoPrincipal` nas páginas autenticadas via `App.tsx`, com a ação de
      "Sair" chamando o logout do `AuthContext` e navegando a uma página pública in
      frontend/src/App.tsx (depends on T041)
- [X] T043 [US4] Apply identidade visual tema café (tokens de design-system.md, referências
      visuais a grãos/xícara) de forma consistente em `PerfilPage`, `OpiniaoForm`,
      `BuscaUsuariosPage`, `SeguidosPage` in frontend/src/pages/ e frontend/src/components/
      (depends on T017, T026, T037, T038)
- [X] T044 [US4] Verify `aria-label` em ícones/links de navegação e `alt` descritivo em
      avatar/capa/thumbnail em todas as páginas tocadas por esta feature (Constitution
      Principle III)

**Checkpoint**: todas as user stories funcionais independentemente

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: acabamento que atravessa múltiplas user stories

- [X] T045 [P] Update meta tags/JSON-LD (`Person`) de `PerfilPage` para incluir `avatar_url`
      vindo da API in frontend/src/hooks/useDocumentMeta.ts / frontend/src/pages/PerfilPage.tsx
      (Constitution Principle IV)
- [ ] T046 Verify responsividade a partir de 320px em `PerfilPage`, `NovaOpiniaoPage`,
      `BuscaUsuariosPage`, `SeguidosPage`. **Bloqueado neste ambiente**: sandbox sem acesso à rede
      não tem `chromium-cli`/Playwright disponível para verificação visual em navegador; classes
      Tailwind responsivas (`flex-wrap`, `hidden sm:inline`, mobile-first) foram revisadas por
      leitura de código seguindo o mesmo padrão já validado em 001, mas isso não substitui a
      verificação visual exigida pela Constitution Principle III — pendente de checagem manual em
      navegador (`npm run dev` + redimensionar para 320px) antes do merge.
- [ ] T047 Run quickstart.md validation (Cenários 1–4 + Validação de regressão de `nota_autor`
      vs. nota de terceiros). **Bloqueado neste ambiente**: requer Postgres rodando e a dependência
      `python-multipart` instalada (declarada em `backend/pyproject.toml`/`requirements.txt`, mas
      sem acesso à rede neste sandbox para instalá-la e sem uma instância de banco disponível para
      testar as rotas ponta a ponta). `tsc --noEmit`, `eslint` e `vite build` do frontend passam
      limpos, e os arquivos Python novos/alterados foram validados por `ast.parse`, mas isso não
      substitui a execução real de `docker compose up --build` + os cenários do quickstart.md.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende do Setup — bloqueia US1 e US2 (ambas usam upload de
  imagem); US3 e US4 não dependem de upload e podem, em tese, começar em paralelo à Phase 2
- **User Stories (Phase 3–6)**: US1/US2 dependem de Phase 2; US3/US4 dependem apenas de Phase 1
  (nenhuma usa `ArmazenamentoService`) mas fazem mais sentido sequencialmente após US1/US2, já
  que US3 reutiliza `AvatarUsuario` (T015, de US1) e US4 aplica tema visual sobre páginas criadas
  em US1–US3
- **Polish (Phase 7)**: depende de todas as user stories desejadas estarem completas

### User Story Dependencies

- **User Story 1 (P1)**: depende de Phase 2 (upload de avatar) — sem dependência de outras
  stories
- **User Story 2 (P1)**: depende de Phase 2 (upload de foto) — independente de US1, mas o
  retorno ao perfil (T027) só é observável visualmente depois que `PerfilPage` (T017, US1) exibe
  a lista de opiniões
- **User Story 3 (P2)**: depende de Phase 1; reutiliza `AvatarUsuario` (T015, US1) — testável
  isoladamente via API mesmo antes de US1/US2 estarem prontas na UI
- **User Story 4 (P3)**: depende de Phase 1; aplica tema visual sobre as páginas de US1–US3
  (T043) — a navegação em si (T041, T042) não depende de nenhuma outra story

### Within Each User Story

- Modelos/colunas → migração → schemas → serviço → rota (backend)
- Tipos → hooks → componentes → páginas (frontend)
- Story completa antes de avançar para a próxima, em entrega incremental

### Parallel Opportunities

- T001/T002 (Setup) em paralelo
- T005 (Foundational) em paralelo a T003/T004 (arquivos diferentes)
- Dentro de cada user story, tarefas marcadas [P] (arquivos distintos) em paralelo — ex.: T006,
  T011, T012, T013, T015, T016 em US1
- US3 e US4 podem ser trabalhadas em paralelo por pessoas diferentes depois que US1 estabelece
  `AvatarUsuario` (T015) e `PerfilPage` (T017)

---

## Parallel Example: User Story 1

```bash
# Backend e frontend de US1 em paralelo (arquivos diferentes):
Task: "Add avatar_url column to Usuario model in backend/src/models/usuario.py"
Task: "Add avatar_url to Usuario/PerfilUsuario Pydantic schemas in backend/src/schemas/usuario.py"
Task: "Create frontend/public/capa-perfil-padrao.svg"
Task: "Add avatar_url to Usuario type in frontend/src/types.ts"
Task: "Create component AvatarUsuario in frontend/src/components/AvatarUsuario.tsx"
Task: "Create component OpiniaoCard in frontend/src/components/OpiniaoCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — bloqueia US1/US2)
3. Complete Phase 3: User Story 1 (perfil visual + avatar)
4. Complete Phase 4: User Story 2 (opinião com foto + nota, retorno ao perfil)
5. **STOP and VALIDATE**: rodar quickstart.md § Cenários 1 e 2
6. Deploy/demo se pronto — já entrega o núcleo do pedido do usuário (perfil moderno + opinião com
   foto/nota)

### Incremental Delivery

1. Setup + Foundational → infraestrutura de upload pronta
2. US1 → perfil moderno com avatar e lista de opiniões → validar → demo
3. US2 → opinião com foto/nota, retorno ao perfil → validar → demo
4. US3 → seguir usuários → validar → demo
5. US4 → navegação global e polimento visual → validar → demo
6. Cada story adiciona valor sem quebrar as anteriores

---

## Notes

- [P] tasks = arquivos diferentes, sem dependência entre si
- [Story] label mapeia a tarefa à user story correspondente para rastreabilidade
- Nenhuma tarefa de teste automatizado foi gerada (não solicitado na spec)
- Fazer commit após cada tarefa ou grupo lógico
- Parar em qualquer checkpoint para validar a story isoladamente via quickstart.md
