import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
import { initManifest, loadManifest, saveManifest, validateManifest } from '../src/manifest/io.js';
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

test('sync --write adds module ID comments to lesson plans, handout and guide; stable; dry run changes nothing', () => {
  const dir = copyFixture('v2-sample');
  const { manifest } = syncManifest(dir, { write: false });
  const ids = manifest.modules.map((m) => m.id);
  expect(ids).toContain('M1');
  expect(ids).toContain('M2');
  const doc = '---\ntitle: LP\n---\n\n# Lesson Plans\n\n## Module 1: X\n\nText\n\n### Module 2: Y\n\nMore\n\n## Module 99: Z\n';
  const rels = ['02-design/lesson-plans.md', '04-materials/student-handout.md', '04-materials/instructor-guide.md'];
  mkdirSync(join(dir, '04-materials'), { recursive: true });
  mkdirSync(join(dir, '02-design'), { recursive: true });
  for (const r of rels.slice(0, 2)) writeFileSync(join(dir, r), doc); // instructor-guide absent
  syncManifest(dir, { write: false });
  expect(readFileSync(join(dir, rels[0]), 'utf8')).toBe(doc);
  syncManifest(dir, { write: true });
  const once = readFileSync(join(dir, rels[0]), 'utf8');
  expect(once).toBe(doc.replace('## Module 1: X\n', '## Module 1: X\n<!-- id: M1 -->\n').replace('### Module 2: Y\n', '### Module 2: Y\n<!-- id: M2 -->\n'));
  expect(readFileSync(join(dir, rels[1]), 'utf8')).toBe(once);
  expect(existsSync(join(dir, rels[2]))).toBe(false);
  syncManifest(dir, { write: true });
  expect(readFileSync(join(dir, rels[0]), 'utf8')).toBe(once);
});

test('hand-added top-level keys in course.yaml survive sync --write (moved into extra)', () => {
  const dir = copyFixture('v2-sample');
  syncManifest(dir, { write: true });
  const y = join(dir, 'course.yaml');
  writeFileSync(y, readFileSync(y, 'utf8') + 'notes: keep me\nextra:\n  owner: pat\n');
  expect(loadManifest(dir).extra).toEqual({ owner: 'pat', notes: 'keep me' });
  syncManifest(dir, { write: true });
  expect(loadManifest(dir).extra).toEqual({ owner: 'pat', notes: 'keep me' });
  expect(readFileSync(y, 'utf8')).toMatch(/^extra:\n {2}owner: pat\n {2}notes: keep me$/m);
});

test('a missing objectives or outline file keeps the existing manifest list and warns', () => {
  const dir = copyFixture('v2-sample');
  const first = syncManifest(dir, { write: true }).manifest;
  const objFile = join(dir, '01-planning/learning-objectives.md');
  const objText = readFileSync(objFile, 'utf8');
  rmSync(objFile);
  const a = syncManifest(dir, { write: true });
  expect(a.manifest.objectives).toEqual(first.objectives);
  expect(loadManifest(dir).objectives).toEqual(first.objectives);
  expect(a.issues).toContainEqual(expect.objectContaining({ level: 'warning', path: 'objectives', message: expect.stringMatching(/learning-objectives\.md not found/) }));
  writeFileSync(objFile, objText);
  rmSync(join(dir, '02-design/course-outline.md'));
  const b = syncManifest(dir, { write: true });
  expect(b.manifest.modules).toEqual(first.modules);
  expect(b.manifest.timeBudget).toEqual(first.timeBudget);
  expect(b.issues).toContainEqual(expect.objectContaining({ level: 'warning', path: 'modules', message: expect.stringMatching(/course-outline\.md not found/) }));
});

test('cohort outline headings make sessions', () => {
  const md = [
    '## Session 1: Kickoff', '### Module 1: A (30 min)',
    '## Week 2: Cash flows', '### Module 2: B (30 min)',
    '## Weekend 1, Day 3 (Saturday): Tools', '### Module 3: C (30 min)',
    '## Week Gap (5 business days)', '',
  ].join('\n');
  const { sessions, modules } = parseOutline(md);
  expect(sessions.map((s) => s.id)).toEqual(['S1', 'S2', 'S3']);
  expect(modules.map((m) => m.session)).toEqual(['S1', 'S2', 'S3']);
});

test('Integration Objective headings are kind integration', () => {
  const md = '### Integration Objective 1: Pause and connect\n\n### Objective 2: Next\n';
  expect(parseObjectives(md)).toMatchObject([
    { id: 'LO-1', title: 'Pause and connect', kind: 'integration' }, { id: 'LO-2', kind: 'cognitive' },
  ]);
});

test('sync keeps configured session minutes and labels; module minutes still come from the outline', () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'sync-')), 'Cohort');
  mkdirSync(join(dir, '01-planning'), { recursive: true });
  mkdirSync(join(dir, '02-design'), { recursive: true });
  saveManifest(dir, initManifest({
    title: 'Cohort', shape: 'cohort', delivery: 'virtual', audienceLevel: 'professional', audienceSummary: '',
    budgetUsd: 20, maxPlanImages: 40,
    sessions: [{ id: 'S1', label: 'Kickoff', minutes: 90 }, { id: 'S2', label: 'Wrap', minutes: 90 }, { id: 'S9', label: 'Spare', minutes: 45 }],
  }, '2026-10-31'));
  writeFileSync(join(dir, '01-planning/learning-objectives.md'), '### Objective 1: A\n\n### Objective 2: B\n\n### Objective 3: C\n');
  const outline = [
    '## Session 1: Rent Roll', '### Module 1: Reading (60 min)', '- Objective 1', '### Break (15 min)',
    '### Between Sessions (60 min)', '## Session 2: Cash Flow', '### Module 2: Projecting (60 min)', '- Objective 2',
    '## Session 3: Defense', '### Module 3: Defending (45 min)', '- Objective 3', '',
  ].join('\n');
  const f = join(dir, '02-design/course-outline.md');
  writeFileSync(f, outline);
  const r = syncManifest(dir, { write: true });
  expect(r.manifest.timeBudget.live!.sessions).toEqual([
    { id: 'S1', label: 'Kickoff', minutes: 90 }, { id: 'S2', label: 'Wrap', minutes: 90 },
    { id: 'S3', label: 'Session 3: Defense', minutes: 45 }, { id: 'S9', label: 'Spare', minutes: 45 },
  ]);
  expect(r.issues.filter((i) => i.path.startsWith('timeBudget.live.sessions['))).toEqual([]);
  expect(loadManifest(dir).timeBudget.live!.sessions[0].minutes).toBe(90);
  writeFileSync(f, readFileSync(f, 'utf8').replace('### Break (15 min)', '### Module 4: Practice (60 min)\n- Objective 1\n### Break (15 min)'));
  syncManifest(dir, { write: true });
  const m = loadManifest(dir);
  expect(m.timeBudget.live!.sessions[0].minutes).toBe(90);
  expect(m.modules.find((x) => x.id === 'M4')).toMatchObject({ session: 'S1', minutes: 60 });
  expect(validateManifest(m)).toContainEqual(expect.objectContaining({
    level: 'warning', path: 'timeBudget.live.sessions[0]', message: expect.stringContaining('120 min'),
  }));
});
