import { cpSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
import { loadManifest } from '../src/manifest/io.js';
import { insertIdComments, parseObjectives, parseOutline, syncManifest } from '../src/manifest/sync.js';

const fx = (p: string) => join(import.meta.dirname, 'fixtures', p);
const cre = readFileSync(fx('CRE-201/02-design/course-outline.md'), 'utf8');
const creObjectives = readFileSync(fx('CRE-201/01-planning/learning-objectives.md'), 'utf8');

function copyFixture(name: string): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'sync-')), name);
  cpSync(fx(name), dir, { recursive: true });
  return dir;
}

test('CRE-201 outline gives 4 sessions and ignores Schedule Summary headings', () => {
  const { sessions } = parseOutline(cre);
  expect(sessions.map((s) => s.minutes)).toEqual([255, 280, 300, 315]);
  expect(sessions.map((s) => s.id)).toEqual(['S1', 'S2', 'S3', 'S4']);
});

test('CRE-201 outline gives 9 modules with objective links', () => {
  const { modules } = parseOutline(cre);
  expect(modules).toHaveLength(9);
  expect(modules[0]).toMatchObject({ id: 'M1', session: 'S1', minutes: 100 });
  expect(modules[0].title).toBe('Foundations — Orientation & Mental Models');
  expect(modules[0].objectives).toEqual(expect.arrayContaining(['LO-1', 'LO-2']));
  expect(modules[8].objectives).toContain('LO-10');
});

test('CRE-201 objectives give LO-0, LO-1..LO-10, LO-A, LO-B', () => {
  const ids = parseObjectives(creObjectives).map((o) => o.id);
  expect(ids).toEqual(['LO-0', ...Array.from({ length: 10 }, (_, i) => `LO-${i + 1}`), 'LO-A', 'LO-B']);
  const objs = parseObjectives(creObjectives);
  expect(objs[0]).toMatchObject({ kind: 'orientation' });
  expect(objs[1]).toMatchObject({ kind: 'cognitive', bloom: 'understand', title: 'The Holy Trinity of Agentic Engineering' });
  expect(objs[11]).toMatchObject({ kind: 'affective' });
});

test('a module heading with no day heading has no session', () => {
  const { modules } = parseOutline('### Module 1: A (9:00-10:00, 60 min)\n');
  expect(modules[0].session).toBeUndefined();
});

test('insertIdComments run two times gives the same text', () => {
  const { modules } = parseOutline(cre);
  const items = modules.map((m) => ({ id: m.id, line: m.line }));
  const once = insertIdComments(cre, items);
  expect(insertIdComments(once, items)).toBe(once);
  expect(once).toContain('### Module 1: Foundations — Orientation & Mental Models (9:10-10:50, 100 min)\n<!-- id: M1 -->');
  expect(once.split('\n').length).toBe(cre.split('\n').length + 9);
  expect(parseOutline(once)).toEqual(parseOutline(cre));
});

test('insertIdComments replaces a stale ID comment', () => {
  const md = '### Module 1: A (60 min)\n<!-- id: M7 -->\ntext\n';
  expect(insertIdComments(md, [{ id: 'M1', line: 1 }])).toBe('### Module 1: A (60 min)\n<!-- id: M1 -->\ntext\n');
});

test('a renamed module heading keeps its ID', () => {
  const dir = copyFixture('v2-sample');
  syncManifest(dir, { write: true });
  const f = join(dir, '02-design/course-outline.md');
  writeFileSync(f, readFileSync(f, 'utf8').replace('Rent Structures (', 'Rent Models and Structures ('));
  const { manifest } = syncManifest(dir, { write: true });
  const m2 = manifest.modules.find((m) => m.id === 'M2');
  expect(m2?.title).toBe('Rent Models and Structures');
  expect(readFileSync(f, 'utf8')).toContain('Rent Models and Structures (Time: 10:45-12:15, Duration: 90 min)\n<!-- id: M2 -->');
  expect(readFileSync(f, 'utf8').match(/<!-- id: M2 -->/g)).toHaveLength(1);
});

test('a deleted objective gives an error for each module that refers to it', () => {
  const dir = copyFixture('v2-sample');
  const f = join(dir, '01-planning/learning-objectives.md');
  writeFileSync(f, readFileSync(f, 'utf8').replace(/### Objective 3:[\s\S]*?(?=### Objective 4)/, ''));
  const { issues } = syncManifest(dir, { write: false });
  const errs = issues.filter((i) => i.level === 'error');
  expect(errs).toHaveLength(2);
  expect(errs.map((e) => e.message).join('\n')).toMatch(/M2/);
  expect(errs.map((e) => e.message).join('\n')).toMatch(/M3/);
  expect(errs[0].message).toMatch(/LO-3/);
});

test('syncManifest with write false does not change files', () => {
  const dir = copyFixture('v2-sample');
  const files = ['01-planning/learning-objectives.md', '02-design/course-outline.md'].map((p) => join(dir, p));
  const before = files.map((p) => [readFileSync(p, 'utf8'), statSync(p).mtimeMs]);
  const { manifest } = syncManifest(dir, { write: false });
  expect(manifest.objectives).toHaveLength(4);
  expect(manifest.modules).toHaveLength(4);
  expect(files.map((p) => [readFileSync(p, 'utf8'), statSync(p).mtimeMs])).toEqual(before);
  expect(() => loadManifest(dir)).toThrow();
});

test('syncManifest creates a manifest from v2-sample and a second write is stable', () => {
  const dir = copyFixture('v2-sample');
  const first = syncManifest(dir, { write: true });
  expect(first.manifest).toMatchObject({
    title: 'Intro to Lease Abstraction', shape: 'workshop', delivery: 'in-person',
    audience: { level: 'professional', summary: '' },
    media: { budgetUsd: 20, maxPlanImages: 40 },
  });
  expect(first.manifest.timeBudget.live?.sessions.map((s) => s.minutes)).toEqual([195, 195]);
  expect(first.manifest.created).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(first.manifest.modules[1].objectives).toEqual(['LO-2', 'LO-3']);
  expect(first.issues.filter((i) => i.level === 'error')).toEqual([]);
  const files = ['01-planning/learning-objectives.md', '02-design/course-outline.md'].map((p) => join(dir, p));
  const texts = files.map((p) => readFileSync(p, 'utf8'));
  expect(texts[1]).toContain('### Module 3: Abstraction Practice (Time: 9:00-10:30, Duration: 90 min)\n<!-- id: M3 -->');
  const yaml1 = readFileSync(join(dir, 'course.yaml'), 'utf8');
  syncManifest(dir, { write: true });
  expect(files.map((p) => readFileSync(p, 'utf8'))).toEqual(texts);
  expect(readFileSync(join(dir, 'course.yaml'), 'utf8')).toBe(yaml1);
});

test('syncManifest keeps other manifest fields and warns on modules without objectives', () => {
  const dir = copyFixture('v2-sample');
  syncManifest(dir, { write: true });
  const y = join(dir, 'course.yaml');
  writeFileSync(y, readFileSync(y, 'utf8').replace('status: draft', 'status: review').replace('summary: ""', 'summary: Leasing staff'));
  const f = join(dir, '02-design/course-outline.md');
  writeFileSync(f, readFileSync(f, 'utf8').replace('- Objective 4: Evaluate an abstract for completeness.', '- nothing'));
  const { manifest, issues } = syncManifest(dir, { write: false });
  expect(manifest.status).toBe('review');
  expect(manifest.audience.summary).toBe('Leasing staff');
  expect(issues.find((i) => i.level === 'warning' && /M4/.test(i.message))).toBeTruthy();
});

test('manifest sync CLI honours --write', async () => {
  const dir = copyFixture('v2-sample');
  const out: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { out.push(String(s)); return true; });
  expect(await runCli(['manifest', 'sync', '--course', dir], coreCommands)).toBe(0);
  expect(() => loadManifest(dir)).toThrow();
  expect(await runCli(['manifest', 'sync', '--course', dir, '--write'], coreCommands)).toBe(0);
  expect(loadManifest(dir).modules).toHaveLength(4);
  expect(JSON.parse(out[1]).manifest.id).toBe('intro-to-lease-abstraction');
  vi.restoreAllMocks();
});
