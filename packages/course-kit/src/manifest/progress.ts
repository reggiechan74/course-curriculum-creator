import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkStale } from '../hash.js';
import { type Manifest, type StageName, loadManifest, saveManifest } from './io.js';

export interface StageDef {
  name: StageName; skill: string; outputs: string[]; required: boolean; when?: 'virtual-or-hybrid';
}

const W = 'workflow';
export const STAGES: StageDef[] = [
  { name: 'positioning', skill: `${W}/0-analysis/create-course/SKILL.md`, outputs: ['01-planning/course-positioning.md'], required: true },
  { name: 'needsAnalysis', skill: `${W}/0-analysis/assess-needs/SKILL.md`, outputs: ['01-planning/training-needs-analysis.md'], required: false },
  { name: 'learnerProfile', skill: `${W}/0-analysis/generate-learner-profile/SKILL.md`, outputs: ['01-planning/learner-profile.md'], required: true },
  { name: 'objectives', skill: `${W}/1-desired-results/generate-objectives/SKILL.md`, outputs: ['01-planning/learning-objectives.md'], required: true },
  { name: 'rubrics', skill: `${W}/2-assessment-evidence/generate-rubrics/SKILL.md`, outputs: ['03-assessment/rubrics.md'], required: true },
  { name: 'outline', skill: `${W}/3-learning-plan/generate-outline/SKILL.md`, outputs: ['02-design/course-outline.md'], required: true },
  { name: 'lessonPlans', skill: `${W}/3-learning-plan/generate-lesson-plans/SKILL.md`, outputs: ['02-design/lesson-plans.md'], required: true },
  { name: 'preWork', skill: `${W}/3-learning-plan/generate-pre-work/SKILL.md`, outputs: ['04-materials/pre-work.md'], required: true },
  { name: 'materials', skill: `${W}/4-materials/generate-artifacts/SKILL.md`, outputs: ['04-materials/student-handout.md', '04-materials/instructor-guide.md'], required: false },
  { name: 'description', skill: `${W}/4-materials/generate-description/SKILL.md`, outputs: ['01-planning/course-description.md'], required: true },
  { name: 'transferPlan', skill: `${W}/3-learning-plan/generate-transfer-plan/SKILL.md`, outputs: ['04-materials/transfer-plan.md'], required: false },
  { name: 'evaluationPlan', skill: `${W}/2-assessment-evidence/generate-evaluation-plan/SKILL.md`, outputs: ['03-assessment/evaluation-plan.md'], required: false },
  { name: 'spacedPractice', skill: `${W}/6-delivery/generate-spaced-practice/SKILL.md`, outputs: ['04-materials/spaced-practice.md'], required: true },
  { name: 'virtualAdaptation', skill: `${W}/4-materials/adapt-for-virtual/SKILL.md`, outputs: ['02-design/virtual-adaptation.md'], required: true, when: 'virtual-or-hybrid' },
];

export interface StageProgress {
  name: StageName; skill: string; output: string;
  status: 'present' | 'missing' | 'stale' | 'skipped'; required: boolean; changed: string[];
}
export interface Progress { stages: StageProgress[]; next: { name: StageName; skill: string } | null }

/** `manifest` overrides course.yaml (a dry-run migration has none yet). */
export function computeProgress(courseDir: string, manifest?: Manifest): Progress {
  const m = manifest ?? loadManifest(courseDir);
  const stages: StageProgress[] = [];
  for (const def of STAGES) {
    if (def.when === 'virtual-or-hybrid' && m.delivery !== 'virtual' && m.delivery !== 'hybrid') continue;
    const existing = def.outputs.find((o) => existsSync(join(courseDir, o)));
    const output = existing ?? def.outputs[0];
    let status: StageProgress['status'];
    let changed: string[] = [];
    if (m.stages?.[def.name] === 'skipped') status = 'skipped';
    else if (!existing) status = 'missing';
    else {
      const s = checkStale(join(courseDir, existing), courseDir);
      status = s.status === 'stale' ? 'stale' : 'present';
      changed = s.changed;
    }
    stages.push({ name: def.name, skill: def.skill, output, status, required: def.required, changed });
  }
  const n = stages.find((s) => s.required && (s.status === 'missing' || s.status === 'stale'));
  return { stages, next: n ? { name: n.name, skill: n.skill } : null };
}

export function writeProgress(courseDir: string): Progress {
  const m = loadManifest(courseDir);
  const p = computeProgress(courseDir, m);
  m.stages = Object.fromEntries(p.stages.map((s) => [s.name, s.status]));
  saveManifest(courseDir, m);
  return p;
}

export function setSkipped(courseDir: string, stage: StageName, skipped: boolean): Progress {
  const m = loadManifest(courseDir);
  const stages = { ...m.stages };
  if (skipped) stages[stage] = 'skipped'; else delete stages[stage];
  m.stages = stages;
  saveManifest(courseDir, m);
  return computeProgress(courseDir, m);
}
