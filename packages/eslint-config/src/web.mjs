// @ts-check
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

import baseConfig, {
  basePlugins,
  baseParser,
  baseParserOptions,
  baseSettings,
  baseRules
} from './base.mjs'

/**
 * Web ESLint flat config.
 * Extends the shared base config with browser-specific settings.
 */

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    plugins: {
      ...basePlugins,
      'jsx-a11y': jsxA11y
    },
    languageOptions: {
      parser: baseParser,
      parserOptions: baseParserOptions,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    settings: baseSettings,
    rules: baseRules
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.tsx', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
]
