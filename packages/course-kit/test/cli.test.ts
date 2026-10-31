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
