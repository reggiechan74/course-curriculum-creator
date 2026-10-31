import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { ValidationError } from '../errors.js';
import {
  type InitOptions, type Manifest, ManifestSchema, type ValidationIssue,
} from './schema.js';

export type { InitOptions, Manifest, ValidationIssue } from './schema.js';
export * from './schema.js';

const FILE = 'course.yaml';

function slug(title: string): string {
  return title.normalize('NFKD').replace(/[^\x00-\x7F]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function initManifest(opts: InitOptions, today: string): Manifest {
  const async = opts.shape === 'self-paced' || opts.delivery === 'async' || opts.shape === 'cohort';
  const hasLive = opts.shape !== 'self-paced' && opts.sessions.length > 0;
  return {
    schema: 'course/v3',
    id: slug(opts.title),
    title: opts.title,
    version: '0.1.0',
    status: 'draft',
    created: today,
    shape: opts.shape,
    delivery: opts.delivery,
    audience: { level: opts.audienceLevel, summary: opts.audienceSummary },
    timeBudget: {
      ...(hasLive ? { live: { sessions: opts.sessions } } : {}),
      ...(async ? { async: { preWorkMinutes: 0, betweenSessionMinutes: 0, postWorkMinutes: 0 } } : {}),
    },
    objectives: [],
    modules: [],
    media: { budgetUsd: opts.budgetUsd, maxPlanImages: opts.maxPlanImages, approvalRequired: true },
    targets: {},
  };
}

export function loadManifest(courseDir: string): Manifest {
  let raw: unknown;
  try {
    raw = parse(readFileSync(join(courseDir, FILE), 'utf8'));
  } catch (e) {
    throw new ValidationError(`cannot read ${FILE}: ${e instanceof Error ? e.message : String(e)}`);
  }
  const r = ManifestSchema.safeParse(raw);
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new ValidationError(`invalid ${FILE}: ${msg}`);
  }
  return r.data;
}

export function saveManifest(courseDir: string, m: Manifest): void {
  const ordered: Record<string, unknown> = {};
  for (const key of Object.keys(ManifestSchema.shape)) {
    const v = (m as Record<string, unknown>)[key];
    if (v !== undefined) ordered[key] = v;
  }
  writeFileSync(join(courseDir, FILE), stringify(ordered));
}

function duplicates(ids: string[], list: string, out: ValidationIssue[]): void {
  const seen = new Set<string>();
  ids.forEach((id, i) => {
    if (seen.has(id)) out.push({ level: 'error', path: `${list}[${i}].id`, message: `duplicate id ${id}` });
    seen.add(id);
  });
}

export function validateManifest(m: Manifest): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const sessions = m.timeBudget.live?.sessions ?? [];
  duplicates(m.objectives.map((o) => o.id), 'objectives', out);
  duplicates(m.modules.map((x) => x.id), 'modules', out);
  duplicates(sessions.map((s) => s.id), 'timeBudget.live.sessions', out);

  const objIds = new Set(m.objectives.map((o) => o.id));
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  m.modules.forEach((mod, i) => {
    mod.objectives.forEach((id, j) => {
      if (!objIds.has(id)) {
        out.push({ level: 'error', path: `modules[${i}].objectives[${j}]`, message: `unknown objective ${id}` });
      }
    });
    if (mod.session !== undefined) {
      const s = sessionById.get(mod.session);
      if (!s) {
        out.push({ level: 'error', path: `modules[${i}].session`, message: `unknown session ${mod.session}` });
      } else if (mod.minutes !== undefined && mod.minutes > s.minutes) {
        out.push({
          level: 'warning', path: `modules[${i}].minutes`,
          message: `module ${mod.id} (${mod.minutes} min) is longer than session ${s.id} (${s.minutes} min)`,
        });
      }
    }
  });

  if (m.shape === 'self-paced' && m.timeBudget.live) {
    out.push({ level: 'error', path: 'timeBudget.live', message: 'a self-paced course cannot have live sessions' });
  }
  if (m.shape === 'workshop' && sessions.length > 2) {
    out.push({
      level: 'warning', path: 'timeBudget.live.sessions',
      message: `a workshop has at most 2 sessions; ${sessions.length} sessions suggests shape "cohort"`,
    });
  }
  return out;
}
