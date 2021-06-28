module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.eslint.json'
  },
  ignorePatterns: [
    'dist/**/*'
  ],
  plugins: [
    'simple-import-sort'
  ],
  rules: {
    'no-void': 'off',
    'simple-import-sort/imports': 'error',
    'object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
}
