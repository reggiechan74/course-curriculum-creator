import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
import { ValidationError } from '../src/errors.js';
import { type InitOptions, initManifest, loadManifest, saveManifest, validateManifest } from '../src/manifest/io.js';

const opts: InitOptions = {
  title: 'PropTech Fundamentals', shape: 'workshop', delivery: 'in-person',
  sessions: [{ id: 'S1', label: 'Day 1', minutes: 420 }], audienceLevel: 'professional',
  audienceSummary: 'CRE analysts', budgetUsd: 20, maxPlanImages: 40,
};
const make = () => initManifest(opts, '2026-10-31');
const tmp = () => mkdtempSync(join(tmpdir(), 'kit-'));

test('initManifest makes a valid workshop manifest', () => {
  const m = make();
  expect(m.id).toBe('proptech-fundamentals');
  expect(m.schema).toBe('course/v3');
  expect(m.created).toBe('2026-10-31');
  expect(validateManifest(m)).toEqual([]);
});

test('a module that names an unknown objective is an error', () => {
  const m = make();
  m.modules = [{ id: 'M1', title: 'X', objectives: ['LO-9'] }];
  expect(validateManifest(m)).toContainEqual(expect.objectContaining({ level: 'error', path: 'modules[0].objectives[0]' }));
});

test('a self-paced course with live sessions is an error', () => {
  const m = make();
  m.shape = 'self-paced';
  expect(validateManifest(m)).toContainEqual(expect.objectContaining({ level: 'error', path: 'timeBudget.live' }));
});

test('a workshop with more than 2 sessions is a warning that suggests cohort', () => {
  const m = make();
  m.timeBudget.live!.sessions = [1, 2, 3].map((n) => ({ id: `S${n}`, label: `D${n}`, minutes: 60 }));
  const w = validateManifest(m).find((i) => i.level === 'warning');
  expect(w?.message).toMatch(/cohort/);
});

test('module minutes above session minutes is a warning', () => {
  const m = make();
  m.modules = [{ id: 'M1', title: 'X', session: 'S1', objectives: [], minutes: 500 }];
  expect(validateManifest(m)).toContainEqual(expect.objectContaining({ level: 'warning', path: 'modules[0].minutes' }));
});

test('duplicate ids and unknown module session are errors', () => {
  const m = make();
  m.objectives = [{ id: 'LO-1', title: 'a', kind: 'cognitive' }, { id: 'LO-1', title: 'b', kind: 'cognitive' }];
  m.modules = [{ id: 'M1', title: 'X', session: 'S9', objectives: [] }, { id: 'M1', title: 'Y', objectives: [] }];
  const issues = validateManifest(m);
  expect(issues).toContainEqual(expect.objectContaining({ level: 'error', path: 'objectives[1].id' }));
  expect(issues).toContainEqual(expect.objectContaining({ level: 'error', path: 'modules[1].id' }));
  expect(issues).toContainEqual(expect.objectContaining({ level: 'error', path: 'modules[0].session' }));
});

test('save then load gives the same object', () => {
  const dir = tmp();
  const m = make();
  m.extra = { custom: 1 };
  saveManifest(dir, m);
  expect(loadManifest(dir)).toEqual(m);
  expect(readFileSync(join(dir, 'course.yaml'), 'utf8').startsWith('schema:')).toBe(true);
});

test('loadManifest throws ValidationError for a bad schema value', () => {
  const dir = tmp();
  saveManifest(dir, make());
  const p = join(dir, 'course.yaml');
  writeFileSync(p, readFileSync(p, 'utf8').replace('shape: workshop', 'shape: bootcamp'));
  expect(() => loadManifest(dir)).toThrow(ValidationError);
});

test('CLI manifest init and validate', async () => {
  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  const dir = tmp();
  expect(await runCli(['manifest', 'init', '--course', dir, '--json', JSON.stringify(opts)], coreCommands)).toBe(0);
  expect(await runCli(['manifest', 'validate', '--course', dir], coreCommands)).toBe(0);
  expect(JSON.parse(logs[1])).toEqual({ issues: [] });
  const m = loadManifest(dir);
  m.modules = [{ id: 'M1', title: 'X', objectives: ['LO-9'] }];
  saveManifest(dir, m);
  expect(await runCli(['manifest', 'validate', '--course', dir], coreCommands)).toBe(2);
  vi.restoreAllMocks();
});

async function run(argv: string[]) {
  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  const code = await runCli(argv, coreCommands);
  vi.restoreAllMocks();
  return { code, out: JSON.parse(logs.join('')) };
}

test('manifest init rejects missing sessions and bad shape without throwing raw errors', async () => {
  const dir = tmp();
  const { sessions: _s, ...noSessions } = opts;
  const r1 = await run(['manifest', 'init', '--course', dir, '--json', JSON.stringify(noSessions)]);
  expect(r1.code).toBe(1);
  expect(r1.out.error).toMatch(/sessions/);
  const r2 = await run(['manifest', 'init', '--course', dir, '--json', JSON.stringify({ ...opts, shape: 'bootcamp' })]);
  expect(r2.code).not.toBe(0);
  const r3 = await run(['manifest', 'init', '--course', dir, '--json', '{nope']);
  expect(r3.code).toBe(1);
});

test('manifest init refuses to overwrite course.yaml unless --force', async () => {
  const dir = tmp();
  const p = join(dir, 'course.yaml');
  writeFileSync(p, 'precious: true\n');
  const r = await run(['manifest', 'init', '--course', dir, '--json', JSON.stringify(opts)]);
  expect(r.code).toBe(1);
  expect(readFileSync(p, 'utf8')).toBe('precious: true\n');
  const f = await run(['manifest', 'init', '--course', dir, '--json', JSON.stringify(opts), '--force']);
  expect(f.code).toBe(0);
  expect(loadManifest(dir).id).toBe('proptech-fundamentals');
});
