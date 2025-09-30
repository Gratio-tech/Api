import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import { readFileSync } from 'fs';

const tsconfigJsonContent = readFileSync('./tsconfig.json', 'utf-8');
const tsconfigJson = JSON.parse(tsconfigJsonContent);

const normalizeWildcard = path => (path.endsWith('/*') ? path + '*' : path);

const aliases = Object.keys(tsconfigJson.compilerOptions.paths).map(normalizeWildcard);

export default tseslint.config(
  { ignores: ['dist', '.react-router'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': [
        'warn',
        {
          'distinctGroup': true,
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },
          'pathGroupsExcludedImportTypes': aliases.map(alias => ({
            pattern: alias,
            group: 'internal',
          })),
          'groups': ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'unknown', 'type', 'object'],
        },
      ],
    },
  }
);
