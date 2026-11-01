import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { auditCourse } from '../src/audit.js';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
import { type InitOptions, initManifest, saveManifest } from '../src/manifest/io.js';
import type { Manifest } from '../src/manifest/io.js';

const opts: InitOptions = {
  title: 'Aud', shape: 'workshop', delivery: 'in-person',
  sessions: [{ id: 'S1', label: 'Day 1', minutes: 420 }], audienceLevel: 'professional',
  audienceSummary: 'x', budgetUsd: 20, maxPlanImages: 40,
};
const roots: string[] = [];
afterEach(() => { vi.restoreAllMocks(); for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });

function put(dir: string, rel: string, text: string): void {
  mkdirSync(dirname(join(dir, rel)), { recursive: true });
  writeFileSync(join(dir, rel), text);
}
/** A clean course: two objectives, two modules covering them, each with a planned non-text representation. */
function course(edit?: (m: Manifest) => void): string {
  const root = mkdtempSync(join(tmpdir(), 'kit-audit-'));
  roots.push(root);
  const dir = join(root, 'Course');
  mkdirSync(dir, { recursive: true });
  const m = initManifest(opts, '2026-10-31');
  m.objectives = [
    { id: 'O1', title: 'a', kind: 'cognitive' },
    { id: 'O2', title: 'b', kind: 'affective' },
    { id: 'O3', title: 'c', kind: 'orientation' },
  ];
  m.modules = [
    { id: 'M1', title: 'm1', session: 'S1', objectives: ['O1'], minutes: 60 },
    { id: 'M2', title: 'm2', session: 'S1', objectives: ['O2'], minutes: 60 },
  ];
  edit?.(m);
  saveManifest(dir, m);
  put(dir, '01-planning/course-positioning.md', '# Positioning\n');
  put(dir, '05-media/media-plan.yaml', `schema: media-plan/v1\nitems:\n${['M1', 'M2'].map((mod) => planItem(`P-${mod}`, mod, 'O1')).join('')}`);
  return dir;
}
function planItem(id: string, module: string, obj: string): string {
  return `  - {id: ${id}, module: ${module}, objectives: [${obj}], function: concept-map, kind: diagram, description: d, provider: mermaid, estimateUsd: 0, quotaUnits: 0, status: proposed}\n`;
}
function asset(o: Record<string, unknown>): string {
  const a = { kind: 'image', objectives: ['O1'], module: 'M1', provider: 'x', files: [], alt: 'alt', status: 'generated', costUsd: 0, quotaUnits: 0, createdAt: '2026-10-31', ...o };
  return JSON.stringify(a);
}
function registry(dir: string, ...assets: Record<string, unknown>[]): void {
  put(dir, '05-media/registry.json', JSON.stringify({ schema: 'registry/v1', assets: assets.map((a) => JSON.parse(asset(a))) }));
}
const only = (dir: string, check: string) => auditCourse(dir).issues.filter((i) => i.check === check);

test('a clean sample course gives ok true and no errors', () => {
  const r = auditCourse(course());
  expect(r).toEqual({ ok: true, issues: [], counts: { error: 0, warning: 0, info: 0 } });
});

test('manifest issues are passed through', () => {
  const dir = course((m) => { m.modules[0]!.objectives = ['O9']; });
  expect(only(dir, 'manifest')).toEqual([
    { level: 'error', check: 'manifest', path: 'modules[0].objectives[0]', message: 'unknown objective O9' },
  ]);
  expect(auditCourse(dir).ok).toBe(false);
});

test('objective-coverage warns for an uncovered cognitive or affective objective only', () => {
  const dir = course((m) => { m.modules[1]!.objectives = []; });
  expect(only(dir, 'objective-coverage')).toEqual([
    { level: 'warning', check: 'objective-coverage', path: 'objectives[1]', message: 'objective O2 is not covered by any module' },
  ]);
});

test('stale lists the changed sources', () => {
  const dir = course();
  put(dir, '01-planning/learner-profile.md', '# LP\n');
  put(dir, '01-planning/learning-objectives.md',
    '---\nsourceFiles:\n  positioning: 01-planning/course-positioning.md\nsourceHashes:\n  positioning: "00000000"\n---\n# Obj\n');
  const [i] = only(dir, 'stale');
  expect(i).toMatchObject({ level: 'warning', check: 'stale', path: '01-planning/learning-objectives.md' });
  expect(i!.message).toContain('positioning');
});

test('media-links flags unknown objective or module in registry and plan', () => {
  const dir = course();
  registry(dir, { id: 'A1', objectives: ['O9'], module: 'M1' }, { id: 'A2', module: 'M9' });
  put(dir, '05-media/media-plan.yaml', `schema: media-plan/v1\nitems:\n${planItem('P1', 'M1', 'O8')}${planItem('P2', 'M2', 'O1')}`);
  const paths = only(dir, 'media-links').map((i) => `${i.level} ${i.path}`);
  expect(paths).toEqual(['error registry:A1', 'error registry:A2', 'error plan:P1']);
});

test('media-alt: approved empty alt is an error, imported a warning', () => {
  const dir = course();
  registry(dir, { id: 'A1', status: 'approved', alt: '', kind: 'image' }, { id: 'A2', status: 'imported', alt: '' },
    { id: 'A3', status: 'generated', alt: '' });
  expect(only(dir, 'media-alt').map((i) => `${i.level} ${i.path}`)).toEqual(['error registry:A1', 'warning registry:A2']);
});

test('media-long-description warns for approved diagram or chart without one', () => {
  const dir = course();
  registry(dir, { id: 'A1', status: 'approved', kind: 'diagram' }, { id: 'A2', status: 'approved', kind: 'chart', longDescription: 'x' },
    { id: 'A3', status: 'approved', kind: 'image' });
  expect(only(dir, 'media-long-description').map((i) => `${i.level} ${i.path}`)).toEqual(['warning registry:A1']);
});

test('udl-representation is info for a module with no asset or plan item', () => {
  const dir = course();
  put(dir, '05-media/media-plan.yaml', `schema: media-plan/v1\nitems:\n${planItem('P1', 'M1', 'O1')}`);
  registry(dir, { id: 'A1', module: 'M2', status: 'rejected' });
  expect(only(dir, 'udl-representation')).toEqual([{
    level: 'info', check: 'udl-representation', path: 'modules:M2',
    message: 'module M2 has only text; plan at least one other representation (UDL)',
  }]);
  registry(dir, { id: 'A1', module: 'M2', status: 'generated' });
  expect(only(dir, 'udl-representation')).toEqual([]);
});

test('a course with no 05-media folder gives no media errors', () => {
  const dir = course();
  rmSync(join(dir, '05-media'), { recursive: true });
  const r = auditCourse(dir);
  expect(r.issues.filter((i) => i.level === 'error')).toEqual([]);
  expect(r.issues.map((i) => i.check)).toEqual(['udl-representation', 'udl-representation']);
});

async function run(argv: string[]) {
  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  try {
    const code = await runCli(argv, coreCommands);
    return { code, out: logs.join('') };
  } finally { vi.restoreAllMocks(); }
}

test('audit CLI exits 0 with errors in the report, and exits 2 for a bad course.yaml', async () => {
  const dir = course((m) => { m.modules[0]!.objectives = ['O9']; });
  const r = await run(['audit', '--course', dir]);
  expect(r.code).toBe(0);
  expect(JSON.parse(r.out)).toMatchObject({ ok: false, counts: { error: 1 } });
  writeFileSync(join(dir, 'course.yaml'), 'schema: nope\n');
  expect((await run(['audit', '--course', dir])).code).toBe(2);
});
