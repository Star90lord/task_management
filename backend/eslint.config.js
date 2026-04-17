export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      eslint: {},
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: 'next|req|res|err' }],
      'no-console': 'off',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'only-multiline'],
    },
  },
];
