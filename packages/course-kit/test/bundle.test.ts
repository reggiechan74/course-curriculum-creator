import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const coreBundle = join(repo, 'plugins/course-curriculum-creator/skills/course-kit/scripts/course-kit.mjs');
const fixture = join(repo, 'packages/course-kit/test/fixtures/v2-sample');

test('core bundle runs manifest sync on the v2-sample fixture', () => {
  execFileSync('node', [join(repo, 'packages/course-kit/scripts/build.mjs')], { cwd: repo });
  const out = execFileSync('node', [coreBundle, 'manifest', 'sync', '--course', fixture], { encoding: 'utf8' });
  expect(JSON.parse(out).manifest.modules).toHaveLength(4);
}, 60000);

test('build skips absent studio entries without creating the plugin folder', () => {
  if (existsSync(join(repo, 'packages/course-kit/src/cli.ts'))) return;
  expect(existsSync(join(repo, 'plugins/course-studio'))).toBe(false);
});
