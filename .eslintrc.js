module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-async-promise-executor': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'linebreak-style': 'off',
  },
};
