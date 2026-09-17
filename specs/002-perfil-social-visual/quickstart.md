# Quickstart: Perfil Social Visual e Rede de Seguidores

Guia para validar manualmente esta feature sobre uma instância já rodando conforme
[quickstart.md de 001](../001-coffee-opinions-social/quickstart.md) (setup de Docker Compose ou
execução manual, aplicação de migrations). Aqui só os passos específicos desta feature. Detalhes
de schema/endpoints em [data-model.md](./data-model.md) e
[contracts/openapi.yaml](./contracts/openapi.yaml).

## Pré-requisitos

- Stack de 001 já rodando (`docker compose up --build` ou execução manual) com migrations em dia.
- Rodar a nova migration Alembic desta feature (colunas `avatar_url`, `imagem_embalagem_url`,
  `nota_autor`, tabela `seguidores`) — já incluída no `docker-entrypoint.sh` de backend, ou
  manualmente: `cd backend && alembic upgrade head`.
- Volume Docker `uploads_data` disponível (adicionado ao `docker-compose.yml`) ou, em execução
  manual, o diretório configurado em `UPLOADS_DIR` existente e gravável.
- Dois usuários de teste já registrados (via `POST /api/auth/registro` ou `scripts/seed.py`).

## Cenário 1 — Login leva direto ao próprio perfil (User Story 1)

1. Autentique via `POST /api/auth/login` com um usuário existente, ou pela UI em `/login`.
2. **Esperado**: a UI navega automaticamente para `/u/{seu-username}` (não para `/`).
3. Na página, confirme visualmente: capa padrão (asset estático, mesma para qualquer perfil),
   avatar (ou placeholder tema café se `avatar_url` for `null`), e a lista de opiniões do usuário
   rolável (se houver mais de uma página, role até o fim e confirme que mais itens carregam).

## Cenário 2 — Publicar opinião com foto e nota do autor, retornar ao perfil (User Story 2)

1. A partir do perfil, acesse o formulário de nova opinião.
2. Preencha os campos existentes (café, produtor, grão especial, torra, texto).
3. Anexe uma imagem válida (`image/jpeg`/`image/png`/`image/webp`, < 5MB) no campo de foto da
   embalagem, e escolha uma nota de 1 a 5.
4. Publique.
5. **Esperado**: `POST /api/opinioes` (multipart/form-data) retorna `201` com `imagem_embalagem_url`
   preenchido e `nota_autor` igual ao escolhido; a UI navega de volta a `/u/{seu-username}` e a
   nova opinião aparece no topo da lista, com thumbnail da imagem anexada.
6. Repita sem anexar imagem e sem nota: **esperado** publicação bem-sucedida com ambos os campos
   `null`, e apresentação consistente (sem espaço quebrado) no card da opinião.
7. Tente anexar um arquivo não-imagem (ex.: `.txt`): **esperado** rejeição client-side imediata e,
   se forçado via API diretamente, `415` do backend.

## Cenário 3 — Buscar, seguir, listar seguidos, visitar perfil de terceiro (User Story 3)

1. A partir do perfil do Usuário A, acesse a busca de usuários e procure pelo `username` ou
   `display_name` do Usuário B.
2. **Esperado**: `GET /api/usuarios?q=...` retorna o Usuário B na lista, com `ja_seguido: false`.
3. Siga o Usuário B (`POST /api/usuarios/{username}/seguir`).
4. Acesse a lista de "quem eu sigo" a partir do perfil do Usuário A (`GET /api/usuarios/me/seguidos`).
5. **Esperado**: Usuário B aparece na lista; selecioná-lo navega para `/u/{username-do-B}`, exibindo
   o perfil público e as opiniões dele.
6. Tente seguir a si mesmo via API diretamente: **esperado** `400`.
7. Deixe de seguir o Usuário B (`DELETE /api/usuarios/{username}/seguir`): **esperado** `204` e
   remoção da lista de seguidos.
8. Com um usuário sem nenhum seguido, acesse a lista: **esperado** estado vazio com mensagem
   convidando a buscar usuários.

## Cenário 4 — Navegação global e logoff (User Story 4)

1. Em qualquer página autenticada, confirme visualmente ícone + rótulo para "Meu perfil",
   "Ranking geral" e "Sair" na navegação principal.
2. Acione "Sair": **esperado** sessão encerrada (token removido) e navegação para uma página
   pública (ex.: `/` ou `/login`).
3. Redimensione a viewport para 320px de largura em cada página tocada por esta feature (perfil,
   nova opinião, busca de usuários, seguidos): **esperado** nenhuma sobreposição/corte de opções.

## Validação de regressão (regra herdada de 001)

- Confirme que `nota_autor` de uma opinião **não** altera `nota_media`/`total_notas` do café: dê
  uma nota de terceiro (`PUT /api/opinioes/{id}/nota`) com um segundo usuário e verifique que o
  cálculo do café considera apenas essa nota de terceiro, ignorando `nota_autor`.
- Confirme que o autor de uma opinião continua impedido de dar nota de terceiro
  (`PUT /api/opinioes/{id}/nota`) na própria opinião — deve retornar `403`, como em 001.
