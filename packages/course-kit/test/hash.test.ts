import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, expect, test } from 'vitest';
import { readFrontmatter } from '../src/frontmatter.js';
import { checkStale, hashFile, writeHashes } from '../src/hash.js';

let dir: string;
let out: string;
const originalBody = '# Handout\n\nBody text here.\n';

function setup(hash: string) {
  dir = join(mkdtempSync(join(tmpdir(), 'kit-')), 'My Courses', 'Intro 101');
  mkdirSync(join(dir, '01-planning'), { recursive: true });
  mkdirSync(join(dir, '04-materials'), { recursive: true });
  writeFileSync(join(dir, '01-planning/learning-objectives.md'), 'abc');
  out = join(dir, '04-materials/student-handout.md');
  writeFileSync(
    out,
    `---\ntitle: Handout\nsourceFiles:\n  obj: 01-planning/learning-objectives.md\nsourceHashes:\n  obj: "${hash}"\nzed: 1\n---\n${originalBody}`,
  );
}

beforeEach(() => setup('00000000'));

test('hashFile matches the v2 md5sum | cut -c1-8 format', () => {
  const f = join(dir, 'x.txt');
  writeFileSync(f, 'abc');
  expect(hashFile(f)).toBe('90015098');
});

test('checkStale reports a changed source', () => {
  expect(checkStale(out, dir)).toEqual({ status: 'stale', changed: ['obj'] });
});

test('checkStale counts a deleted source as changed', () => {
  setup('90015098');
  expect(checkStale(out, dir).status).toBe('fresh');
  writeFileSync(out, readFileSync(out, 'utf8').replace('learning-objectives.md', 'missing.md'));
  expect(checkStale(out, dir)).toEqual({ status: 'stale', changed: ['obj'] });
});

test('checkStale returns missing-output when the output is absent', () => {
  expect(checkStale(join(dir, 'nope.md'), dir).status).toBe('missing-output');
});

test('writeHashes then checkStale returns fresh and keeps the body and key order', () => {
  writeHashes(out, dir);
  expect(checkStale(out, dir).status).toBe('fresh');
  const fm = readFrontmatter(out);
  expect(fm.body).toBe(originalBody);
  expect(Object.keys(fm.data)).toEqual(['title', 'sourceFiles', 'sourceHashes', 'zed']);
  expect((fm.data.sourceHashes as Record<string, string>).obj).toBe('90015098');
});

test('hash-write --sources sets sourceFiles and sourceHashes, then stale is fresh', async () => {
  const { runCli } = await import('../src/cli/args.js');
  const { coreCommands } = await import('../src/cli-core.js');
  const { vi } = await import('vitest');
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const code = await runCli(['hash-write', out, '--course', dir, '--sources', JSON.stringify({ b: '01-planning/learning-objectives.md', a: '01-planning/learning-objectives.md' })], coreCommands);
  vi.restoreAllMocks();
  expect(code).toBe(0);
  const text = readFileSync(out, 'utf8');
  expect(text.indexOf('  b:')).toBeLessThan(text.indexOf('  a:'));
  expect(text).toContain('zed: 1');
  expect(text.endsWith(originalBody)).toBe(true);
  expect(checkStale(out, dir)).toEqual({ status: 'fresh', changed: [] });
  expect(readFrontmatter(out, { strings: true }).data.sourceFiles).toEqual({ b: '01-planning/learning-objectives.md', a: '01-planning/learning-objectives.md' });
});

test('hash-write --sources with a missing source file is exit 2 and the file does not change', async () => {
  const { runCli } = await import('../src/cli/args.js');
  const { coreCommands } = await import('../src/cli-core.js');
  const { vi } = await import('vitest');
  const before = readFileSync(out, 'utf8');
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const code = await runCli(['hash-write', out, '--course', dir, '--sources', JSON.stringify({ x: 'nope.md' })], coreCommands);
  vi.restoreAllMocks();
  expect(code).toBe(2);
  expect(readFileSync(out, 'utf8')).toBe(before);
});

test('stale and hash-write resolve a relative output against --course, not the cwd', async () => {
  const { runCli } = await import('../src/cli/args.js');
  const { coreCommands } = await import('../src/cli-core.js');
  const { vi } = await import('vitest');
  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  try {
    expect(process.cwd()).not.toBe(dir);
    const rel = '04-materials/student-handout.md';
    expect(await runCli(['stale', rel, '--course', dir], coreCommands)).toBe(0);
    expect(JSON.parse(logs.join(''))).toEqual({ status: 'stale', changed: ['obj'] });
    expect(await runCli(['hash-write', rel, '--course', dir, '--sources', JSON.stringify({ obj: '01-planning/learning-objectives.md' })], coreCommands)).toBe(0);
    expect(checkStale(out, dir).status).toBe('fresh');
    logs.length = 0;
    expect(await runCli(['stale', rel, '--course', dir], coreCommands)).toBe(0);
    expect(JSON.parse(logs.join(''))).toEqual({ status: 'fresh', changed: [] });
    logs.length = 0;
    expect(await runCli(['stale', '04-materials/nope.md', '--course', dir], coreCommands)).toBe(0);
    expect(JSON.parse(logs.join('')).status).toBe('missing-output');
  } finally { vi.restoreAllMocks(); }
});
