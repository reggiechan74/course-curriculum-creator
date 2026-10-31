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
  writeFileSync(join(d, 'img.png'), Buffer.from('89504e470d0a1a0a0000000d494844520000006400000032080600000000', 'hex'));
  const out = join(d, 'o.svg');
  const r = JSON.parse(execFileSync('node', [studioBundle, 'render', 'overlay', join(d, 'img.png'), join(d, 'labels.json'), out], { encoding: 'utf8' }));
  expect(r).toEqual({ out });
  const svg = readFileSync(out, 'utf8');
  expect(svg).toContain('A &amp; B');
  expect(svg).toContain('href="data:image/png;base64,');
  expect(svg).toContain('viewBox="0 0 100 50"');
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

test('course-media-server bundle answers over stdio and studio bundle prints provider patterns', async () => {
  execFileSync('node', [join(repo, 'packages/course-kit/scripts/build.mjs')], { cwd: repo });
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
  const dataDir = mkdtempSync(join(tmpdir(), 'media data '));
  const client = new Client({ name: 'bundle-test', version: '0.0.0' });
  await client.connect(new StdioClientTransport({
    command: 'node', args: [join(repo, 'plugins/course-studio/skills/course-kit/scripts/course-media-server.mjs')],
    env: { PATH: process.env.PATH ?? '', COURSE_MEDIA_DATA_DIR: dataDir },
  }));
  try {
    expect((await client.listTools()).tools.map((t) => t.name).sort()).toEqual(['estimate_cost', 'generate_image']);
    const r = await client.callTool({ name: 'generate_image', arguments: { courseDir: dataDir, assetId: 'A-M1-01' } }) as { isError?: boolean; content: { text: string }[] };
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toBe(`course-media is not configured: set openai_api_key, OPENAI_API_KEY, or ${dataDir}/openai.key`);
  } finally { await client.close(); }
  const p = JSON.parse(execFileSync('node', [studioBundle, 'providers', 'patterns'], { encoding: 'utf8' }));
  expect(p.designSkills).toContain('impeccable*');
}, 60000);
