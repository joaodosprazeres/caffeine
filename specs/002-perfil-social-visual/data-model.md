# Data Model: Perfil Social Visual e Rede de Seguidores

Estende `specs/001-coffee-opinions-social/data-model.md`. Apenas entidades novas e campos
alterados são detalhados aqui; entidades não listadas (`Cafe`, `Comentario`, `Nota`,
`RankingPessoalItem`) permanecem inalteradas.

## Usuario (alterado)

Adiciona um campo; todos os demais campos/regras herdados de 001 permanecem.

| Campo | Tipo | Regras |
|---|---|---|
| avatar_url | string \| null | opcional; caminho relativo (`/api/media/avatars/{arquivo}`) do avatar enviado pelo próprio usuário; `null` = exibir placeholder padrão tema café no frontend |

**Validação**: só o próprio usuário (dono do token) MUST poder alterar seu `avatar_url`, via
upload de arquivo (image/jpeg, image/png, image/webp; ≤ 5MB — research.md #3). Trocar o avatar
substitui o valor anterior (sem histórico de versões — spec.md § Assumptions); o arquivo antigo
MUST ser removido do disco ao ser substituído, para não acumular arquivos órfãos.

**Não é um campo de Usuario**: a imagem de cabeçalho (capa) do perfil — é um asset estático do
frontend, igual para todos os perfis (research.md #1), não persistido no backend.

## Opiniao (alterado)

Adiciona dois campos opcionais; todos os demais campos/regras herdados de 001 permanecem.

| Campo | Tipo | Regras |
|---|---|---|
| imagem_embalagem_url | string \| null | opcional; caminho relativo (`/api/media/opinioes/{arquivo}`) da foto da embalagem do café anexada no cadastro |
| nota_autor | integer \| null | opcional, 1–5 (mesma escala de `Nota.valor`); nota que o próprio autor atribui ao café ao publicar a opinião |

**Validação**:
- `imagem_embalagem_url`: mesmas regras de tipo/tamanho do avatar (research.md #3); imutável após
  a criação (não há edição de opinião nesta versão — regra herdada de 001).
- `nota_autor`: **MUST NOT** ser somado a `Nota` nem contabilizado em `nota_media`/`total_notas`
  do `Cafe` — é exibido apenas como um dado informativo da própria opinião (research.md #4,
  FR-021). Distinto de `Nota` (tabela de avaliações de terceiros, inalterada).

## Seguidor (nova entidade)

Representa que um `Usuario` (seguidor) escolheu acompanhar outro `Usuario` (seguido).

| Campo | Tipo | Regras |
|---|---|---|
| seguidor_id | UUID (FK → Usuario, `ON DELETE CASCADE`) | obrigatório; parte da PK composta |
| seguido_id | UUID (FK → Usuario, `ON DELETE CASCADE`) | obrigatório; parte da PK composta |
| created_at | datetime | gerado pelo servidor, momento em que passou a seguir |

**Chave primária**: composta (`seguidor_id`, `seguido_id`) — um mesmo par só pode existir uma vez
(idempotência natural: seguir de novo não duplica, deixar de seguir é um `DELETE` direto por PK).

**Validação (FR-015)**: `CHECK (seguidor_id <> seguido_id)` no banco, além de verificação na
camada de serviço antes do `INSERT` — um usuário não pode seguir a si mesmo.

**Índices**: além da PK composta (que já cobre buscas por `seguidor_id`), um índice adicional em
`seguido_id` para consultas eficientes de "quem segue este usuário" (não exposta como endpoint
nesta versão, mas necessária para eventual contagem de seguidores).

**Relacionamentos**: N—N entre `Usuario` e `Usuario`, mediada por esta tabela associativa; não é
uma entidade com identidade própria além do par (sem `id` UUID dedicado).

**Sem estado de aprovação**: seguir é imediato e unilateral (research.md #5) — não há
"solicitação pendente" nesta versão.

## Diagrama de relacionamento (delta sobre 001)

```
Usuario 1───N Opiniao   (Opiniao ganha imagem_embalagem_url, nota_autor)
   │
   ├──N Seguidor (seguidor_id) ──┐
   │                              │
   └──N Seguidor (seguido_id) ◄──┘   (mesma tabela, duas FKs para Usuario)
```

## Regras de exclusão/edição (escopo desta versão)

- `avatar_url`: substituível (upload sobrescreve), sem histórico.
- `imagem_embalagem_url` e `nota_autor`: definidos apenas na criação da `Opiniao`; sem edição
  posterior (consistente com a regra já vigente de que opiniões não são editáveis em 001).
- `Seguidor`: criável (`POST`) e removível (`DELETE`) por par; sem soft-delete — deixar de seguir
  remove a linha.
