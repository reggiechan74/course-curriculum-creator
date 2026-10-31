import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const coreBundle = join(repo, 'plugins/course-curriculum-creator/skills/course-kit/scripts/course-kit.mjs');
const studioBundle = join(repo, 'plugins/course-studio/skills/course-kit/scripts/course-kit.mjs');
const fixture = join(repo, 'packages/course-kit/test/fixtures/v2-sample');

test('core bundle runs manifest sync on the v2-sample fixture', () => {
  execFileSync('node', [join(repo, 'packages/course-kit/scripts/build.mjs')], { cwd: repo });
  const out = execFileSync('node', [coreBundle, 'manifest', 'sync', '--course', fixture], { encoding: 'utf8' });
  expect(JSON.parse(out).manifest.modules).toHaveLength(4);
}, 60000);

test('studio bundle: render overlay and ledger commands emit JSON', () => {
  execFileSync('node', [join(repo, 'packages/course-kit/scripts/build.mjs')], { cwd: repo });
  const d = mkdtempSync(join(tmpdir(), 'studio bundle '));
  writeFileSync(join(d, 'labels.json'), JSON.stringify([{ text: 'A & B', x: 1, y: 2 }]));
  const out = join(d, 'o.svg');
  const r = JSON.parse(execFileSync('node', [studioBundle, 'render', 'overlay', 'img.png', join(d, 'labels.json'), out, '--width', '100', '--height', '50'], { encoding: 'utf8' }));
  expect(r).toEqual({ out });
  expect(readFileSync(out, 'utf8')).toContain('A &amp; B');
  const t = JSON.parse(execFileSync('node', [studioBundle, 'ledger', 'totals', '--course', d], { encoding: 'utf8' }));
  expect(t).toEqual({ spentUsd: 0, quotaUsed: 0 });
  const bad = spawnSync('node', [studioBundle, 'ledger', 'check', '--course', d, '--usd', 'abc', '--quota', '0'], { encoding: 'utf8' });
  expect(bad.status).toBe(1);
  expect(JSON.parse(bad.stdout).error).toMatch(/--usd must be a number/);
}, 60000);

test('core bundle does not contain the render modules', () => {
  const core = readFileSync(coreBundle, 'utf8');
  expect(core).not.toContain('vega-lite');
});
