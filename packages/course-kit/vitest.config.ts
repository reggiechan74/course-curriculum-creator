import { defineConfig } from 'vitest/config';

export default defineConfig({
  // data/*.yaml files are imported as text (esbuild uses loader '.yaml': 'text' for the bundles).
  plugins: [{
    name: 'yaml-text',
    transform(code, id) {
      if (id.endsWith('.yaml')) return { code: `export default ${JSON.stringify(code)};`, map: null };
    },
  }],
  test: { include: ['test/**/*.test.ts'], globalSetup: ['test/global-setup.ts'] },
});
