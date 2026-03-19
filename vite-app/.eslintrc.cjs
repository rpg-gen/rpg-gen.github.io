module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
  },
  overrides: [
    {
      files: ['src/configs/**/*', 'src/types/**/*'],
      rules: {
        'max-lines': 'off',
      },
    },
  ],
}
