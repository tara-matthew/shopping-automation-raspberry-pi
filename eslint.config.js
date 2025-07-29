import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import stylistic from '@stylistic/eslint-plugin'
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, '@stylistic': stylistic, "unused-imports": unusedImports, },
    rules: {
      "no-unused-vars": "error",
      "unused-imports/no-unused-imports": "error",
      "no-undef": "error",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/jsx-curly-spacing": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs"],

    },
    languageOptions: { globals: globals.browser }
  },
]);
