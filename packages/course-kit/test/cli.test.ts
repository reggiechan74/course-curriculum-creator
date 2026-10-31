import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';

let logs: string[];
beforeEach(() => {
  logs = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => {
    logs.push(String(s));
    return true;
  });
});
afterEach(() => vi.restoreAllMocks());

test('CLI operates when the course path has spaces', async () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'kit-')), 'My Courses', 'Intro 101');
  mkdirSync(dir, { recursive: true });
  const out = join(dir, 'out.md');
  writeFileSync(out, '---\nsourceFiles: {}\nsourceHashes: {}\n---\nbody\n');
  expect(await runCli(['stale', out, '--course', dir], coreCommands)).toBe(0);
  expect(JSON.parse(logs.join(''))).toEqual({ status: 'fresh', changed: [] });
});

test('hash and hash-write commands work', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'kit-'));
  const f = join(dir, 'a.txt');
  writeFileSync(f, 'abc');
  expect(await runCli(['hash', f], coreCommands)).toBe(0);
  expect(JSON.parse(logs.join(''))).toEqual({ hash: '90015098' });
  const out = join(dir, 'o.md');
  writeFileSync(out, '---\nsourceFiles:\n  a: a.txt\n---\nB\n');
  expect(await runCli(['hash-write', out, '--course', dir], coreCommands)).toBe(0);
  logs.length = 0;
  await runCli(['stale', out, '--course', dir], coreCommands);
  expect(JSON.parse(logs.join('')).status).toBe('fresh');
});

test('CLI prints an error and returns 1 for an unknown command', async () => {
  expect(await runCli(['nope'], coreCommands)).toBe(1);
  expect(JSON.parse(logs.join('')).error).toMatch(/nope/);
});

test('missing --course is a usage error', async () => {
  expect(await runCli(['stale', 'x.md'], coreCommands)).toBe(1);
});

test('longest-prefix match and KitError exit codes', async () => {
  const table = {
    manifest: () => ({ which: 'manifest' }),
    'manifest init': (a: { positionals: string[] }) => ({ which: 'init', rest: a.positionals }),
  };
  expect(await runCli(['manifest', 'init', 'p'], table)).toBe(0);
  expect(JSON.parse(logs.join(''))).toEqual({ which: 'init', rest: ['p'] });
});

test('registry and plan commands', async () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'kit-')), 'My Courses');
  mkdirSync(dir, { recursive: true });
  const asset = { id: 'A1', kind: 'diagram', objectives: [], provider: 'mermaid', files: [], alt: 'alt', status: 'generated', costUsd: 0, quotaUnits: 0, createdAt: 'x' };
  const run = async (...argv: string[]) => { logs.length = 0; const code = await runCli(argv, coreCommands); return { code, out: JSON.parse(logs.join('')) }; };
  expect((await run('registry', 'add', '--course', dir, '--json', JSON.stringify(asset))).code).toBe(0);
  expect((await run('registry', 'add', '--course', dir, '--json', JSON.stringify(asset))).code).toBe(2);
  expect((await run('registry', 'add', '--course', dir, '--json', '{}')).code).toBe(2);
  expect((await run('registry', 'list', '--course', dir)).out.assets).toHaveLength(1);
  expect((await run('registry', 'status', 'A1', 'approved', '--course', dir)).code).toBe(2);
  const ok = await run('registry', 'status', 'A1', 'approved', '--approved-by', 'user', '--course', dir);
  expect(ok.out.asset).toMatchObject({ status: 'approved', approvedBy: 'user' });
  const est = await run('plan', 'estimate', '--quality', 'standard', '--course', dir);
  expect(est).toEqual({ code: 0, out: { perModule: {}, totalUsd: 0, totalQuota: 0 } });
  expect((await run('plan', 'estimate', '--quality', 'bad', '--course', dir)).code).toBe(1);
});
