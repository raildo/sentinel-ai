import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Scrollable <pre> blocks must be keyboard reachable (WCAG 2.1.1), so a
      // labelled role="region" may carry tabIndex. Scoped to that single role.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['region'], tags: [] }],
    },
  },
  {
    files: ['*.config.{js,ts,cjs}', '.dependency-cruiser.cjs'],
    languageOptions: { globals: { ...globals.node } },
  },
);
