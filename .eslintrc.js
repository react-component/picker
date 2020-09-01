const base = require('@umijs/fabric/dist/eslint');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    'arrow-parens': 0,
    'no-template-curly-in-string': 0,
    'prefer-promise-reject-errors': 0,
    'react/no-array-index-key': 0,
    'react/sort-comp': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'default-case': 0,
    'no-confusing-arrow': 0,
    'jsx-a11y/no-autofocus': 0,
    'jsx-a11y/heading-has-content': 0,
    'import/no-extraneous-dependencies': ['error', { packageDir: './' }],
  },
};
