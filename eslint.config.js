// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(eslint.configs.recommended, {
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  extends: [
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_+$',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_+$',
        destructuredArrayIgnorePattern: '^_+$',
        varsIgnorePattern: '^_+$',
        ignoreRestSiblings: true,
        reportUsedIgnorePattern: true,
      },
    ],
  },
});
