// Builds the course-kit bundles into the plugin folders. Output is deterministic.
import { build } from 'esbuild';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(pkgDir, '..', '..');

const ENTRIES = [
  ['src/cli-core.ts', 'plugins/course-curriculum-creator/skills/course-kit/scripts/course-kit.mjs'],
  ['src/cli.ts', 'plugins/course-studio/skills/course-kit/scripts/course-kit.mjs'],
  ['src/mcp/course-media-server.ts', 'plugins/course-studio/skills/course-kit/scripts/course-media-server.mjs'],
];

for (const [src, out] of ENTRIES) {
  const entry = join(pkgDir, src);
  if (!existsSync(entry)) {
    console.log(`skip ${src} (not present yet)`);
    continue;
  }
  const outfile = join(repo, out);
  mkdirSync(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    legalComments: 'none',
    banner: {
      js: '#!/usr/bin/env node\n// GENERATED from packages/course-kit — do not edit\nimport { createRequire as __cr } from "node:module";\nconst require = __cr(import.meta.url);',
    },
  });
  console.log(`built ${out}`);
}
