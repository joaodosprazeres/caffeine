# Design System: Caffeine

Fonte única de verdade para cores, tipografia e espaçamento (Constitution Principle III).
`frontend/tailwind.config.ts` MUST consumir exclusivamente estes tokens.

## Cores

Paleta inspirada em café: tons quentes de marrom/creme para marca, com uma cor de destaque
(âmbar) para ações primárias. Todos os pares texto/fundo abaixo atingem contraste WCAG AA
(≥ 4.5:1 para texto normal).

| Token | Hex | Uso |
|---|---|---|
| `coffee-950` | `#1c130d` | texto principal sobre fundo claro |
| `coffee-900` | `#2c1c12` | headings, texto de alta ênfase |
| `coffee-700` | `#5a3d2b` | texto secundário |
| `coffee-500` | `#8a5a3b` | bordas, ícones neutros |
| `coffee-300` | `#c9a789` | bordas suaves, divisores |
| `coffee-100` | `#f1e4d8` | fundo de cartão/seção alternada |
| `coffee-50`  | `#faf6f1` | fundo de página |
| `amber-600`  | `#b5680d` | ação primária (botões, links de destaque) — 4.5:1 sobre `coffee-50` |
| `amber-700`  | `#94540a` | hover/active de ação primária |
| `white`      | `#ffffff` | texto sobre fundo `amber-600`/`coffee-900` |
| `red-600`    | `#c0392b` | erro/validação |
| `green-600`  | `#1e7e42` | sucesso/confirmação |

## Tipografia

- Fonte: font stack do sistema (`ui-sans-serif, system-ui, -apple-system, sans-serif`) — sem
  fonte externa, para não introduzir dependência de runtime além da Regra II.
- Escala (`fontSize`):

| Token | Tamanho | Uso |
|---|---|---|
| `xs`   | 0.75rem (12px) | metadados, timestamps |
| `sm`   | 0.875rem (14px) | texto secundário, labels |
| `base` | 1rem (16px) | corpo de texto |
| `lg`   | 1.125rem (18px) | texto de destaque |
| `xl`   | 1.25rem (20px) | subtítulos de card |
| `2xl`  | 1.5rem (24px) | títulos de seção |
| `3xl`  | 1.875rem (30px) | título de página |

- Peso: `normal` (400) para corpo, `semibold` (600) para headings/labels de ênfase, `bold` (700)
  reservado para títulos de página.

## Espaçamento

Escala em múltiplos de 4px (`spacing` do Tailwind, valores-base do preset): `1` (4px), `2`
(8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px), `12` (48px), `16` (64px). Nenhum valor
arbitrário fora dessa escala (ex.: `p-[13px]`) MUST ser usado.

## Breakpoints

Mobile-first a partir de 320px; breakpoints padrão do Tailwind (`sm: 640px`, `md: 768px`,
`lg: 1024px`) usados apenas para melhorar layouts maiores, nunca como requisito mínimo de uso.

## Raio e sombra

- `rounded-md` (6px) para inputs/botões; `rounded-lg` (8px) para cards.
- Sombra única `shadow-sm` para elevar cards sobre `coffee-50`; evitar sombras múltiplas/custom.
