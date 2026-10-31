import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
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
  expect(r.questions.map((q) => q.id)).toEqual(['alt:IMG-bmc', 'alt:IMG-vpd']);
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

test('migrate-course CLI prints the report', async () => {
  const out: string[] = [];
  const spy = vi.spyOn(process.stdout, 'write').mockImplementation((s) => { out.push(String(s)); return true; });
  const code = await runCli(['migrate-course', '--course', dir, '--dry-run'], coreCommands);
  spy.mockRestore();
  expect(code).toBe(0);
  expect(JSON.parse(out.join('')).imported).toEqual(['IMG-bmc', 'IMG-vpd']);
  expect(existsSync(join(dir, 'course.yaml'))).toBe(false);
});
