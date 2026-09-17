# Research: Perfil Social Visual e Rede de Seguidores

Decisões técnicas para as áreas identificadas no Technical Context do plan.md que exigiam
escolha (nenhum "NEEDS CLARIFICATION" restante).

## 1. Onde armazenar a imagem de cabeçalho (capa) do perfil

- **Decision**: Asset estático embutido no frontend (`frontend/public/`), referenciado a partir
  de `config.ts` (branding/apresentacional).
- **Rationale**: spec.md define a capa como "imagem de cabeçalho padrão da aplicação" — igual
  para todos os perfis, sem personalização por usuário (Assumptions). Isso a torna, por
  definição, conteúdo de branding estático (Regra II da constituição: `config.ts` para
  "textos institucionais, branding, metadados padrão"), não um dado de domínio dinâmico. Evita
  endpoint, storage e migração desnecessários para algo que nunca varia por usuário.
- **Alternatives considered**: servir a capa pelo backend como qualquer outro asset de mídia —
  rejeitado por adicionar uma rota, uma chamada de API e uma dependência de rede para um arquivo
  que nunca muda; pior para SC-002 (carregamento < 2s em 3G), já que um asset do bundle é cacheado
  pelo navegador/CDN do frontend automaticamente.

## 2. Onde e como armazenar avatar do usuário e foto de embalagem do café

- **Decision**: Upload via `multipart/form-data`, validado e persistido em disco pelo backend
  num diretório dedicado (`backend/uploads/`), montado como volume Docker nomeado
  (`uploads_data`), servido de volta como estático via `starlette.staticfiles.StaticFiles` sob
  `/api/media/{avatars|opinioes}/{arquivo}`. O banco armazena apenas o caminho relativo
  resultante (`avatar_url`, `imagem_embalagem_url`), nunca o binário.
- **Rationale**: `StaticFiles`/`UploadFile` já vêm com Starlette, dependência transitiva do
  FastAPI já autorizado pela constituição (Regra V) — não conta como "dependência adicional de
  framework web/ORM/migração". Um volume Docker nomeado é o mesmo padrão já usado para
  `db_data` no `docker-compose.yml`, então não introduz um conceito novo de infraestrutura.
  Guardar blobs no Postgres (bytea) foi descartado por inflar linhas/backups e degradar
  performance de queries que não precisam do binário (ex.: listar opiniões).
- **Nota de implementação**: parsear `multipart/form-data` (`UploadFile`/`Form`) exige a
  dependência `python-multipart` — não incluída por padrão no FastAPI. Foi adicionada a
  `backend/pyproject.toml` e `backend/requirements.txt` junto de `bcrypt`/`PyJWT`, sob a mesma
  justificativa já usada para elas em 001 (não é framework web/ORM/ferramenta de migração,
  portanto não exige emenda constitucional pela Regra V).
- **Alternatives considered**:
  - **Object storage externo (S3-compatible)**: mais adequado em produção multi-instância, mas
    exigiria uma nova dependência de SDK e credenciais/infra fora do escopo desta constituição
    (que fixa o stack de backend); rejeitado como fora de escopo para o tamanho atual do
    produto ("mini rede social", ~10k usuários).
  - **Base64 inline no banco/response da API**: simples de implementar, mas infla payloads JSON
    (contraria SC-002/carregamento em 3G) e não permite cache HTTP de imagem por URL; rejeitado.

## 3. Limite de tamanho/tipo de arquivo

- **Decision**: aceitar apenas `image/jpeg`, `image/png`, `image/webp`; limite de 5MB por
  arquivo, validado por `Content-Type` declarado e por leitura do cabeçalho de assinatura do
  arquivo (magic bytes) no backend — nunca confiar apenas na extensão do nome do arquivo enviado
  pelo cliente. Validação de tipo/tamanho no cliente (input `accept` + checagem antes do envio)
  é apenas para feedback rápido, não é a fonte da verdade.
- **Rationale**: mantém consistência com SC-002 (carregamento rápido em 3G) e com a meta
  qualitativa de UX de erro amigável (spec.md § Edge Cases); validar magic bytes no servidor
  evita que um arquivo malicioso disfarçado de imagem (renomeado) seja aceito e depois servido
  como estático a outros usuários.
- **Alternatives considered**: sem limite de tamanho — rejeitado por risco de degradar tempo de
  carregamento e por abrir superfície de abuso de armazenamento em disco.

## 4. Nota do autor no cadastro da opinião vs. nota de terceiros existente

- **Decision**: campo novo e distinto `nota_autor` em `Opiniao` (1–5, opcional), exibido junto à
  opinião mas **não** contabilizado em `nota_media`/`total_notas` do café — esses continuam
  agregando exclusivamente a tabela `Nota` (avaliações de terceiros), como já ocorre em
  001-coffee-opinions-social.
- **Rationale**: FR-021/Assumptions de spec.md resolvem explicitamente essa questão preservando a
  regra de negócio já vigente (autor não pontua a própria opinião para fins de ranking, herdada de
  001 User Story 2, Acceptance Scenario 3). Introduzir `nota_autor` como um dado de exibição
  separado atende ao pedido do usuário (dar uma nota ao publicar) sem reabrir nem enfraquecer essa
  regra anti-fraude já validada.
- **Alternatives considered**: tratar a nota do autor como uma `Nota` normal e apenas suspender a
  regra "autor não pode notar a própria opinião" — rejeitado por ser uma mudança de regra de
  negócio existente não solicitada explicitamente pelo usuário e por abrir superfície de auto-
  promoção (usuário infla a própria média com sua própria nota mais alta).

## 5. Relação de seguir (modelo de dados e semântica)

- **Decision**: tabela associativa `seguidores` com chave primária composta
  (`seguidor_id`, `seguido_id`), ambos FK para `usuarios`, sem estado de aprovação (seguir é
  imediato — Assumptions de spec.md). `CHECK (seguidor_id <> seguido_id)` no banco além da
  validação na camada de serviço, cobrindo FR-015.
- **Rationale**: é o modelo padrão para "seguir aberto" (mesma semântica de X/Twitter, Instagram
  público) já assumido em spec.md; chave composta evita duplicar o mesmo par e permite
  `DELETE` idempotente para "deixar de seguir".
- **Alternatives considered**: modelo com estado (`pendente`/`aceito`) para suportar perfis
  privados — fora de escopo (Assumptions descarta solicitação de seguir pendente nesta versão).

## 6. Busca de usuários

- **Decision**: endpoint `GET /usuarios?q=` com `ILIKE` (case-insensitive) sobre `username` e
  `display_name`, paginado (mesmo padrão `page`/`page_size` já usado em `OpiniaoListaResponse`).
- **Rationale**: reaproveita o padrão de paginação já estabelecido em 001; `ILIKE` via
  SQLAlchemy não introduz dependência nova (é SQL padrão do Postgres) e atende à FR-012 sem
  exigir motor de busca externo, adequado à escala "mini rede social" (Scale/Scope).
- **Alternatives considered**: busca full-text (`tsvector`)/motor externo (Elasticsearch) —
  rejeitado por desproporcional à escala atual e por introduzir dependência fora da Regra V.

## 7. Rolagem de opiniões no perfil

- **Decision**: reaproveitar o endpoint paginado já existente
  `GET /usuarios/{username}/opinioes` (page/page_size) sem alterações de contrato; no frontend,
  "rolar pelas opiniões" é implementado como paginação incremental (carregar mais ao aproximar do
  fim da lista), sem introduzir biblioteca de virtualização/infinite-scroll (fora da lista de
  dependências de runtime autorizadas).
- **Rationale**: endpoint já testado e em produção em 001; não requer migração nem mudança de
  contrato — apenas um novo consumo no `PerfilPage` redesenhado.
- **Alternatives considered**: carregar todas as opiniões de uma vez — rejeitado para usuários
  com muitas opiniões (custo de payload e SC-002).

## 8. Biblioteca de ícones para navegação/upload/seguir

- **Decision**: `lucide-react` (já a única lib de ícones autorizada pelo projeto desde 001).
- **Rationale**: Restrições Tecnológicas da constituição proíbem misturar bibliotecas de ícones;
  `lucide-react` já cobre os ícones necessários (usuário, câmera/upload, coração/seguir, sair,
  busca, troféu/ranking).
- **Alternatives considered**: nenhuma — introduzir uma segunda lib exigiria emenda constitucional
  e não há necessidade funcional que `lucide-react` não cubra.
