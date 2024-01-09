module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked'
  ],
  parser: '@typescript-eslint/parser',
  rules: {
    "@typescript-eslint/naming-convention":[
      "error",
      {
        "format": ["camelCase", "PascalCase"],
        "leadingUnderscore": "allow",
        "selector": "variable",
        "trailingUnderscore": "allow"
      },
      {
        "format": ["camelCase", "PascalCase"],
        "leadingUnderscore": "allow",
        "selector": "function",
        "trailingUnderscore": "allow"
      },
      {
        "format": ["PascalCase"],
        "leadingUnderscore": "allow",
        "selector": "typeLike",
        "trailingUnderscore": "allow"
      }
   ]
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  }
}
