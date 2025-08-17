const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
  // Ignore patterns
  {
    ignores: [
      "node_modules/",
      "dist/",
      "logs/",
      "coverage/",
      "*.min.js",
      "eslint.config.mjs", // Keep this in ignores if you're converting this file to .js or .cjs
      "*.json",
    ],
  },

  // Base JavaScript configuration
  js.configs.recommended,

  // Prettier config (disables conflicting ESLint rules)
  prettier,

  // Main configuration for all JS files
  {
    files: ["**/*.{js,mjs,cjs}"], // Still targets .mjs and .cjs if they exist elsewhere
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      ecmaVersion: 2021,
      sourceType: "commonjs", // Explicitly set sourceType to commonjs
    },
    rules: {
      // Basic rules to prevent errors
      "no-console": "off", // Allow console in server environment
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      curly: ["warn", "all"],
      "no-unused-vars": "warn",
      "no-undef": "error",

      // Node.js specific
      "no-process-exit": "warn",
    },
  },

  // Test files configuration
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": "off", // Often have unused vars in tests
    },
  },
];
