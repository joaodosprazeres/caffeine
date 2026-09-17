# Feature Specification: Mini Rede Social de Opiniões sobre Cafés

**Feature Branch**: `001-coffee-opinions-social`

**Created**: 2026-09-07

**Status**: Draft

**Input**: User description: "Construir uma Mini Rede Social de compartilhamento de opiniões sobre cafés. PROBLEMA: Não há uma forma de saber os melhores cafés para se comprar ou pedir em cafeterias sem que seja a pontuação que o café tem pela BSCA, a ABIC ou o concurso Cup of Excellence. Esta mini rede social se propõe a ser uma referência onde os seus usuários possam postar de forma muito simples e rápida sua opinião sobre cafés, inclusive ranqueando os próprios cafés experimentados, e que visitantes possam consultar os cafés mais apreciados indicados pelos usuários. USUÁRIOS: 1. Visitante — pode consultar opiniões específicas de algum usuário sobre um café; pode consultar o ranking de um usuário; e pode consultar o consolidado de todos os usuários de um café específico ou o ranking geral dos usuários da mini rede social. 2. Usuários — tem seu perfil; postam opiniões de cafés que beberam informando o nome do café, o nome do produtor, o nome do grão especial e a torra, além de sua opinião. O usuário também pode ranquear os próprios cafés tomados. CRITÉRIOS DE ACEITAÇÃO: Página carrega em menos de 2 segundos em conexão 3G; Funciona em telas a partir de 320px de largura; Todos os links abrem em nova aba; O projeto compila sem erros TypeScript com strict mode ativado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usuário publica uma opinião sobre um café (Priority: P1)

Um usuário autenticado, logo após provar um café, quer registrar sua impressão de forma rápida:
informa o nome do café, o produtor, o grão especial, a torra, e escreve sua opinião em texto livre.
A opinião fica visível publicamente assim que publicada.

**Why this priority**: Sem opiniões publicadas não existe conteúdo para consolidar, ranquear ou
consultar — esta é a ação que alimenta todo o resto da rede.

**Independent Test**: Pode ser testado publicando uma opinião completa e verificando que ela
aparece imediatamente na página pública do usuário e na página do café.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado em seu perfil, **When** ele preenche nome do café, produtor,
   grão especial, torra e opinião e confirma a publicação, **Then** a opinião passa a ser exibida
   publicamente associada a esse usuário e a esse café.
2. **Given** um usuário tentando publicar uma opinião, **When** algum campo obrigatório (nome do
   café, produtor, grão, torra ou opinião) está vazio, **Then** o sistema impede a publicação e
   indica quais campos precisam ser preenchidos.

---

### User Story 2 - Usuário comenta e dá sua nota na opinião de outro usuário (Priority: P2)

Um usuário autenticado lê a opinião que outro usuário publicou sobre um café e quer reagir a ela:
escreve um comentário e/ou dá sua própria nota para aquele café, mesmo sem ter publicado uma
opinião própria sobre ele.

**Why this priority**: É o mecanismo que transforma a rede em algo social e gera o sinal
quantitativo (notas de terceiros) que sustenta o "café mais apreciado" — mais rápido de fazer do
que publicar uma opinião completa, e por isso tende a gerar muito mais engajamento e dados.

**Independent Test**: Pode ser testado, com uma opinião já publicada por um usuário, autenticando
como um segundo usuário, comentando e dando uma nota nessa opinião, e confirmando que ambos ficam
visíveis publicamente associados a esse segundo usuário.

**Acceptance Scenarios**:

1. **Given** uma opinião publicada por um Usuário A, **When** um Usuário B autenticado (diferente
   do autor) escreve um comentário nela, **Then** o comentário passa a ser exibido publicamente
   junto à opinião, atribuído ao Usuário B.
2. **Given** uma opinião publicada por um Usuário A, **When** um Usuário B autenticado (diferente
   do autor) dá uma nota ao café descrito nessa opinião, **Then** a nota é registrada e passa a
   contar na apreciação consolidada daquele café.
3. **Given** uma opinião publicada por um Usuário A, **When** o próprio Usuário A tenta comentar ou
   dar nota em sua própria opinião, **Then** o sistema impede a ação.
4. **Given** um Usuário B que já deu uma nota a uma opinião, **When** ele dá uma nova nota à mesma
   opinião, **Then** a nota anterior é substituída pela nova, sem gerar duplicidade.

---

### User Story 3 - Visitante descobre os cafés mais bem avaliados da rede (Priority: P3)

Um visitante sem conta quer saber, de forma confiável, quais são os cafés mais apreciados pela
comunidade — tanto de forma geral quanto para um café específico que está considerando comprar.

**Why this priority**: É a proposta de valor central do produto — resolver o problema descrito
("não há uma forma de saber os melhores cafés") sem exigir cadastro. Depende do sinal gerado pelas
User Stories 1 e 2 já existir.

**Independent Test**: Pode ser testado acessando a área pública sem login e confirmando que é
possível ver o ranking geral de cafés e o consolidado de opiniões de um café específico.

**Acceptance Scenarios**:

1. **Given** um visitante sem login, **When** ele acessa o ranking geral da rede, **Then** vê uma
   lista de cafés ordenada pela apreciação consolidada dos usuários.
2. **Given** um visitante sem login, **When** ele busca um café específico, **Then** vê o
   consolidado de todas as opiniões publicadas sobre esse café por todos os usuários.

---

### User Story 4 - Usuário organiza seu ranking pessoal de cafés (Priority: P4)

Um usuário autenticado, após ter publicado opiniões sobre vários cafés que já experimentou, quer
ordená-los por preferência pessoal, criando seu próprio ranking.

**Why this priority**: Complementa as opiniões e as notas de terceiros com um sinal comparativo
por usuário, que também alimenta o ranking geral da rede (User Story 3) — mas a rede já entrega
valor com opiniões, comentários e notas avulsas mesmo antes de existir ranqueamento pessoal.

**Independent Test**: Pode ser testado marcando a ordem de preferência entre dois ou mais cafés já
avaliados pelo usuário e confirmando que essa ordem fica salva e visível no perfil dele.

**Acceptance Scenarios**:

1. **Given** um usuário que já publicou opiniões sobre dois ou mais cafés, **When** ele define a
   ordem de preferência entre eles, **Then** essa ordem é salva como o ranking pessoal dele e
   fica visível em seu perfil.
2. **Given** um usuário que ainda não publicou nenhuma opinião, **When** ele tenta montar um
   ranking pessoal, **Then** o sistema informa que é necessário publicar opiniões antes de
   ranquear cafés.

---

### User Story 5 - Visitante consulta o perfil de um usuário específico (Priority: P5)

Um visitante quer ver o que um usuário específico (por exemplo, alguém que segue ou confia) já
opinou sobre cafés e como esse usuário ranqueia os próprios cafés experimentados.

**Why this priority**: Agrega valor de descoberta social, mas depende inteiramente das User
Stories 1 e 4 já existirem para ter conteúdo a mostrar.

**Independent Test**: Pode ser testado acessando o perfil público de um usuário existente sem
login e conferindo que suas opiniões e seu ranking pessoal aparecem corretamente.

**Acceptance Scenarios**:

1. **Given** um visitante sem login, **When** ele acessa o perfil público de um usuário, **Then**
   vê a lista de opiniões publicadas por esse usuário e o ranking pessoal dele, se existir.

---

### Edge Cases

- O que acontece quando um usuário tenta publicar uma opinião sem preencher todos os campos
  obrigatórios (nome do café, produtor, grão especial, torra, opinião)?
- Como o sistema trata um café com apenas uma opinião publicada ao exibi-lo no consolidado ou no
  ranking geral (sinal estatístico fraco)?
- O que um visitante vê ao acessar o perfil de um usuário que ainda não publicou nenhuma opinião
  ou não definiu um ranking pessoal?
- Como o sistema se comporta ao carregar uma lista longa de opiniões em uma conexão 3G lenta, para
  não violar o critério de carregamento em menos de 2 segundos?
- O que acontece quando dois usuários digitam o nome do mesmo café de forma ligeiramente diferente
  (ex.: variação de grafia no nome do produtor)?
- O que acontece quando o autor de uma opinião tenta comentar ou dar nota na própria opinião?
- Como o sistema trata um usuário que tenta dar mais de uma nota à mesma opinião (deve substituir
  a nota anterior, não duplicar)?
- Como uma opinião sem nenhum comentário ou nota de terceiros aparece no consolidado do café e no
  ranking geral?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um Visitante, sem autenticação, consulte as opiniões
  publicadas por um usuário específico sobre um café específico.
- **FR-002**: O sistema MUST permitir que um Visitante, sem autenticação, consulte o ranking
  pessoal de um usuário específico.
- **FR-003**: O sistema MUST permitir que um Visitante, sem autenticação, consulte o consolidado
  de todas as opiniões publicadas por todos os usuários sobre um café específico.
- **FR-004**: O sistema MUST permitir que um Visitante, sem autenticação, consulte o ranking geral
  de cafés da rede, agregando o sinal de todos os usuários.
- **FR-005**: O sistema MUST prover a cada Usuário um perfil público, visível a visitantes, que
  reúne suas opiniões publicadas e seu ranking pessoal.
- **FR-006**: O sistema MUST permitir que um Usuário publique uma opinião sobre um café informando
  nome do café, nome do produtor, nome do grão especial, torra e o texto da opinião.
- **FR-007**: O sistema MUST validar que nome do café, produtor, grão especial, torra e opinião
  estejam preenchidos antes de permitir a publicação, rejeitando o envio e indicando os campos
  pendentes quando algum estiver ausente.
- **FR-008**: O sistema MUST permitir que um Usuário monte e atualize um ranking pessoal ordenado
  contendo apenas cafés sobre os quais ele já publicou opinião.
- **FR-009**: O sistema MUST associar toda opinião publicada ao Usuário autor e exibi-la
  publicamente de forma atribuída a esse autor.
- **FR-010**: O sistema MUST permitir que qualquer Usuário autenticado, exceto o autor, comente em
  uma opinião publicada por outro Usuário.
- **FR-011**: O sistema MUST permitir que qualquer Usuário autenticado, exceto o autor, dê uma
  nota numérica ao café descrito em uma opinião publicada por outro Usuário, mesmo que ele próprio
  nunca tenha publicado uma opinião sobre esse café.
- **FR-012**: O sistema MUST impedir que o autor de uma opinião comente ou dê nota na própria
  opinião.
- **FR-013**: O sistema MUST aceitar no máximo uma nota por par (Usuário avaliador, opinião),
  substituindo a nota anterior desse usuário caso ele avalie novamente a mesma opinião.
- **FR-014**: O sistema MUST consolidar, em uma única visão por café, todas as opiniões, notas e
  comentários publicados que se referem ao mesmo café, usando nome do café + nome do produtor
  como identificador de correspondência.
- **FR-015**: O sistema MUST calcular um ranking geral de cafés combinando (a) a média das notas
  recebidas de outros usuários nas opiniões sobre cada café e (b) a posição de cada café nos
  rankings pessoais publicados pelos usuários — quanto maior a média de notas e quanto mais bem
  posicionado e frequente nos rankings pessoais, maior a posição do café no ranking geral.
- **FR-016**: O sistema MUST exigir que um visitante crie uma conta e autentique-se com
  usuário/e-mail e senha antes de publicar opiniões, comentar, dar notas ou montar um ranking
  pessoal; a consulta (leitura) MUST permanecer disponível sem autenticação.
- **FR-017**: O sistema MUST manter a navegação entre páginas internas (perfis, cafés, opiniões,
  rankings) dentro da mesma aba/janela, sem abrir novas abas, preservando a sensação de estar
  dentro de um único sistema web/aplicativo contínuo.
- **FR-018**: O sistema MUST manter a interface totalmente utilizável, sem perda de conteúdo ou
  funcionalidade, em telas a partir de 320px de largura.
- **FR-019**: O sistema MUST carregar a página inicial em menos de 2 segundos em uma conexão 3G.

### Key Entities

- **Usuário**: pessoa cadastrada na rede; possui perfil público, nome de exibição, lista de
  opiniões publicadas e um ranking pessoal de cafés já avaliados.
- **Café**: item avaliado pelos usuários; identificado pela combinação de nome do café e nome do
  produtor, e caracterizado por grão especial e torra. Grão especial e torra são informados a
  cada Opinião (podem variar entre lotes/safras); a exibição do Café usa os valores da Opinião
  mais recente como referência, não um valor fixo armazenado no próprio Café (ver data-model.md).
- **Opinião**: registro público criado por um Usuário sobre um Café, contendo o texto da opinião e
  a referência aos dados do café informados (grão especial, torra) e ao autor.
- **Comentário**: registro público criado por um Usuário (diferente do autor) em resposta a uma
  Opinião de outro Usuário, contendo texto livre.
- **Nota**: avaliação numérica dada por um Usuário (diferente do autor) a uma Opinião de outro
  Usuário, refletindo a apreciação desse avaliador pelo Café descrito naquela opinião; cada
  Usuário mantém no máximo uma Nota por Opinião.
- **Ranking Pessoal**: lista ordenada, mantida por um Usuário, dos Cafés sobre os quais ele já
  publicou Opinião, refletindo sua ordem de preferência.
- **Ranking Geral**: visão agregada, calculada a partir das Notas recebidas por cada Café e dos
  Rankings Pessoais de todos os Usuários, que ordena os Cafés da mais para a menos apreciada pela
  comunidade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário autenticado consegue publicar uma opinião completa sobre um café em menos
  de 1 minuto.
- **SC-002**: A página inicial fica visível e interativa em menos de 2 segundos em uma conexão 3G.
- **SC-003**: A interface permanece totalmente utilizável, sem quebra de layout ou perda de
  função, em qualquer tela a partir de 320px de largura.
- **SC-004**: Um visitante consegue chegar ao ranking geral de cafés da rede a partir da página
  inicial em no máximo 2 cliques.
- **SC-005**: Um visitante consegue localizar o consolidado de opiniões de um café específico sem
  precisar de instruções adicionais, em pelo menos 90% das tentativas observadas em teste de
  usabilidade.
- **SC-006**: O projeto compila sem nenhum erro de TypeScript com o modo strict habilitado.
- **SC-007**: Um usuário autenticado consegue comentar ou dar nota na opinião de outro usuário em
  menos de 30 segundos a partir do momento em que decide reagir.

## Assumptions

- Toda opinião publicada é pública e pode ser lida por qualquer visitante, sem exigência de login
  para leitura.
- "Torra" é tratada como uma categoria padronizada (por exemplo: clara, média, escura) para
  permitir comparação consistente entre opiniões de cafés diferentes.
- Não há moderação de conteúdo nesta primeira versão; conteúdo impróprio é tratado por processo
  manual fora do escopo desta especificação.
- Edição ou exclusão de opiniões, comentários e itens do ranking pessoal já publicados está fora
  do escopo desta primeira versão — esta versão cobre apenas criação, atualização de nota (por
  substituição, conforme FR-013) e consulta.
- A nota dada por outro usuário a uma opinião usa uma escala padronizada de 1 a 5, análoga a
  esquemas de avaliação comuns em apps de review.
- Um usuário pode publicar múltiplos comentários na mesma opinião (conversa), mas apenas uma nota
  vigente por opinião (substituída a cada nova avaliação).
- Não há limite superior definido para o número de opiniões por usuário ou de cafés distintos
  cadastrados nesta versão inicial.
- A persistência dos dados entre sessões e usuários é um requisito implícito da funcionalidade;
  a tecnologia de armazenamento é uma decisão de implementação, fora do escopo desta
  especificação.
