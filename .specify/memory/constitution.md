<!--
Sync Impact Report
Version change: 2.0.0 → 3.0.0
Rationale: MAJOR bump. Removes the previously unconditional MUST in Principle IV that required
meta tags/SEO data to come exclusively from `src/config.ts` ("nunca hardcoded fora dele"). That
absolute rule is a removal/redefinition of existing binding governance (not an additive
expansion), which per this constitution's own versioning policy requires a MAJOR bump —
consistent with how the analogous Principle II change was versioned in v2.0.0. Principle IV now
splits meta tag sourcing: static/institutional pages still pull from `config.ts`; dynamic pages
(café, usuário, opinião) MUST pull from the backend API instead. This closes the deferred TODO
opened in v2.0.0's Sync Impact Report.
Principles modified:
  - IV. SEO Local e Estruturado — meta tags (`title`, `description`, Open Graph) and structured
    data are no longer required to come exclusively from `config.ts`; static/institutional pages
    still use `config.ts`, dynamic pages (café, usuário, opinião) now MUST source them from the
    backend API. Everything else in the principle (JSON-LD schemas, crawler-accessible content)
    unchanged.
Principles added: none
Added sections: none
Removed sections: none
Resolved from prior deferred TODOs:
  - The "Principle IV vs backend dynamic data" tension (open since v2.0.0) is now resolved by
    this amendment.
Deferred TODOs / follow-ups: none currently open.
-->

# Caffeine Constitution

## Core Principles

### I. TypeScript Estrito e Componentes Funcionais
TypeScript `strict: true` MUST estar habilitado em tsconfig.json; `any` implícito é
proibido em todo o código-fonte. Componentes MUST ser funcionais — class components
são proibidos em qualquer parte da base de código. Toda prop de componente MUST ser
tipada por uma interface nomeada declarada em `types.ts` (não inline, não `any`,
não tipos anônimos). Componentes de UI MUST NOT conter lógica de negócio: cálculo,
transformação de dados, regras de domínio ou chamadas a serviços pertencem a hooks
ou módulos dedicados — o componente apenas renderiza a partir de props/estado já
resolvidos.

**Rationale**: tipagem estrita e ausência de `any` eliminam uma classe inteira de
bugs em tempo de execução antes que cheguem à produção; a proibição de lógica de
negócio em componentes de UI mantém a interface testável e substituível
independentemente das regras que ela expõe.

### II. Arquitetura Config → Types → Components
A separação de camadas do frontend é fixa e unidirecional: `config.ts` (dados
estáticos e apresentacionais — textos institucionais, branding, metadados
padrão) → `types.ts` (contratos, incluindo os contratos de resposta da API) →
`components/` (UI). Dados de domínio dinâmicos e gerados por usuários —
opiniões, comentários, notas, perfis e rankings — são responsabilidade do
backend (Regra V) e chegam ao frontend via chamadas à API; eles MUST NOT ser
hardcoded ou duplicados em `config.ts`. Dependências de runtime MUST ser
mínimas: apenas React, TypeScript, Vite, TailwindCSS, react-router e uma única
biblioteca de ícones são permitidas; qualquer dependência adicional exige
emenda a esta constituição antes de ser introduzida.

**Rationale**: manter `config.ts` como fonte única de conteúdo estático continua
tornando textos institucionais e branding seguros de editar sem tocar em lógica
de UI; separar os dados dinâmicos de usuário para o backend evita que
`config.ts` vire um banco de dados disfarçado e mantém a cadeia config → types
→ components coerente mesmo com um backend real; a superfície mínima de
dependências reduz risco de supply chain, tamanho de bundle e custo de
manutenção.

### III. Design Mobile-First e Acessível
Todo componente MUST renderizar corretamente e permanecer utilizável a partir de
320px de largura de viewport; layouts que quebram abaixo de breakpoints maiores
são um defeito, não um caso extremo aceitável. `design-system.md` é a referência
absoluta e única para cores, tipografia e espaçamento — qualquer valor de cor,
fonte ou espaçamento usado fora do que esse arquivo define MUST ser justificado
como exceção documentada ou rejeitado em revisão. O piso mínimo de acessibilidade
é obrigatório: todo link MUST ter `aria-label`, toda imagem MUST ter atributo
`alt` descritivo, e toda combinação de texto/fundo MUST atingir contraste WCAG AA.

**Rationale**: como rede social consumida majoritariamente em dispositivos
móveis, mobile-first não é otimização — é o caso de uso primário; uma única
fonte de verdade de design evita divergência visual entre componentes; a
acessibilidade mínima é um requisito de inclusão não-negociável, não um
nice-to-have.

### IV. SEO Local e Estruturado
Toda página pública MUST expor dados estruturados (JSON-LD) apropriados ao
contexto de degustação e avaliação local de cafés — no mínimo os esquemas
`LocalBusiness`/`Review`/`AggregateRating` do schema.org quando o conteúdo da
página os representar. Meta tags essenciais (`title`, `description`, Open
Graph) MUST estar presentes em cada página: em páginas de conteúdo
estático/institucional elas MUST ser derivadas de `src/config.ts`; em páginas
de conteúdo dinâmico (café, usuário, opinião) elas MUST ser derivadas dos
dados retornados pela API do backend. Fora dessas duas fontes, meta tags e
dados estruturados MUST NOT ser hardcoded. Conteúdo indexável MUST ser
renderizado de forma acessível a crawlers (sem depender exclusivamente de
interações client-side para expor informação essencial).

**Rationale**: o Caffeine depende de descoberta orgânica local — cafeterias e
avaliações precisam aparecer em buscas locais e resultados ricos; usar
`config.ts` para metadados estáticos e a API para metadados dinâmicos mantém
SEO consistente com a Regra II (fonte única por tipo de dado) e evita que
dados de SEO fiquem espalhados pelo código ou desatualizados em relação ao
conteúdo real das páginas.

### V. Backend Tipado, Migrável e Sem Lógica em Rotas
O stack de backend é fixo: Python, FastAPI, Pydantic, SQLAlchemy e Alembic —
nenhuma dependência adicional de framework web, ORM ou ferramenta de migração
MUST ser introduzida sem emenda a esta constituição. Toda fronteira de entrada e
saída da API (request/response) MUST ser tipada e validada por um modelo
Pydantic nomeado — dados aceitos ou retornados como `dict`/`Any` livre são
proibidos. Toda mudança de schema do banco de dados MUST ser acompanhada de uma
migração Alembic versionada; alterações diretas no schema fora do fluxo de
migração são proibidas. Rotas FastAPI MUST permanecer finas: MUST NOT conter
lógica de negócio, consultas complexas ou regras de domínio — essas
responsabilidades pertencem a uma camada de serviço dedicada, testável
independentemente do transporte HTTP. Acesso ao banco de dados MUST passar
exclusivamente pelos modelos SQLAlchemy — consultas SQL cruas fora dessa camada
são proibidas salvo exceção documentada.

**Rationale**: tipagem estrita via Pydantic nas fronteiras da API espelha a
Regra I no frontend e elimina uma classe inteira de bugs de contrato entre
cliente e servidor; migrações obrigatórias via Alembic garantem que o schema do
banco seja sempre reproduzível e auditável; rotas finas com lógica isolada em
serviços mantêm a API testável e evitam que regras de negócio fiquem
espalhadas e acopladas ao framework web.

## Restrições Tecnológicas

O stack de frontend é fixo: React 19, TypeScript, Vite como build tool,
TailwindCSS para estilização e react-router para roteamento client-side —
nenhuma migração de framework, bundler, meta-framework (Next.js, Remix, CRA,
etc.) ou biblioteca de rotas MUST ocorrer sem emenda a esta constituição. Toda
navegação entre páginas internas MUST usar react-router, preservando
navegação client-side contínua, sem recarregamento completo de página e sem
abrir novas abas. TailwindCSS MUST ser configurado (via `tailwind.config`) para
consumir exclusivamente os tokens de cor, tipografia e espaçamento definidos em
`design-system.md`; classes utilitárias com valores arbitrários fora desses
tokens MUST ser evitadas. Frameworks de CSS-in-JS ou UI kits de componentes de
terceiros (ex.: MUI, Chakra, Bootstrap) MUST NOT ser introduzidos, pois
violariam o limite de dependências da Regra II. Ícones MUST vir exclusivamente
da biblioteca de ícones única já adotada pelo projeto — não MUST haver mistura
de múltiplas bibliotecas de ícones.

O stack de backend é fixo: Python com FastAPI como framework web, Pydantic para
validação e serialização, SQLAlchemy como ORM e Alembic para migrações de
schema — nenhuma migração para outro framework web, ORM ou ferramenta de
migração MUST ocorrer sem emenda a esta constituição. React e o restante do
stack de frontend MUST permanecer exclusivos ao frontend; Python e o stack de
backend MUST permanecer exclusivos ao backend — nenhum dos dois lados MUST
assumir responsabilidades do outro.

## Fluxo de Desenvolvimento e Revisão

Toda revisão de código (PR ou autorrevisão antes de merge) MUST verificar
explicitamente:
- `tsconfig.json` mantém `strict: true` e nenhum `any` implícito foi introduzido;
- nenhum class component foi adicionado; props novas têm interface nomeada em
  `types.ts`;
- nenhuma lógica de negócio vazou para dentro de um componente de UI;
- nenhuma customização de conteúdo estático/apresentacional foi feita fora de
  `src/config.ts`, e nenhum dado de domínio dinâmico (opiniões, comentários,
  notas, perfis, rankings) foi hardcoded em `config.ts` em vez de vir da API;
- nenhuma dependência nova foi adicionada fora de
  React/TypeScript/Vite/TailwindCSS/react-router/ícones sem emenda
  constitucional prévia;
- navegação entre páginas internas usa react-router, sem recarregamento
  completo de página nem abertura de nova aba;
- o componente foi verificado visualmente/funcionalmente em 320px de largura;
- valores de cor/tipografia/espaçamento têm origem em `design-system.md`, e
  classes Tailwind usadas não recorrem a valores arbitrários fora dos tokens;
- links têm `aria-label`, imagens têm `alt`, e contraste atende WCAG AA;
- páginas novas ou alteradas mantêm dados estruturados e meta tags corretos;
- toda fronteira de request/response da API tem um modelo Pydantic nomeado, sem
  `dict`/`Any` livre;
- toda mudança de schema do banco de dados tem uma migração Alembic
  correspondente;
- nenhuma lógica de negócio foi adicionada diretamente em uma rota FastAPI —
  está em uma camada de serviço;
- nenhum acesso ao banco de dados contorna os modelos SQLAlchemy;
- nenhuma dependência nova de backend foi adicionada fora de
  Python/FastAPI/Pydantic/SQLAlchemy/Alembic sem emenda constitucional prévia.

Qualquer violação encontrada MUST bloquear o merge até ser corrigida ou até que
uma emenda formal a esta constituição autorize a exceção.

## Governance

Esta constituição prevalece sobre qualquer prática, convenção informal ou
preferência individual em conflito. Emendas exigem: (1) proposta escrita do
que muda e por quê, (2) atualização da versão conforme a política de
versionamento semântico abaixo, e (3) atualização do `Sync Impact Report` no
topo deste arquivo na mesma alteração.

Versionamento semântico aplicado à constituição:
- MAJOR: remoção ou redefinição incompatível de um princípio existente;
- MINOR: adição de um novo princípio ou expansão material de orientação
  existente;
- PATCH: esclarecimentos, correções de texto ou refinamentos não-semânticos.

Toda revisão de código MUST confirmar conformidade com os princípios acima
antes do merge, conforme detalhado em "Fluxo de Desenvolvimento e Revisão".
Complexidade adicional (nova dependência, nova camada de abstração, desvio do
design system) MUST ser justificada explicitamente na descrição do PR ou
rejeitada.

**Version**: 3.0.0 | **Ratified**: 2026-09-07 | **Last Amended**: 2026-09-07
