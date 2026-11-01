import { cpSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { auditCourse } from '../src/audit.js';
import { loadManifest, validateManifest } from '../src/manifest/io.js';
import { computeProgress } from '../src/manifest/progress.js';
import { SHAPE_RULES, summarizeManifest } from '../src/manifest/summary.js';
import { syncManifest } from '../src/manifest/sync.js';

const here = dirname(fileURLToPath(import.meta.url));
const samples = join(here, '../../../plugins/course-curriculum-creator/examples/courses');

function copy(name: string): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'sample-')), name);
  cpSync(join(samples, name), dir, { recursive: true });
  return dir;
}

const cases = [
  { name: 'workshop', title: 'Lease Basics', shape: 'workshop' as const },
  { name: 'cohort', title: 'Underwriting Lab', shape: 'cohort' as const },
  { name: 'self-paced', title: 'Cap Rates for New Analysts', shape: 'self-paced' as const },
];

describe.each(cases)('sample course $name', ({ name, title, shape }) => {
  test('manifest validate gives no errors', () => {
    const m = loadManifest(copy(name));
    expect(m.title).toBe(title);
    expect(m.shape).toBe(shape);
    expect(validateManifest(m).filter((i) => i.level === 'error')).toEqual([]);
  });

  test('sync (write false) gives the same objectives and modules as course.yaml', () => {
    const dir = copy(name);
    const m = loadManifest(dir);
    const synced = syncManifest(dir, { write: false }).manifest;
    expect(synced.objectives).toEqual(m.objectives);
    expect(synced.modules).toEqual(m.modules);
    expect(synced.timeBudget).toEqual(m.timeBudget);
  });

  test('audit gives ok true', () => {
    expect(auditCourse(copy(name)).ok).toBe(true);
  });

  test('progress next is learnerProfile', () => {
    expect(computeProgress(copy(name)).next?.name).toBe('learnerProfile');
  });

  test('summary rules match the shape', () => {
    expect(summarizeManifest(loadManifest(copy(name))).rules).toEqual(SHAPE_RULES[shape]);
  });
});

test('workshop has one 420 minute session and 3 modules', () => {
  const s = summarizeManifest(loadManifest(copy('workshop')));
  expect(s.sessions).toHaveLength(1);
  expect(s.sessions[0]?.minutes).toBe(420);
  expect(s.modules).toBe(3);
  expect(s.objectives).toBe(3);
});

test('cohort has 4 sessions of 90 minutes with one module each', () => {
  const s = summarizeManifest(loadManifest(copy('cohort')));
  expect(s.sessions).toHaveLength(4);
  for (const x of s.sessions) {
    expect(x.minutes).toBe(90);
    expect(x.modules).toHaveLength(1);
  }
});

test('self-paced has no sessions, 3 unscheduled modules and async minutes', () => {
  const s = summarizeManifest(loadManifest(copy('self-paced')));
  expect(s.sessions).toEqual([]);
  expect(s.unscheduledModules).toHaveLength(3);
  expect(s.asyncMinutes.total).toBeGreaterThan(0);
});
