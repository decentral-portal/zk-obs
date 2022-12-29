/* eslint-disable no-undef */
module.exports = {
  root: true,
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
    jest: true,
  },
  'extends': [
    // "prettier",
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@darraghor/nestjs-typed/recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    project: 'tsconfig.json',
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    '@typescript-eslint',
    // "@darraghor/nestjs-typed"
  ],
  'ignorePatterns': ['node_modules/**/*', 'build/**/*'],
  'rules': {
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    'prefer-const': 'warn',
    'no-empty-function': 'warn',
    'no-console': 'warn',
    "indent": ["error", 2, { "SwitchCase": 1, "ignoredNodes": ["PropertyDefinition"] }],
    // 'indent': 'off',
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  },
//   'overrides': [
//     {
//       files: ['*.ts', '*.tsx'], // Your TypeScript files extension

//       // As mentioned in the comments, you should extend TypeScript plugins here,
//       // instead of extending them outside the `overrides`.
//       // If you don't want to extend any rules, you don't need an `extends` attribute.
//       extends: [
//         'plugin:@typescript-eslint/recommended',
//         'plugin:@typescript-eslint/recommended-requiring-type-checking',
//       ],

//       parserOptions: {
//         project: ['./tsconfig.json'], // Specify it only for TypeScript files
//       },
//     },
//   ],
};
