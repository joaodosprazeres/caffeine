module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react-refresh'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  overrides: [
    {
      // Unica fonte de verdade da paleta: aqui os hexadecimais sao o ponto.
      files: ['tailwind.config.ts'],
      rules: { 'no-restricted-syntax': 'off' },
    },
  ],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'error',
    // Tokens de design: ver design-system.md. O theme do Tailwind e `replace`,
    // entao tokens fora da paleta ja nao compilam; valores arbitrarios, nao.
    // `npm run check:tokens` cobre o mesmo no CI (e tambem o index.html).
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/(?:^|[\\s])-?[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\\[[^\\]]+\\]/]',
        message:
          'Valor arbitrario do Tailwind: use o token mais proximo da escala (design-system.md).',
      },
      {
        selector: 'TemplateElement[value.raw=/(?:^|[\\s])-?[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\\[[^\\]]+\\]/]',
        message:
          'Valor arbitrario do Tailwind: use o token mais proximo da escala (design-system.md).',
      },
      {
        selector: 'Literal[value=/#[0-9a-fA-F]{3,8}/]',
        message:
          'Cor hexadecimal: use um token da paleta (coffee-*, amber-*, red-600, green-600, white).',
      },
      {
        selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}/]',
        message:
          'Cor hexadecimal: use um token da paleta (coffee-*, amber-*, red-600, green-600, white).',
      },
    ],
  },
};
