import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test, vi } from 'vitest';
import { coreCommands } from '../src/cli-core.js';
import { runCli } from '../src/cli/args.js';
import { type InitOptions, initManifest, saveManifest } from '../src/manifest/io.js';
import { SHAPE_RULES, summarizeManifest } from '../src/manifest/summary.js';

const base: InitOptions = {
  title: 'Cohort Course', shape: 'cohort', delivery: 'virtual',
  sessions: [{ id: 'S1', label: 'Week 1', minutes: 90 }, { id: 'S2', label: 'Week 2', minutes: 90 }],
  audienceLevel: 'professional', audienceSummary: 'x', budgetUsd: 20, maxPlanImages: 40,
};
function cohort() {
  const m = initManifest({ ...base, async: { preWorkMinutes: 10, betweenSessionMinutes: 20, postWorkMinutes: 30 } }, '2026-10-31');
  m.objectives = [{ id: 'LO-1', title: 'a', kind: 'cognitive' }];
  m.modules = [
    { id: 'M1', title: 'A', session: 'S1', objectives: ['LO-1'], minutes: 50 },
    { id: 'M2', title: 'B', session: 'S1', objectives: ['LO-1'], minutes: 30 },
    { id: 'M3', title: 'C', session: 'S2', objectives: ['LO-1'], minutes: 90 },
  ];
  return m;
}

test('summarizeManifest gives sessions with their modules and planned minutes', () => {
  const s = summarizeManifest(cohort());
  expect(s.sessions[0]).toMatchObject({ id: 'S1', label: 'Week 1', minutes: 90, modules: ['M1', 'M2'], plannedMinutes: 80 });
  expect(s.sessions[1].modules).toEqual(['M3']);
  expect(s.liveMinutes).toBe(180);
  expect(s.asyncMinutes).toEqual({ preWork: 10, betweenSessions: 20, postWork: 30, total: 60 });
  expect(s.unscheduledModules).toEqual([]);
  expect(s.objectives).toBe(1);
  expect(s.modules).toBe(3);
});

test('summarizeManifest of a self-paced course lists every module as unscheduled', () => {
  const m = initManifest({
    ...base, shape: 'self-paced', delivery: 'async', sessions: [],
    async: { preWorkMinutes: 5, betweenSessionMinutes: 10, postWorkMinutes: 15 },
  }, '2026-10-31');
  m.modules = [{ id: 'M1', title: 'A', objectives: [] }, { id: 'M2', title: 'B', objectives: [] }];
  const s = summarizeManifest(m);
  expect(s.sessions).toEqual([]);
  expect(s.liveMinutes).toBe(0);
  expect(s.unscheduledModules).toEqual(['M1', 'M2']);
  expect(s.asyncMinutes.total).toBe(30);
});

test('rules are the exact shape rules', () => {
  expect(SHAPE_RULES).toEqual({
    workshop: [
      'Workshop: 1 or 2 live sessions. Give pre-work before the first session and spaced practice after the last session.',
    ],
    cohort: [
      'Cohort: open each session with retrieval practice on the previous session.',
      'Cohort: give a transfer assignment and discussion prompts between sessions.',
      'Cohort: write facilitator notes for each session.',
    ],
    'self-paced': [
      'Self-paced: there are no live sessions. The learner hub is the primary delivery surface.',
      'Self-paced: use more worked examples, and fade the scaffolding across modules.',
      'Self-paced: end every module with interactive practice and feedback.',
      'Self-paced: give a time-on-task estimate for every module and activity.',
      'Self-paced: make assessments auto-checkable items, or self-assessment with model answers.',
    ],
  });
  for (const shape of ['workshop', 'cohort', 'self-paced'] as const) {
    const m = initManifest({ ...base, shape, sessions: shape === 'self-paced' ? [] : base.sessions }, '2026-10-31');
    expect(summarizeManifest(m).rules).toEqual(SHAPE_RULES[shape]);
  }
});

test('manifest summary CLI prints the summary', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'kit-'));
  saveManifest(dir, cohort());
  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  const code = await runCli(['manifest', 'summary', '--course', dir], coreCommands);
  vi.restoreAllMocks();
  expect(code).toBe(0);
  expect(JSON.parse(logs.join(''))).toEqual(summarizeManifest(cohort()));
});
