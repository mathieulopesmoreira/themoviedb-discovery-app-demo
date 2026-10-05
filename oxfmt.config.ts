import { defineConfig } from 'oxfmt';

export default defineConfig({
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  ignorePatterns: ['dist/**', 'coverage/**', 'api/**'],
});
