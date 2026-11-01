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
      ...(opts.async
        ? { async: opts.async }
        : async ? { async: { preWorkMinutes: 0, betweenSessionMinutes: 0, postWorkMinutes: 0 } } : {}),
    },
    objectives: [],
    modules: [],
    media: { budgetUsd: opts.budgetUsd, maxPlanImages: opts.maxPlanImages, approvalRequired: true },
    targets: {},
  };
}

/**
 * Top-level keys the schema does not know (hand-added, e.g. `notes:`) would be dropped on parse.
 * Move them into `extra` instead, so a later save keeps them there. An existing `extra` key wins.
 */
function withUnknownKeysInExtra(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const known = new Set(Object.keys(ManifestSchema.shape));
  const obj = raw as Record<string, unknown>;
  const unknown = Object.keys(obj).filter((k) => !known.has(k));
  if (!unknown.length) return raw;
  const extra = obj.extra && typeof obj.extra === 'object' && !Array.isArray(obj.extra) ? (obj.extra as Record<string, unknown>) : undefined;
  if (obj.extra !== undefined && !extra) return raw; // invalid extra: let the schema report it
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) if (known.has(k)) out[k] = obj[k];
  const merged: Record<string, unknown> = { ...extra };
  for (const k of unknown) if (!Object.hasOwn(merged, k)) merged[k] = obj[k];
  out.extra = merged;
  return out;
}

export function loadManifest(courseDir: string): Manifest {
  let raw: unknown;
  try {
    raw = parse(readFileSync(join(courseDir, FILE), 'utf8'));
  } catch (e) {
    throw new ValidationError(`cannot read ${FILE}: ${e instanceof Error ? e.message : String(e)}`);
  }
  const r = ManifestSchema.safeParse(withUnknownKeysInExtra(raw));
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
    if (mod.session !== undefined && m.shape === 'self-paced') {
      out.push({
        level: 'error', path: `modules[${i}].session`,
        message: `module ${mod.id} names session ${mod.session}, but a self-paced course has no sessions`,
      });
    } else if (mod.session !== undefined) {
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
  if (m.shape === 'self-paced' && !m.timeBudget.async) {
    out.push({ level: 'warning', path: 'timeBudget.async', message: 'a self-paced course needs an async time budget' });
  }
  if (m.shape === 'self-paced' && m.delivery !== 'async') {
    out.push({
      level: 'warning', path: 'delivery',
      message: `a self-paced course has delivery "async"; "${m.delivery}" makes it look live`,
    });
  }
  if (m.shape === 'cohort' && sessions.length === 1) {
    out.push({
      level: 'warning', path: 'timeBudget.live.sessions',
      message: 'a cohort has at least 2 sessions; 1 session suggests shape "workshop"',
    });
  }
  if ((m.shape === 'workshop' || m.shape === 'cohort') && sessions.length === 0) {
    out.push({ level: 'warning', path: 'timeBudget.live', message: `a ${m.shape} has no live sessions` });
  }
  sessions.forEach((s, i) => {
    if (s.minutes <= 0) return;
    const total = m.modules.filter((x) => x.session === s.id).reduce((n, x) => n + (x.minutes ?? 0), 0);
    if (total > s.minutes) {
      out.push({
        level: 'warning', path: `timeBudget.live.sessions[${i}]`,
        message: `modules in session ${s.id} add up to ${total} min, more than the session's ${s.minutes} min`,
      });
    }
  });
  return out;
}
