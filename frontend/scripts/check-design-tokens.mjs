#!/usr/bin/env node
/**
 * Garante que nenhum tamanho ou cor seja escrito direto no markup.
 * Tokens são definidos em design-system.md e espelhados em tailwind.config.ts.
 *
 * O theme do Tailwind é `replace` (não `extend`), então tokens fora da paleta
 * (`bg-gray-500`, `text-9xl`) já não compilam. O que o build NÃO barra são
 * valores arbitrários — `text-[13px]`, `bg-[#ff0000]` — e é isso que este
 * script cobre.
 */
import { readFileSync, globSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;

const ALVOS = ['src/**/*.{ts,tsx}', 'index.html'];

const REGRAS = [
  {
    nome: 'valor arbitrário',
    // utilitário do Tailwind seguido de colchete: text-[13px], bg-[#ff0000], p-[3px]
    re: /(?:^|[\s"'`])-?[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\[[^\]]+\]/g,
    dica: 'use o token mais próximo da escala (design-system.md), não um valor customizado',
  },
  {
    nome: 'cor hexadecimal',
    re: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b/g,
    dica: 'use um token da paleta (coffee-*, amber-*, red-600, green-600, white)',
  },
];

let falhas = 0;

const arquivos = ALVOS.flatMap((padrao) =>
  globSync(padrao, { cwd: RAIZ }).map((f) => join(RAIZ, f)),
);

for (const arquivo of arquivos) {
  const linhas = readFileSync(arquivo, 'utf8').split('\n');
  linhas.forEach((linha, i) => {
    for (const regra of REGRAS) {
      regra.re.lastIndex = 0;
      for (const m of linha.matchAll(regra.re)) {
        falhas += 1;
        console.error(
          `${relative(RAIZ, arquivo)}:${i + 1}  ${regra.nome}: ${m[0].trim()}\n` +
            `    ↳ ${regra.dica}`,
        );
      }
    }
  });
}

if (falhas > 0) {
  console.error(`\n✗ ${falhas} violação(ões) de design token.`);
  process.exit(1);
}
console.log(`✓ ${arquivos.length} arquivo(s) sem tamanhos ou cores hard-coded.`);
