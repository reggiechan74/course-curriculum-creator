import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { expect, test } from 'vitest';
import { checkStale, writeHashes } from '../src/hash.js';
import { syncManifest } from '../src/manifest/sync.js';
import { embedAll, embedOne } from '../src/media/embed.js';
import { migrateV2 } from '../src/migrate/v2.js';

const OBJ = '01-planning/learning-objectives.md';
const OUT = '02-design/course-outline.md';
const LP = '02-design/lesson-plans.md';
const GUIDE = '04-materials/instructor-guide.md';
const STALE = '04-materials/student-handout.md';

/**
 * v2-sample plus downstream outputs:
 * - lesson-plans (fresh): sources objectives + outline; has module headings, so it gets ID comments too.
 * - instructor-guide (fresh): sources lesson-plans (a chain: refreshing lesson-plans changes its bytes).
 * - student-handout (stale): sources outline, with a wrong stored hash.
 */
function course(): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'fresh-')), 'Intro 101');
  cpSync(join(import.meta.dirname, 'fixtures', 'v2-sample'), dir, { recursive: true });
  mkdirSync(join(dir, '04-materials'), { recursive: true });
  writeFileSync(join(dir, LP), `---\ntitle: LP\nsourceFiles:\n  objectives: "${OBJ}"\n  outline: "${OUT}"\n---\n\n# Lesson Plans\n\n## Module 1: Lease Anatomy\n\nText\n`);
  writeFileSync(join(dir, GUIDE), `---\ntitle: Guide\nsourceFiles:\n  lesson-plans: "${LP}"\n---\n\n# Guide\n`);
  writeFileSync(join(dir, STALE), `---\ntitle: Handout\nsourceFiles:\n  outline: "${OUT}"\nsourceHashes:\n  outline: "00000000"\n---\n\n# Handout\n`);
  writeHashes(join(dir, LP), dir);
  writeHashes(join(dir, GUIDE), dir);
  expect(status(dir)).toEqual({ lp: 'fresh', guide: 'fresh', stale: 'stale' });
  return dir;
}
const status = (dir: string) => ({
  lp: checkStale(join(dir, LP), dir).status,
  guide: checkStale(join(dir, GUIDE), dir).status,
  stale: checkStale(join(dir, STALE), dir).status,
});

test('migrate keeps fresh downstream outputs fresh and stale ones stale', () => {
  const dir = course();
  const r = migrateV2(dir, { dryRun: false });
  expect(r.actions).toContain(`insert ID comments in ${OBJ}`);
  expect(status(dir)).toEqual({ lp: 'fresh', guide: 'fresh', stale: 'stale' });
});

test('manifest sync --write keeps fresh downstream outputs fresh and stale ones stale', () => {
  const dir = course();
  syncManifest(dir, { write: true });
  expect(status(dir)).toEqual({ lp: 'fresh', guide: 'fresh', stale: 'stale' });
});

test('embed all and embed keep fresh downstream outputs fresh and stale ones stale', () => {
  const dir = course();
  syncManifest(dir, { write: true });
  const item = { id: 'A-M1-01', module: 'M1', objectives: ['LO-1'], function: 'concept-map', kind: 'diagram',
    description: 'parts of a lease', provider: 'mermaid', estimateUsd: 0, quotaUnits: 0, status: 'approved' };
  const item2 = { ...item, id: 'A-M1-02', description: 'clause map' };
  mkdirSync(join(dir, '05-media'), { recursive: true });
  writeFileSync(join(dir, '05-media', 'media-plan.yaml'), stringify({ schema: 'media-plan/v1', items: [item] }));
  expect(embedAll(dir)[0]).toMatchObject({ file: LP, placeholders: ['A-M1-01'] });
  expect(status(dir)).toEqual({ lp: 'fresh', guide: 'fresh', stale: 'stale' });
  writeFileSync(join(dir, '05-media', 'media-plan.yaml'), stringify({ schema: 'media-plan/v1', items: [item, item2] }));
  embedOne(dir, join(dir, LP), 'A-M1-02', 'M1');
  expect(status(dir)).toEqual({ lp: 'fresh', guide: 'fresh', stale: 'stale' });
});
