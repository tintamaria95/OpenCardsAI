module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react-hooks/recommended',
    "plugin:react/recommended"
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
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
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  settings: {
    "react": {
      "version": "detect"
    }
  }
}
