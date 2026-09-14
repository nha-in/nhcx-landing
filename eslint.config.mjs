// Flat ESLint config: Next.js rules + typescript-eslint, no interactive setup.
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Any `NEXT_DIST_DIR=.next-*` build output, not just the two the npm
    // scripts name: a scratch build directory is generated code and linting
    // it buries the real findings under thousands of errors.
    ignores: ['.next*/**', 'out/**', 'node_modules/**', 'public/**', 'next-env.d.ts'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mjs,js}'],
    plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
      // The site is a static export with plain <img> tags on purpose.
      '@next/next/no-img-element': 'off',
      // Full-page navigation between exported HTML files is intentional: the
      // chrome uses plain anchors so it works without the client runtime.
      '@next/next/no-html-link-for-pages': 'off',
      // Fonts are linked from the App Router root layout, which is the right
      // place; this rule only knows about pages/_document.js.
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
