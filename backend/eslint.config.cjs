const { FlatCompat }   = require('@eslint/eslintrc');
const { configs }      = require('@eslint/js');
const tsParser         = require('@typescript-eslint/parser');
const tsPlugin         = require('@typescript-eslint/eslint-plugin');
const prettierPlugin   = require('eslint-plugin-prettier');

const compat = new FlatCompat({
  recommendedConfig: configs.recommended,
  baseDirectory: __dirname
});

module.exports = [
  // 1) Ignorar lo generado y folders externos
  { ignores: ['node_modules/**', 'dist/**', 'prisma/**'] },

  // 2) “Extender” las configs clásicas
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ),

  // 3) Plugins, parser y reglas extra
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ]
    }
  }
];