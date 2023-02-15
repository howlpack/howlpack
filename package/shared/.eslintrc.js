module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  env: {
    node: true,
    es6: true,
  },
  rules: {},
  overrides: [
    {
      files: ["**/*.test.js", "**/jest.*"],
      env: {
        jest: true,
      },
      extends: ["plugin:jest/recommended"],
    },
    {
      files: ["**/*.mjs"],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      extends: ["plugin:@typescript-eslint/recommended"],
      env: {
        node: true,
      },
    },
  ],
};
