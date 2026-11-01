import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
import { type InitOptions, initManifest, loadManifest, saveManifest } from '../src/manifest/io.js';
import { STAGES, computeProgress, setSkipped, writeProgress } from '../src/manifest/progress.js';

const opts: InitOptions = {
  title: 'Prog', shape: 'workshop', delivery: 'in-person',
  sessions: [{ id: 'S1', label: 'Day 1', minutes: 420 }], audienceLevel: 'professional',
  audienceSummary: 'x', budgetUsd: 20, maxPlanImages: 40,
};

function course(delivery: InitOptions['delivery'] = 'in-person'): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'kit-')), 'Course');
  mkdirSync(dir, { recursive: true });
  saveManifest(dir, initManifest({ ...opts, delivery }, '2026-10-31'));
  put(dir, '01-planning/course-positioning.md', '# Positioning\n');
  return dir;
}
function put(dir: string, rel: string, text: string): void {
  mkdirSync(dirname(join(dir, rel)), { recursive: true });
  writeFileSync(join(dir, rel), text);
}
const status = (dir: string, name: string) => computeProgress(dir).stages.find((s) => s.name === name)?.status;

async function run(argv: string[]) {
  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  const code = await runCli(argv, coreCommands);
  vi.restoreAllMocks();
  return { code, out: JSON.parse(logs.join('')) };
}

test('a new course has positioning present and learnerProfile next', () => {
  const p = computeProgress(course());
  expect(p.stages[0]).toMatchObject({ name: 'positioning', status: 'present' });
  expect(p.stages.map((s) => s.name)).not.toContain('virtualAdaptation');
  expect(p.next).toEqual({ name: 'learnerProfile', skill: 'workflow/0-analysis/generate-learner-profile/SKILL.md' });
});

test('a stale output is reported stale with the changed keys, and is next', () => {
  const dir = course();
  put(dir, '01-planning/learner-profile.md', '# LP\n');
  put(dir, '01-planning/learning-objectives.md',
    '---\nsourceFiles:\n  positioning: 01-planning/course-positioning.md\nsourceHashes:\n  positioning: "00000000"\n---\n# Obj\n');
  const p = computeProgress(dir);
  expect(p.stages.find((s) => s.name === 'objectives')).toMatchObject({ status: 'stale', changed: ['positioning'] });
  expect(p.next?.name).toBe('objectives');
});

test('an output with no sourceFiles is present', () => {
  const dir = course();
  put(dir, '01-planning/learning-objectives.md', '---\ntitle: x\n---\n# Obj\n');
  expect(status(dir, 'objectives')).toBe('present');
});

test('optional stages are never next', () => {
  const dir = course();
  for (const s of STAGES) if (s.required && s.when === undefined) for (const o of s.outputs) put(dir, o, '# x\n');
  const p = computeProgress(dir);
  expect(p.stages.find((s) => s.name === 'transferPlan')?.status).toBe('missing');
  expect(p.next).toBeNull();
});

test('virtualAdaptation is listed only for virtual or hybrid delivery', () => {
  expect(computeProgress(course('in-person')).stages.map((s) => s.name)).not.toContain('virtualAdaptation');
  expect(computeProgress(course('virtual')).stages.map((s) => s.name)).toContain('virtualAdaptation');
  expect(computeProgress(course('hybrid')).stages.map((s) => s.name)).toContain('virtualAdaptation');
});

test('an explicit manifest is used when there is no course.yaml', () => {
  const dir = mkdtempSync(join(tmpdir(), 'kit-'));
  const m = initManifest({ ...opts, delivery: 'virtual' }, '2026-10-31');
  expect(computeProgress(dir, m).stages.map((s) => s.name)).toContain('virtualAdaptation');
});

test('materials uses the instructor guide when there is no handout', () => {
  const dir = course();
  put(dir, '04-materials/instructor-guide.md', '# IG\n');
  const m = computeProgress(dir).stages.find((s) => s.name === 'materials');
  expect(m).toMatchObject({ status: 'present', output: '04-materials/instructor-guide.md' });
});

test('skip then unskip', () => {
  const dir = course();
  put(dir, '01-planning/learning-objectives.md', '# o\n');
  let p = setSkipped(dir, 'learnerProfile', true);
  expect(p.stages.find((s) => s.name === 'learnerProfile')?.status).toBe('skipped');
  expect(p.next?.name).toBe('rubrics');
  expect(loadManifest(dir).stages?.learnerProfile).toBe('skipped');
  p = setSkipped(dir, 'learnerProfile', false);
  expect(loadManifest(dir).stages?.learnerProfile).toBeUndefined();
  expect(p.stages.find((s) => s.name === 'learnerProfile')?.status).toBe('missing');
});

test('writeProgress saves the statuses and a second run gives the same file', () => {
  const dir = course();
  const p = writeProgress(dir);
  expect(loadManifest(dir).stages?.positioning).toBe('present');
  expect(loadManifest(dir).stages?.learnerProfile).toBe('missing');
  const first = readFileSync(join(dir, 'course.yaml'), 'utf8');
  expect(writeProgress(dir)).toEqual(p);
  expect(readFileSync(join(dir, 'course.yaml'), 'utf8')).toBe(first);
});

test('progress CLI: prints progress, unknown stage is exit 1', async () => {
  const dir = course();
  const r = await run(['progress', '--course', dir]);
  expect(r.code).toBe(0);
  expect(r.out.next.name).toBe('learnerProfile');
  expect((await run(['progress', 'skip', 'nope', '--course', dir])).code).toBe(1);
  expect((await run(['progress', 'skip', 'learnerProfile', '--course', dir])).code).toBe(0);
  expect(loadManifest(dir).stages?.learnerProfile).toBe('skipped');
  expect((await run(['progress', 'unskip', 'learnerProfile', '--course', dir])).code).toBe(0);
  expect(loadManifest(dir).stages?.learnerProfile).toBeUndefined();
});

test('a self-paced course never lists virtualAdaptation, whatever its delivery', () => {
  for (const delivery of ['virtual', 'hybrid', 'async'] as const) {
    const dir = join(mkdtempSync(join(tmpdir(), 'kit-')), 'Course');
    mkdirSync(dir, { recursive: true });
    saveManifest(dir, initManifest({ ...opts, shape: 'self-paced', sessions: [], delivery }, '2026-10-31'));
    expect(computeProgress(dir).stages.map((s) => s.name)).not.toContain('virtualAdaptation');
  }
});
