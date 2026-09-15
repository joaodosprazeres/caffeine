# Feature Specification: Perfil Social Visual e Rede de Seguidores

**Feature Branch**: `002-perfil-social-visual`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: "Aperfeiçoar a Interface do usuário do frontend para uma interface mais moderna, que possua imagens que remetam a grãos de café e xícara com café. Na página de Perfil do Usuário, defina uma imagem de cabeçalho padrão da aplicação, deixe um espaço para foto ou avatar do usuário e exiba parte das opiniões que o usuário já fez. Na sua página de perfil, o usuário pode rolar pelas opiniões já postadas e/ou cadastrar uma nova opinião. As opiniões devem possuir um thumbnail da imagem anexada quando do cadastro da opinião. Na página do perfil, o usuário também pode acessar uma lista de outros usuários que ele segue. Na página da Opinião, além dos campos já definidos, deve ser possível anexar uma foto da embalagem do café referente a opinião e a nota que usuário atribui ao café. Ao realizar o Login, o usuário vai para a página do seu Perfil. Ao cadastrar uma Opinião, o usuário retorna a página do seu perfil visualizando sua nova opinião dentre as outras. A partir da página do seu perfil, o usuário pode procurar por outros usuários para seguir, pode visualizar seu perfil e visualizar suas opiniões. O usuario pode ir para a página do ranking geral de todos os usuários. O usuário pode realizar logoff. A navegação entre pages deve ser intuitiva, com opções, ícones, botões bem intuitivos numa inferface moderna e aconchegante."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usuário chega ao próprio perfil após login e revisita suas opiniões (Priority: P1)

Um usuário autenticado quer, logo após entrar na rede, ver seu espaço pessoal: sua identidade visual
(avatar e capa), um resumo de quem ele é, e a lista das opiniões que já publicou, podendo rolar por
elas para reencontrar cafés que já avaliou.

**Why this priority**: É o destino imediato após autenticação e a tela mais visitada por um usuário
recorrente — sem ela funcionando bem, nenhuma das demais melhorias (seguir, nova opinião com foto) tem
onde viver.

**Independent Test**: Pode ser testado autenticando um usuário com opiniões previamente publicadas e
verificando que ele é levado diretamente ao próprio perfil, vendo capa, avatar (ou espaço reservado
para ele) e a lista rolável de suas opiniões, cada uma com o thumbnail da imagem anexada quando houver.

**Acceptance Scenarios**:

1. **Given** um usuário com credenciais válidas, **When** ele completa o login, **Then** é
   direcionado para a página do seu próprio perfil (não para a página inicial genérica).
2. **Given** um usuário em seu perfil com várias opiniões publicadas, **When** a página carrega,
   **Then** ele vê uma imagem de cabeçalho padrão da aplicação, um espaço para seu avatar (imagem
   própria ou um estado padrão quando não definido) e pode rolar pela lista de suas opiniões.
3. **Given** uma opinião que teve uma foto de embalagem anexada no momento do cadastro, **When** ela
   aparece na lista do perfil, **Then** um thumbnail dessa foto é exibido junto ao restante das
   informações da opinião.
4. **Given** uma opinião que não teve foto anexada, **When** ela aparece na lista do perfil, **Then**
   a ausência de thumbnail é tratada com uma apresentação consistente (sem espaço quebrado ou vazio
   mal-formatado).

---

### User Story 2 - Usuário publica uma opinião com foto da embalagem e sua nota, e retorna ao perfil (Priority: P1)

A partir do próprio perfil, o usuário decide registrar uma nova opinião: preenche os campos já
existentes (café, produtor, grão especial, torra, texto), anexa uma foto da embalagem do café e
atribui a nota que ele dá para aquele café. Ao publicar, ele retorna ao seu perfil e vê a nova
opinião já refletida entre as demais.

**Why this priority**: É a ação que gera o conteúdo visual (fotos) que enriquece toda a experiência
social e mantém o valor central do produto (registrar e ranquear cafés) — sem ela, o perfil fica
sem novo conteúdo.

**Independent Test**: Pode ser testado, a partir do perfil, iniciando o cadastro de uma opinião,
preenchendo os campos, anexando uma imagem e escolhendo uma nota, publicando, e confirmando que a
navegação retorna ao perfil com a nova opinião visível entre as demais.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado em seu perfil, **When** ele opta por cadastrar uma nova opinião,
   **Then** o formulário exibido mantém os campos já existentes e adiciona a opção de anexar uma foto
   da embalagem do café e de atribuir uma nota ao café.
2. **Given** o formulário de nova opinião preenchido, com ou sem foto anexada, **When** o usuário
   confirma a publicação, **Then** a opinião é criada com sucesso e o usuário retorna à página do seu
   perfil, vendo a nova opinião listada entre as opiniões já existentes.
3. **Given** o formulário de nova opinião, **When** o usuário tenta anexar um arquivo que não é uma
   imagem, **Then** o sistema rejeita o anexo e informa o motivo, sem impedir a publicação da opinião
   sem foto.
4. **Given** o formulário de nova opinião, **When** o usuário não atribui nenhuma nota, **Then** a
   opinião ainda pode ser publicada normalmente (a nota do autor é opcional).

---

### User Story 3 - Usuário descobre e segue outros usuários a partir do próprio perfil (Priority: P2)

A partir do seu perfil, o usuário quer encontrar outras pessoas que também compartilham opiniões
sobre café, seguir aquelas que lhe interessam, e depois consultar rapidamente a lista de quem ele já
segue, podendo visitar o perfil e as opiniões dessas pessoas.

**Why this priority**: Transforma o produto de uma coleção de opiniões isoladas em uma rede social de
fato, mas depende de perfis e opiniões (User Stories 1 e 2) já existirem para fazer sentido.

**Independent Test**: Pode ser testado, a partir do perfil de um usuário autenticado, buscando outro
usuário existente pelo nome ou identificador, seguindo-o, e confirmando que ele passa a aparecer na
lista de "usuários que sigo" acessível pelo próprio perfil, com acesso ao perfil e às opiniões dessa
pessoa.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado em seu perfil, **When** ele usa a busca de usuários, **Then** vê
   uma lista de usuários correspondentes que ele pode optar por seguir.
2. **Given** um usuário autenticado, **When** ele segue outro usuário, **Then** esse usuário passa a
   aparecer na lista de usuários que ele segue, acessível a partir do seu perfil.
3. **Given** um usuário que já segue outra pessoa, **When** ele acessa a lista de quem segue e
   seleciona essa pessoa, **Then** é levado ao perfil público dela, podendo ver as opiniões que ela
   publicou.
4. **Given** um usuário autenticado, **When** ele tenta seguir a si mesmo, **Then** o sistema impede a
   ação.
5. **Given** um usuário que já segue outra pessoa, **When** ele opta por deixar de segui-la, **Then**
   ela deixa de aparecer na lista de usuários que ele segue.

---

### User Story 4 - Usuário navega entre perfil, ranking geral e logoff de forma intuitiva (Priority: P3)

Em qualquer página autenticada, o usuário quer alternar rapidamente entre seu perfil, o ranking geral
da rede, e encerrar sua sessão, através de uma navegação visualmente clara e consistente, com tema
visual de café (grãos, xícara) em vez de uma interface genérica.

**Why this priority**: É uma melhoria transversal de usabilidade e identidade visual que se apoia em
todas as páginas já existentes; entrega valor mesmo isoladamente, mas não bloqueia as demais
funcionalidades.

**Independent Test**: Pode ser testado navegando, a partir de qualquer página autenticada, para o
próprio perfil, para o ranking geral, e realizando logoff, confirmando que cada ação é alcançável por
no máximo dois toques/cliques a partir de um menu de navegação sempre visível.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado em qualquer página, **When** ele observa a navegação principal,
   **Then** vê opções claramente identificadas (com ícone e rótulo) para "Meu perfil", "Ranking
   geral" e "Sair".
2. **Given** um usuário autenticado, **When** ele aciona a opção de logoff, **Then** sua sessão é
   encerrada e ele é levado a uma página acessível sem autenticação.
3. **Given** um usuário em qualquer página da aplicação, **When** a tela é exibida a partir de 320px
   de largura, **Then** a navegação permanece utilizável, sem sobreposição ou corte de opções.

---

### Edge Cases

- O que acontece quando o usuário não definiu avatar próprio? O espaço reservado exibe um estado
  padrão (placeholder com tema café) em vez de ficar vazio ou quebrado.
- Como o sistema lida com uma tentativa de anexar uma imagem muito grande na opinião ou no avatar? A
  ação é rejeitada com mensagem clara, sem travar o formulário nem perder o restante dos dados já
  preenchidos.
- O que acontece quando um usuário busca por um nome que não corresponde a nenhum outro usuário? A
  busca informa claramente que nada foi encontrado, sem erro técnico.
- O que acontece quando um usuário tenta acessar a lista de "quem eu sigo" sem seguir ninguém ainda?
  A lista é exibida vazia com uma mensagem convidando a buscar usuários para seguir.
- O que acontece quando um usuário visita o perfil de outra pessoa? Ele vê a capa padrão, o avatar,
  as opiniões públicas dessa pessoa, mas as ações de "cadastrar nova opinião" e "editar avatar" ficam
  disponíveis apenas no próprio perfil.
- O que acontece quando uma opinião antiga (publicada antes desta funcionalidade existir) não possui
  foto de embalagem nem nota do autor? Ela continua sendo exibida normalmente, apenas sem esses dados
  opcionais.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao concluir o login com sucesso, o sistema MUST redirecionar o usuário para a página do
  seu próprio perfil.
- **FR-002**: A página de perfil MUST exibir uma imagem de cabeçalho padrão da aplicação, igual para
  todos os perfis que não a personalizam.
- **FR-003**: A página de perfil MUST reservar um espaço visível para foto/avatar do usuário,
  exibindo um estado padrão com tema café quando nenhuma imagem própria tiver sido definida.
- **FR-004**: O usuário autenticado MUST poder definir ou substituir sua própria foto/avatar a
  partir do seu perfil.
- **FR-005**: A página de perfil MUST exibir a lista de opiniões publicadas pelo usuário dono do
  perfil, permitindo rolagem contínua pela lista à medida que existem mais opiniões.
- **FR-006**: Cada opinião listada MUST exibir um thumbnail da imagem anexada no momento do cadastro,
  quando essa imagem existir, e uma apresentação consistente quando não existir.
- **FR-007**: A partir da própria página de perfil, o usuário autenticado MUST poder iniciar o
  cadastro de uma nova opinião.
- **FR-008**: O formulário de cadastro de opinião MUST manter os campos já existentes (nome do café,
  produtor, grão especial, torra, texto da opinião) e adicionar a opção de anexar uma foto da
  embalagem do café referente à opinião, de forma opcional.
- **FR-009**: O formulário de cadastro de opinião MUST permitir que o autor atribua, de forma
  opcional, uma nota ao café no mesmo momento da publicação da opinião.
- **FR-010**: Após a publicação bem-sucedida de uma nova opinião, o sistema MUST redirecionar o
  usuário para a página do seu próprio perfil, exibindo a nova opinião entre as já existentes.
- **FR-011**: O sistema MUST validar que apenas arquivos de imagem são aceitos como foto de
  embalagem ou avatar, rejeitando outros tipos de arquivo com uma mensagem de erro compreensível.
- **FR-012**: A partir da página de perfil, o usuário autenticado MUST poder buscar outros usuários
  da rede por nome de usuário ou nome de exibição.
- **FR-013**: O usuário autenticado MUST poder seguir outro usuário a partir dos resultados dessa
  busca ou do perfil público de terceiros.
- **FR-014**: O usuário autenticado MUST poder deixar de seguir um usuário que já segue.
- **FR-015**: O sistema MUST impedir que um usuário siga a si mesmo.
- **FR-016**: A página de perfil MUST oferecer acesso a uma lista dos usuários que o dono do perfil
  segue, com um estado vazio explicativo quando essa lista não tiver itens.
- **FR-017**: A partir da lista de usuários seguidos ou dos resultados de busca, o usuário MUST poder
  navegar para o perfil público de outro usuário e visualizar as opiniões publicadas por ele.
- **FR-018**: A navegação principal MUST oferecer, em qualquer página acessada por um usuário
  autenticado, acesso direto ao próprio perfil, ao ranking geral e à ação de logoff, identificados
  por ícone e rótulo.
- **FR-019**: A ação de logoff MUST encerrar a sessão do usuário e conduzi-lo a uma página acessível
  sem autenticação.
- **FR-020**: Toda a interface (perfil, navegação, formulário de opinião, listas) MUST adotar uma
  identidade visual coerente com o tema de café (incluindo referências visuais a grãos de café e
  xícara de café), permanecendo utilizável a partir de 320px de largura de viewport.
- **FR-021**: A nota atribuída pelo autor a uma opinião no momento do cadastro MUST ser exibida como
  parte dessa opinião e MUST NOT ser contabilizada como uma nota de terceiro na apreciação
  consolidada (nota média) do café, preservando a regra existente de que o autor não pontua a
  própria opinião para fins de ranking.

### Key Entities *(include if feature involves data)*

- **Usuario**: passa a incluir uma imagem de avatar opcional definida pelo próprio usuário. A imagem
  de cabeçalho do perfil é um recurso único e padrão da aplicação, não um atributo por usuário.
- **Opiniao**: passa a incluir uma imagem opcional da embalagem do café referente à opinião e uma
  nota opcional atribuída pelo próprio autor no momento da publicação, exibida junto à opinião mas
  mantida separada da nota média consolidada do café.
- **Relação de Seguir**: representa que um usuário (seguidor) escolheu acompanhar outro usuário
  (seguido); um usuário não pode seguir a si mesmo; a relação pode ser desfeita.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Após o login, 100% dos usuários chegam diretamente à página do próprio perfil, sem
  passar por uma tela intermediária.
- **SC-002**: Um usuário consegue publicar uma nova opinião com foto anexada e nota, e voltar a vê-la
  em seu perfil, em menos de 1 minuto de interação.
- **SC-003**: A partir do próprio perfil, um usuário consegue encontrar outro usuário existente e
  seguir seu perfil em até 3 ações (buscar, selecionar, seguir).
- **SC-004**: Todas as páginas principais (perfil, opinião, busca de usuários, ranking geral)
  permanecem utilizáveis e sem elementos sobrepostos em telas a partir de 320px de largura.
- **SC-005**: 90% dos usuários em teste de usabilidade identificam corretamente, sem instrução prévia,
  onde clicar para ver seu perfil, acessar o ranking geral e sair da conta.

## Assumptions

- A imagem de cabeçalho do perfil é um único recurso visual padrão da aplicação (tema café), igual
  para todos os usuários nesta primeira versão — personalização de capa por usuário fica fora de
  escopo.
- O avatar do usuário é uma imagem única substituível (sem histórico de versões nem múltiplas fotos).
- "Rolar pelas opiniões" no perfil é satisfeito por uma lista contínua (rolagem/paginação
  incremental) dentro da própria página de perfil, sem exigir navegação para outra página para ver
  mais itens.
- A nota atribuída pelo autor no cadastro da opinião é conceitualmente distinta das notas dadas por
  terceiros à opinião (funcionalidade já existente): ela expressa a avaliação pessoal do autor sobre
  o café e é exibida junto à opinião, mas não substitui nem se soma ao mecanismo existente de notas
  de terceiros que alimenta a nota média consolidada — isso preserva a regra de negócio já existente
  de que o autor não pode pontuar a própria opinião para fins de ranking.
- Seguir um usuário não exige aprovação da pessoa seguida (modelo de seguir aberto, como a maioria
  das redes sociais de conteúdo público) — não há conceito de "solicitação de seguir" pendente nesta
  versão.
- Fotos anexadas (avatar e embalagem de café) têm um limite de tamanho de arquivo razoável para
  manter o carregamento rápido mesmo em conexão 3G, consistente com o critério de aceitação já
  existente de carregamento em menos de 2 segundos.
- Usuários visitantes (sem login) continuam sem acesso às ações de seguir, cadastrar opinião ou
  editar avatar; podem apenas visualizar perfis públicos, opiniões e o ranking geral, como já previsto
  na especificação anterior.
