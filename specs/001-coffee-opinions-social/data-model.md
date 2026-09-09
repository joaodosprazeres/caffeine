# Data Model: Mini Rede Social de Opiniões sobre Cafés

Entidades derivadas de spec.md § Key Entities, com decisões de modelagem de research.md
aplicadas (§8 ranking geral, §9 torra, §10 nota, §15 identidade de café). Tipos são indicados de
forma agnóstica de implementação; o mapeamento para colunas SQLAlchemy/schemas Pydantic é
detalhado nos comentários "Notas" de cada entidade.

## Usuario

Pessoa cadastrada na rede; possui perfil público.

| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK, gerado pelo servidor |
| email | string | obrigatório, único, formato de e-mail válido |
| username | string | obrigatório, único, usado na URL do perfil público (`/u/{username}`); regex restrito (letras/números/`_`/`-`, 3–30 chars) |
| display_name | string | obrigatório, 1–80 chars |
| password_hash | string | obrigatório; nunca exposto em nenhuma resposta de API |
| bio | string \| null | opcional, até 280 chars |
| created_at | datetime | gerado pelo servidor |

**Relacionamentos**: 1—N com Opiniao (autor), 1—N com Comentario (autor), 1—N com Nota
(avaliador), 1—N com RankingPessoalItem (dono do ranking).

**Notas**: `password_hash` nunca aparece em `schemas` de resposta (apenas no modelo
SQLAlchemy interno). Unicidade de `email` e `username` impostas por `UNIQUE` no banco (FR-005).

## Cafe

Identidade estável de um café avaliado pelos usuários (research.md #15).

| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| nome | string | obrigatório, 1–120 chars |
| produtor | string | obrigatório, 1–120 chars |
| created_at | datetime | gerado pelo servidor |

**Chave de correspondência**: `UNIQUE(nome, produtor)` — toda vez que uma Opiniao é publicada,
o backend busca (ou cria, se não existir) o `Cafe` com esse par exato antes de persistir a
Opiniao (FR-010, FR-014).

**Comportamento aceito para grafias divergentes (spec.md § Edge Cases)**: o match é exato
(sensível a diferenças de grafia/acentuação/espaçamento) — dois usuários que digitarem o nome
ou produtor de forma ligeiramente diferente (ex.: "Fazenda Santa Inês" vs "Fazenda Sta. Inês")
criam dois registros `Cafe` distintos, fragmentando o consolidado (FR-014) entre eles. Esta é a
decisão aceita para a v1 — nenhuma normalização, correspondência aproximada (fuzzy match) ou
deduplicação manual está no escopo desta versão; pode ser revisitada em versão futura se a
fragmentação se mostrar um problema real de uso.

**Relacionamentos**: 1—N com Opiniao; 1—N com RankingPessoalItem (via `cafe_id`).

**Campos derivados (não persistidos, calculados em query)**: `grao_especial_atual` e
`torra_atual` = valores da Opiniao mais recente associada a este Cafe (research.md #15);
`nota_media`, `total_opinioes`, `total_notas` = agregados sobre as Opiniao/Nota relacionadas.

## Opiniao

Registro público criado por um Usuario sobre um Cafe.

| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| autor_id | UUID (FK → Usuario) | obrigatório |
| cafe_id | UUID (FK → Cafe) | obrigatório |
| grao_especial | string | obrigatório, 1–120 chars (relatado nesta degustação específica) |
| torra | enum(`clara`,`media`,`escura`) | obrigatório (research.md #9) |
| texto | string | obrigatório, 1–2000 chars |
| created_at | datetime | gerado pelo servidor |

**Validação (FR-007)**: `nome`/`produtor` do café (via `cafe_id` resolvido) + `grao_especial` +
`torra` + `texto` todos obrigatórios antes de aceitar a criação.

**Relacionamentos**: N—1 com Usuario (autor); N—1 com Cafe; 1—N com Comentario; 1—N com Nota.

## Comentario

Resposta pública de um Usuario (≠ autor) a uma Opiniao.

| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| opiniao_id | UUID (FK → Opiniao) | obrigatório |
| autor_id | UUID (FK → Usuario) | obrigatório |
| texto | string | obrigatório, 1–1000 chars |
| created_at | datetime | gerado pelo servidor |

**Validação (FR-010, FR-012)**: rejeitado (HTTP 403) se `autor_id == Opiniao.autor_id`
(verificação na camada de serviço, não só no banco). Múltiplos comentários do mesmo usuário na
mesma opinião são permitidos (conversa — spec.md § Assumptions).

## Nota

Avaliação numérica de um Usuario (≠ autor) sobre o café descrito em uma Opiniao de outro
usuário.

| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| opiniao_id | UUID (FK → Opiniao) | obrigatório |
| avaliador_id | UUID (FK → Usuario) | obrigatório |
| valor | integer | obrigatório, 1–5 (research.md #10) |
| created_at | datetime | gerado pelo servidor |
| updated_at | datetime | atualizado a cada substituição |

**Validação (FR-011, FR-012, FR-013)**:
- `avaliador_id != Opiniao.autor_id`, verificado na camada de serviço.
- `UNIQUE(opiniao_id, avaliador_id)` no banco; escrita feita como upsert (`ON CONFLICT ...
  DO UPDATE`) — uma nova Nota do mesmo avaliador para a mesma Opiniao substitui `valor` e
  `updated_at` em vez de criar linha duplicada.

## RankingPessoalItem

Um item do ranking pessoal ordenado de um Usuario.

| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID (FK → Usuario) | obrigatório |
| cafe_id | UUID (FK → Cafe) | obrigatório |
| posicao | integer | obrigatório, ≥ 1 |
| created_at / updated_at | datetime | gerados/atualizados pelo servidor |

**Validação (FR-008)**:
- `UNIQUE(usuario_id, cafe_id)` — um café aparece no máximo uma vez no ranking de um usuário.
- `UNIQUE(usuario_id, posicao)` — sem posições duplicadas dentro do ranking de um usuário.
- Antes de inserir/atualizar, a camada de serviço MUST confirmar que existe pelo menos uma
  `Opiniao` desse `usuario_id` para esse `cafe_id` (regra "só cafés já opinados").
- Reordenar o ranking (endpoint `PUT`) substitui o conjunto inteiro de posições daquele
  usuário de forma atômica (transação única).

**Conjunto "Ranking Pessoal"**: a coleção ordenada de `RankingPessoalItem` de um `usuario_id`,
ordenada por `posicao` ascendente — não é uma tabela própria, é uma query.

## Ranking Geral (view computada, não persistida)

Não é uma entidade armazenada; é uma projeção calculada sob demanda pela camada de serviço a
partir de `Nota` e `RankingPessoalItem`, agregadas por `cafe_id`, conforme a fórmula definida em
research.md #8. Campos retornados por linha da projeção:

| Campo | Tipo | Origem |
|---|---|---|
| cafe_id | UUID | Cafe.id |
| nome, produtor | string | Cafe |
| nota_media | float \| null | `AVG(Nota.valor)` das Notas cujas Opiniao apontam para este Cafe |
| total_notas | integer | `COUNT(Nota.id)` idem |
| score_final | float | fórmula de research.md #8 |

## Diagrama de relacionamento (visão geral)

```
Usuario 1───N Opiniao N───1 Cafe
   │              │  1
   │              N  │
   ├──N Comentario┘  N
   │                 │
   ├──N Nota─────────┘  (Nota também referencia Opiniao)
   │
   └──N RankingPessoalItem───N Cafe
```

## Regras de exclusão/edição (escopo desta versão)

Conforme spec.md § Assumptions: não há edição/exclusão de Opiniao, Comentario ou itens do
Ranking Pessoal já publicados nesta v1 — apenas criação, a atualização por substituição de
`Nota` (upsert), e a reordenação completa do Ranking Pessoal. Nenhuma dessas entidades precisa,
portanto, de campo de soft-delete ou de histórico de versões nesta fase.
