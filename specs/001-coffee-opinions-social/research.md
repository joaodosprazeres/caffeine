# Research: Mini Rede Social de Opiniões sobre Cafés

Consolidação das decisões técnicas necessárias para resolver os pontos em aberto do Technical
Context do [plan.md](./plan.md). Cada item segue o formato Decision / Rationale / Alternatives
considered.

## 1. Versão do Python

**Decision**: Python 3.12

**Rationale**: versão estável mais recente com bom suporte a tipagem (compatível com os
recursos de tipagem usados por Pydantic v2/SQLAlchemy 2.x) e suporte de longo prazo adequado
para um backend novo.

**Alternatives considered**: Python 3.11 (rejeitado: sem ganho relevante em relação ao 3.12
para este projeto); Python 3.13 (rejeitado por ainda ter suporte mais recente/menos maduro no
ecossistema de libs de ORM/async no momento da decisão).

## 2. Banco de dados

**Decision**: PostgreSQL 16, acessado via SQLAlchemy 2.x com engine assíncrono e driver
`asyncpg`.

**Rationale**: combinação padrão de mercado com FastAPI/SQLAlchemy/Alembic; suporta bem
concorrência de escrita (múltiplos usuários comentando/notando ao mesmo tempo) e os `UNIQUE
constraints` compostos exigidos pelo modelo de dados (ex.: uma nota por par usuário/opinião).

**Alternatives considered**: SQLite (rejeitado: inadequado para concorrência de escrita
multiusuário em produção, embora possa ser útil para testes unitários rápidos); MySQL
(rejeitado: sem vantagem sobre Postgres para este domínio, e Postgres tem melhor suporte a
`ON CONFLICT` para os upserts de Nota).

## 3. Estilo assíncrono do SQLAlchemy

**Decision**: SQLAlchemy 2.0 no modo assíncrono (`AsyncSession`, `create_async_engine`),
alinhado ao modelo assíncrono nativo do FastAPI.

**Rationale**: evita bloquear o event loop do FastAPI em operações de I/O de banco; é o padrão
recomendado atualmente para novos projetos FastAPI + SQLAlchemy.

**Alternatives considered**: SQLAlchemy síncrono rodando em threadpool via `run_in_threadpool`
(rejeitado: adiciona complexidade operacional sem benefício, já que o suporte assíncrono nativo
está maduro).

## 4. Biblioteca de ícones única (Regra II/Restrições Tecnológicas)

**Decision**: `lucide-react`.

**Rationale**: biblioteca leve, tree-shakeable (só o ícone importado entra no bundle),
ativamente mantida, com cobertura ampla de ícones genéricos de UI (necessários para
navegação, ações de comentar/notar/ranquear, etc.) sem exigir uma segunda dependência.

**Alternatives considered**: `react-icons` (rejeitado: agrega múltiplos conjuntos de ícones de
fontes variadas, dificultando consistência visual); `@heroicons/react` (viável, mas conjunto
menor de ícones; `lucide-react` cobre o mesmo caso de uso com mais opções).

## 5. Roteamento client-side

**Decision**: `react-router` (v7, API declarativa `<BrowserRouter>` + `<Routes>`/`<Route>`),
sem usar a API de data loaders do react-router para busca de dados.

**Rationale**: autorizado explicitamente pela constituição v1.3.0+; a API declarativa mantém a
busca de dados em hooks dedicados (`useOpiniao`, `useRankingGeral`, etc.) em vez de em loaders
acoplados à configuração de rotas, preservando a regra de "zero lógica de negócio em
componentes de UI" também para os componentes de rota.

**Alternatives considered**: roteador caseiro via History API (era o plano antes da emenda que
autorizou `react-router`; descartado agora que a dependência está autorizada, pois reinventar
roteamento é esforço não justificado); API de data loaders do react-router (rejeitada: acopla
busca de dados à definição de rotas, tensionando com a Regra I).

## 6. Cliente HTTP no frontend

**Decision**: `fetch` nativo do navegador, encapsulado em um módulo `services/api.ts` tipado
(funções por recurso: `getCafe`, `postOpiniao`, `putNota`, etc.), sem biblioteca de cliente
HTTP adicional.

**Rationale**: `fetch` já é suficiente para as necessidades da API (JSON, headers de
autorização); evita mais uma dependência de runtime além da lista já autorizada pela Regra II.

**Alternatives considered**: `axios` (rejeitado: dependência de runtime adicional não
autorizada, sem ganho funcional relevante sobre `fetch` para este escopo).

## 7. Autenticação

**Decision**: e-mail + senha; senha armazenada como hash `bcrypt`; sessão representada por um
token JWT (assinado HS256 via `PyJWT`) retornado no login/registro e enviado pelo frontend como
`Authorization: Bearer <token>`. Token de curta duração (24h) sem refresh token nesta primeira
versão. No frontend, o token fica em memória (React Context), não em `localStorage`, para
reduzir exposição a XSS — implica que recarregar a página (F5) desloga o usuário, aceitável
dado que a navegação normal do app é 100% client-side via react-router (FR-017).

**Rationale**: atende FR-016 (exigir conta para escrever, leitura livre) com a menor
complexidade operacional possível; `bcrypt`/`PyJWT` não pertencem às categorias travadas pela
Regra V (framework web/ORM/ferramenta de migração), então não exigem emenda constitucional.

**Alternatives considered**: sessão com cookie `httpOnly` server-side (mais resistente a XSS,
mas rejeitada nesta v1 por exigir configuração de CORS/cookies entre domínios de dev e produção
desproporcional ao escopo de uma "mini" rede social — pode ser revisitada depois); login social
OAuth (rejeitado: não pedido na spec, adiciona dependência de terceiro).

## 8. Cálculo do ranking geral (FR-015)

**Decision**: `score_final(café) = 0.5 × nota_média_normalizada + 0.5 × sinal_ranking_pessoal_normalizado`, onde:
- `nota_média_normalizada` = média das Notas (1–5) recebidas pelas opiniões daquele café,
  normalizada para 0–1 (`(média − 1) / 4`); cafés sem nenhuma Nota entram com esse termo = 0.
- `sinal_ranking_pessoal_normalizado` = soma, entre todos os usuários que incluíram o café no
  próprio Ranking Pessoal, de `(N − posição + 1) / N` (N = tamanho do ranking daquele usuário —
  sistema tipo Borda count), normalizada para 0–1 pelo maior valor observado entre todos os
  cafés no momento do cálculo.

Calculado sob demanda via query agregada (não persistido como tabela própria nesta v1); ver
data-model.md para as entidades-fonte.

**Rationale**: combina os dois sinais que a spec define como fonte do "café mais apreciado"
(FR-015: média de notas de terceiros + posição nos rankings pessoais), com um peso igual e
simples de explicar/ajustar depois; o formato Borda count para posição em ranking é uma técnica
padrão de agregação de rankings ordinais.

**Alternatives considered**: usar só a média de notas (rejeitado: ignora explicitamente o sinal
de ranking pessoal que a spec pede em FR-015); persistir o ranking geral como tabela
materializada atualizada por job (rejeitado para v1: adiciona infraestrutura de
cache/invalidação não justificada pela escala assumida — ver item 16).

## 9. Representação de "Torra"

**Decision**: enum fechado com três valores: `clara`, `media`, `escura` (Pydantic `Enum` no
backend, union type `'clara' | 'media' | 'escura'` no TypeScript).

**Rationale**: consistente com a Assumption já registrada em spec.md; um enum fechado permite
filtro/agrupamento consistente entre opiniões de cafés diferentes, evitando variações livres de
grafia (“torra média”, “média-clara” etc.).

**Alternatives considered**: campo de texto livre (rejeitado: já descartado na spec por
inviabilizar comparação consistente).

## 10. Escala de Nota

**Decision**: inteiro 1–5, conforme já assumido em spec.md.

**Rationale**: escala padrão de apps de review, fácil de entender e de agregar (média simples).

## 11. Paginação de listas

**Decision**: paginação por offset/limit (parâmetros `page`/`page_size`, default `page_size=20`)
nas listagens de opiniões, comentários e no ranking geral.

**Rationale**: mantém as respostas pequenas o suficiente para caber na meta de carregamento
<2s em 3G (SC-002/FR-019) mesmo conforme o volume de conteúdo cresce.

**Alternatives considered**: paginação por cursor (mais robusta a inserções concorrentes, mas
desnecessariamente complexa para o volume assumido nesta v1 — ver item 16; pode ser revisitada
se a escala crescer).

## 12. Interpretação do teto de dependências da Regra II ("dependências de runtime")

**Decision**: o teto de dependências da Regra II (`apenas React, TypeScript, Vite, TailwindCSS,
react-router e uma única biblioteca de ícones`) é interpretado como aplicável a dependências
que são **enviadas e executadas no navegador do usuário final** (o bundle de produção).
Ferramentas de desenvolvimento/build/teste que não entram no bundle de produção — Vitest,
React Testing Library, ESLint, Prettier, PostCSS/autoprefixer (necessário para o Tailwind),
`@types/*` — não contam para esse teto, de forma análoga a como o TailwindCSS em si já é
majoritariamente uma ferramenta de build (gera CSS estático) hoje explicitamente autorizada.

**Rationale**: é a única leitura que torna a Regra II operacionalizável para um projeto real —
nenhum projeto React de produção evita 100% de devDependencies — e é consistente com a
constituição já ter autorizado TailwindCSS separadamente sabendo que ele requer tooling de
build (PostCSS) para funcionar.

**Alternatives considered**: leitura literal "qualquer pacote no `package.json`, incluindo
devDependencies, conta para o teto" (rejeitada: tornaria impossível ter testes automatizados ou
lint, o que conflita com outras expectativas de qualidade do projeto; se este for o intuito real
da regra, recomenda-se uma emenda futura via `/speckit-constitution` para deixá-lo explícito).

## 13. Estratégia de testes

**Decision**: Frontend — Vitest + React Testing Library para testes de componentes/hooks.
Backend — pytest + `httpx.AsyncClient` (contra a app FastAPI in-process) + `pytest-asyncio`
para testes de integração/contrato; testes de contrato validam as respostas da API contra os
schemas Pydantic/OpenAPI definidos em `contracts/openapi.yaml`.

**Rationale**: pareamento padrão e mais suportado para cada metade do stack (Vite oficialmente
recomenda Vitest; FastAPI oficialmente recomenda httpx+pytest).

## 14. Fonte de dados de SEO dinâmico (Regra IV)

**Decision**: páginas dinâmicas (café, usuário, opinião) obtêm `title`/`description`/Open Graph
e os campos para montar o JSON-LD diretamente da resposta da API daquele recurso (ex.:
`GET /api/cafes/{id}` já retorna os campos necessários para montar `title` e o schema
`AggregateRating`). No frontend, um hook pequeno (`useDocumentMeta`) aplica esses valores via
`document.title` e manipulação direta das tags `<meta>`/`<script type="application/ld+json">`
no `<head>`, sem biblioteca adicional (ex.: sem `react-helmet`, que seria mais uma dependência
de runtime não autorizada).

**Rationale**: cumpre a Regra IV pós-emenda (meta dinâmica vem da API, não de `config.ts`) sem
introduzir dependência nova.

**Alternatives considered**: `react-helmet`/`react-helmet-async` (rejeitado: dependência de
runtime adicional fora da lista autorizada pela Regra II).

## 15. Identidade de Café e dados por Opinião

**Decision**: `Cafe` é a chave de identidade (nome + produtor, únicos); `grão especial` e
`torra` são registrados em cada `Opiniao` (o que o usuário efetivamente relatou naquela
degustação), não em `Cafe`. Views agregadas (perfil do café/consolidado) exibem grão/torra
"mais recentes" com base na opinião mais nova associada àquele café.

**Rationale**: evita conflito de escrita entre usuários diferentes relatando grão/torra
ligeiramente diferentes para nominalmente "o mesmo" café (ex.: safras/lotes diferentes) sem
inventar uma regra de moderação fora do escopo da spec; mantém `Cafe` como identidade estável
enquanto preserva o dado bruto de cada opinião.

**Alternatives considered**: armazenar grão/torra em `Cafe` e travar edição após a primeira
opinião (rejeitado: obriga a decidir "quem tem razão" entre usuários, decisão de produto fora
do escopo desta spec).

## 16. Escala/volume assumidos

**Decision**: assumir, para fins de dimensionamento de decisões técnicas (paginação, ausência
de cache/materialização), até a ordem de ~10 mil usuários e dezenas de milhares de registros de
opinião/comentário/nota na v1.

**Rationale**: nenhuma meta de escala foi informada na spec; esse volume é compatível com uma
"mini" rede social em fase inicial e com uma instância única de PostgreSQL sem necessidade de
sharding/cache dedicado, mantendo a arquitetura simples (alinhado ao espírito de simplicidade
da constituição).

**Alternatives considered**: dimensionar para escala "internet grande" desde já (rejeitado:
YAGNI — adicionaria cache/filas/materialização não justificados pelo escopo atual da spec).
