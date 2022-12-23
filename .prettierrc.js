module.exports = {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    bracketSpacing: true,
    useTabs: false,
    quoteProps: 'as-needed',
    overrides: [
      {
        files: '*.sol',
        options: {
          semi: true,
          singleQuote: false,
          tabWidth: 4,
          trailingComma: 'none',
          arrowParens: 'avoid',
          printWidth: 120,
          explicitTypes: 'always',
        },
      },
    ],
  };
  