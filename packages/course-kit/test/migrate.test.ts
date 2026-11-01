import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
import { writeHashes } from '../src/hash.js';
import { loadManifest, validateManifest } from '../src/manifest/io.js';
import { loadRegistry } from '../src/media/registry.js';
import { migrateV2, parseDuration } from '../src/migrate/v2.js';

let dir: string;
beforeEach(() => {
  dir = join(mkdtempSync(join(tmpdir(), 'migrate-')), 'CRE-201');
  cpSync(join(import.meta.dirname, 'fixtures/CRE-201'), dir, { recursive: true });
});

function snapshot(root: string, rel = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of readdirSync(join(root, rel))) {
    const r = rel ? `${rel}/${n}` : n;
    if (statSync(join(root, r)).isDirectory()) Object.assign(out, snapshot(root, r));
    else out[r] = readFileSync(join(root, r)).toString('base64');
  }
  return out;
}

test('parseDuration', () => {
  expect(parseDuration('4-day (two weekends)')).toEqual({ shape: 'cohort', days: 4 });
  expect(parseDuration('1-day')).toEqual({ shape: 'workshop', days: 1 });
  expect(parseDuration('2-day')).toEqual({ shape: 'workshop', days: 2 });
  expect(parseDuration('3-day')).toEqual({ shape: 'cohort', days: 3 });
  expect(parseDuration('six weeks')).toEqual({ shape: 'cohort' });
  expect(parseDuration('whenever')).toEqual({ shape: 'workshop' });
});

test('CRE-201 migration report', () => {
  const r = migrateV2(dir, { dryRun: true });
  expect(r.manifest.title).toBe('CRE-201: AI for CRE');
  expect(r.manifest.shape).toBe('cohort');
  expect(r.manifest.timeBudget.live!.sessions).toHaveLength(4);
  expect(r.manifest.sources).toEqual(expect.arrayContaining([
    { path: '01-planning/teaching-notes.md', role: 'source' },
    { path: '02-design/course-outline-1day.md', role: 'variant', of: '02-design/course-outline.md' },
    { path: '01-planning/course-positioning.pdf', role: 'derived', of: '01-planning/course-positioning.md' },
    { path: '../CRE_Series_Framework.md', role: 'external' },
    { path: '04-materials/CRE_Metaphor_Map.md', role: 'material' },
  ]));
  expect(r.manifest.sources).not.toContainEqual({ path: '04-materials/README.md', role: 'material' });
  expect(r.imported).toEqual(['IMG-bmc', 'IMG-vpd']);
  expect(r.questions.map((q) => q.id)).toEqual(['alt:IMG-bmc', 'objectives:IMG-bmc', 'alt:IMG-vpd', 'objectives:IMG-vpd']);
  expect(r.manifest.stages).toMatchObject({ lessonPlans: 'missing', materials: 'missing', rubrics: 'present' });
  expect(r.manifest.extra).toMatchObject({ revisionNote: expect.any(String), organization: expect.any(String), duration: expect.any(String) });
  expect(r.actions).toEqual(expect.arrayContaining(['write course.yaml', 'add registry asset IMG-bmc', 'insert ID comments in 02-design/course-outline.md']));
});

test('dry run writes no file', () => {
  const before = snapshot(dir);
  migrateV2(dir, { dryRun: true, answers: { 'alt:IMG-bmc': 'x' } });
  expect(snapshot(dir)).toEqual(before);
});

test('a real run then manifest validate gives no errors', () => {
  migrateV2(dir, { dryRun: false, answers: { 'alt:IMG-bmc': 'Business model canvas', 'alt:IMG-vpd': 'Value proposition design' } });
  expect(validateManifest(loadManifest(dir)).filter((i) => i.level === 'error')).toEqual([]);
  const a = loadRegistry(dir).assets;
  expect(a.map((x) => [x.id, x.status, x.alt])).toEqual([
    ['IMG-bmc', 'imported', 'Business model canvas'], ['IMG-vpd', 'imported', 'Value proposition design'],
  ]);
  expect(readFileSync(join(dir, '02-design/course-outline.md'), 'utf8')).toContain('<!-- id: M1 -->');
});

test('a real run on an already migrated course changes nothing', () => {
  const answers = { 'alt:IMG-bmc': 'a', 'alt:IMG-vpd': 'b' };
  migrateV2(dir, { dryRun: false, answers });
  const before = snapshot(dir);
  const again = migrateV2(dir, { dryRun: false, answers });
  expect(again.actions).toEqual([]);
  expect(again.questions).toEqual([]);
  expect(snapshot(dir)).toEqual(before);
});

test('unparseable duration asks the shape question and an answer overrides', () => {
  const p = join(dir, '01-planning/course-positioning.md');
  writeFileSync(p, readFileSync(p, 'utf8').replace('duration: "4-day (two weekends)"', 'duration: "flexible"'));
  const r = migrateV2(dir, { dryRun: true });
  expect(r.questions[0]).toMatchObject({ id: 'shape', default: 'workshop' });
  expect(r.manifest.shape).toBe('workshop');
  expect(migrateV2(dir, { dryRun: true, answers: { shape: 'cohort' } }).manifest.shape).toBe('cohort');
});

test('parseDuration reads self-paced and session or week counts', () => {
  expect(parseDuration('self-paced online')).toEqual({ shape: 'self-paced' });
  expect(parseDuration('6 sessions')).toEqual({ shape: 'cohort', sessions: 6 });
  expect(parseDuration('8-week cohort')).toEqual({ shape: 'cohort', sessions: 8 });
  expect(parseDuration('4-day (two weekends)')).toEqual({ shape: 'cohort', days: 4 });
});

function setPositioning(from: string, to: string): void {
  const p = join(dir, '01-planning/course-positioning.md');
  writeFileSync(p, readFileSync(p, 'utf8').replace(from, to));
}

async function cli(args: string[]): Promise<{ code: number; out: string }> {
  const out: string[] = [];
  const o = vi.spyOn(process.stdout, 'write').mockImplementation((s) => { out.push(String(s)); return true; });
  const e = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  try {
    const code = await runCli(args, coreCommands);
    return { code, out: out.join('') };
  } finally { o.mockRestore(); e.mockRestore(); }
}

test('deliveryMode virtual is read; an unknown value asks; a bad answer is exit 2', async () => {
  setPositioning('duration:', 'deliveryMode: virtual\nduration:');
  const r = migrateV2(dir, { dryRun: true });
  expect(r.manifest.delivery).toBe('virtual');
  expect(r.questions.map((q) => q.id)).not.toContain('delivery');
  setPositioning('deliveryMode: virtual', 'deliveryMode: online-ish');
  const q = migrateV2(dir, { dryRun: true });
  expect(q.manifest.delivery).toBe('in-person');
  expect(q.questions.find((x) => x.id === 'delivery')).toEqual({
    id: 'delivery', text: 'What is the delivery mode: in-person, virtual or hybrid?', default: 'in-person',
  });
  expect(migrateV2(dir, { dryRun: true, answers: { delivery: 'hybrid' } }).manifest.delivery).toBe('hybrid');
  const before = snapshot(dir);
  const res = await cli(['migrate-course', '--course', dir, '--answers', '{"delivery":"mars"}']);
  expect(res.code).toBe(2);
  expect(snapshot(dir)).toEqual(before);
});

test('audienceLevel is read from the frontmatter', () => {
  setPositioning('duration:', 'audienceLevel: advanced\nduration:');
  expect(migrateV2(dir, { dryRun: true }).manifest.audience.level).toBe('advanced');
});

test('a 6-session course with no outline sessions gets S1..S6 and asks sessionMinutes', () => {
  rmSync(join(dir, '02-design/course-outline.md'));
  setPositioning('duration: "4-day (two weekends)"', 'duration: "6 sessions"');
  const r = migrateV2(dir, { dryRun: true });
  const s = r.manifest.timeBudget.live!.sessions;
  expect(s.map((x) => x.id)).toEqual(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);
  expect(s[0]).toEqual({ id: 'S1', label: 'Session 1', minutes: 90 });
  expect(r.questions.find((x) => x.id === 'sessionMinutes')).toMatchObject({ default: '90' });
  const a = migrateV2(dir, { dryRun: true, answers: { sessionMinutes: '120' } });
  expect(a.manifest.timeBudget.live!.sessions.every((x) => x.minutes === 120)).toBe(true);
  expect(a.questions.map((x) => x.id)).not.toContain('sessionMinutes');
  expect(() => migrateV2(dir, { dryRun: true, answers: { sessionMinutes: '0' } })).toThrow(/positive integer/);
});

test('CRE-201 asks objectives for bmc and vpd; answers set them', () => {
  const r = migrateV2(dir, { dryRun: true });
  expect(r.questions.find((q) => q.id === 'objectives:IMG-bmc')!.text).toContain('04-materials/bmc.png');
  migrateV2(dir, { dryRun: false, answers: { 'alt:IMG-bmc': 'a', 'alt:IMG-vpd': 'b', 'objectives:IMG-bmc': 'LO-3', 'objectives:IMG-vpd': 'LO-3, LO-2' } });
  const assets = loadRegistry(dir).assets;
  expect(assets.find((x) => x.id === 'IMG-bmc')!.objectives).toEqual(['LO-3']);
  expect(assets.find((x) => x.id === 'IMG-vpd')!.objectives).toEqual(['LO-3', 'LO-2']);
});

test('an unknown objective ID in an answer is exit 2 and no file changes', async () => {
  const before = snapshot(dir);
  const res = await cli(['migrate-course', '--course', dir, '--answers', '{"objectives:IMG-bmc":"LO-99"}']);
  expect(res.code).toBe(2);
  expect(snapshot(dir)).toEqual(before);
});

test('dry run changes equal the real run changes, and the second real run has no changes', () => {
  const answers = { 'alt:IMG-bmc': 'a', 'alt:IMG-vpd': 'b', 'objectives:IMG-bmc': 'LO-1' };
  const dry = migrateV2(dir, { dryRun: true, answers });
  const real = migrateV2(dir, { dryRun: false, answers });
  expect(real.changes).toEqual(dry.changes);
  expect(real.changes.map((c) => c.file)).toEqual(expect.arrayContaining(['course.yaml', '05-media/registry.json', '02-design/course-outline.md']));
  expect(real.changes.find((c) => c.file === 'course.yaml')).toMatchObject({ change: 'create', removed: 0 });
  expect(real.changes.find((c) => c.file === 'course.yaml')!.added).toBeGreaterThan(10);
  expect(real.changes.find((c) => c.file === '02-design/course-outline.md')).toMatchObject({ change: 'modify' });
  expect(migrateV2(dir, { dryRun: false, answers }).changes).toEqual([]);
});

test('stages come from progress', () => {
  // The fixture's outline carries old source hashes, so progress reports it stale until they are rewritten.
  expect(migrateV2(dir, { dryRun: true }).manifest.stages).toMatchObject({ lessonPlans: 'missing', outline: 'stale' });
  writeHashes(join(dir, '02-design/course-outline.md'), dir);
  const r = migrateV2(dir, { dryRun: true });
  expect(r.manifest.stages).toMatchObject({ lessonPlans: 'missing', outline: 'present' });
  expect(r.manifest.stages).toHaveProperty('spacedPractice');
});

test('migrate-course CLI prints the report', async () => {
  const out: string[] = [];
  const spy = vi.spyOn(process.stdout, 'write').mockImplementation((s) => { out.push(String(s)); return true; });
  const code = await runCli(['migrate-course', '--course', dir, '--dry-run'], coreCommands);
  spy.mockRestore();
  expect(code).toBe(0);
  expect(JSON.parse(out.join('')).imported).toEqual(['IMG-bmc', 'IMG-vpd']);
  expect(existsSync(join(dir, 'course.yaml'))).toBe(false);
});
