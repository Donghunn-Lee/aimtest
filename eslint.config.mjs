import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['dist'] },

  { files: ['**/*.{js,mjs,cjs,ts,mts,jsx,tsx}'] },

  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,

  {
    plugins: {
      prettier: pluginPrettier,
      'react-hooks': pluginReactHooks,
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'prettier/prettier': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^react$', '^react\\u0000$', '^react/', '^@?\\w'],
            ['^@/'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
];
