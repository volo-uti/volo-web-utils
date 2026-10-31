import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist/**", "**/node_modules/**", "**/coverage/**", "**/*.config.{js,mjs,cjs}"]),
  js.configs.recommended,
  {
    name: "volo-web-utils/typescript",
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.es2022,
      },
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-explicit-any": "warn",

      // TypeScript replaces no-undef (recommended by typescript-eslint)
      "no-undef": "off",

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    name: "volo-web-utils/node-scripts",
    files: ["**/scripts/**/*.{js,mjs}", "**/bin/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: "volo-web-utils/tests",
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  prettierConfig,
]);
