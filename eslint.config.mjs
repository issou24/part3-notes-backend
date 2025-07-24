import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },

  // Configuration pour les fichiers Node.js (comme mongo.js)
  {
    files: ["mongo.js", "server.js", "**/*.node.js"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Configuration pour les fichiers browser
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: ["mongo.js", "server.js", "**/*.node.js"],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
