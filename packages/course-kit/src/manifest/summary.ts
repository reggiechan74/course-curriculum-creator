import type { Delivery, Manifest, Shape } from './schema.js';

export const SHAPE_RULES: Record<Shape, string[]> = {
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
};

export interface ManifestSummary {
  id: string; title: string; shape: Shape; delivery: Delivery;
  sessions: { id: string; label: string; minutes: number; modules: string[]; plannedMinutes: number }[];
  liveMinutes: number;
  asyncMinutes: { preWork: number; betweenSessions: number; postWork: number; total: number };
  unscheduledModules: string[];
  objectives: number; modules: number;
  rules: string[];
}

export function summarizeManifest(m: Manifest): ManifestSummary {
  const live = m.timeBudget.live?.sessions ?? [];
  const sessionIds = new Set(live.map((s) => s.id));
  const a = m.timeBudget.async;
  const preWork = a?.preWorkMinutes ?? 0;
  const betweenSessions = a?.betweenSessionMinutes ?? 0;
  const postWork = a?.postWorkMinutes ?? 0;
  return {
    id: m.id, title: m.title, shape: m.shape, delivery: m.delivery,
    sessions: live.map((s) => {
      const mods = m.modules.filter((x) => x.session === s.id);
      return {
        id: s.id, label: s.label, minutes: s.minutes, modules: mods.map((x) => x.id),
        plannedMinutes: mods.reduce((n, x) => n + (x.minutes ?? 0), 0),
      };
    }),
    liveMinutes: live.reduce((n, s) => n + s.minutes, 0),
    asyncMinutes: { preWork, betweenSessions, postWork, total: preWork + betweenSessions + postWork },
    unscheduledModules: m.modules.filter((x) => x.session === undefined || !sessionIds.has(x.session)).map((x) => x.id),
    objectives: m.objectives.length,
    modules: m.modules.length,
    rules: SHAPE_RULES[m.shape],
  };
}
