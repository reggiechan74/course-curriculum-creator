import { loadManifest, validateManifest } from './manifest/io.js';
import { computeProgress } from './manifest/progress.js';
import { loadPlan } from './media/plan.js';
import { loadRegistry } from './media/registry.js';

export type AuditCheck =
  | 'manifest' | 'objective-coverage' | 'stale' | 'media-links' | 'media-alt' | 'media-long-description' | 'udl-representation';
export interface AuditIssue { level: 'error' | 'warning' | 'info'; check: AuditCheck; path: string; message: string }
export interface AuditReport {
  ok: boolean;
  issues: AuditIssue[];
  counts: { error: number; warning: number; info: number };
}

/** Deterministic course audit. Throws ValidationError when course.yaml cannot be loaded. */
export function auditCourse(courseDir: string): AuditReport {
  const m = loadManifest(courseDir);
  const issues: AuditIssue[] = [];
  const add = (level: AuditIssue['level'], check: AuditCheck, path: string, message: string) =>
    issues.push({ level, check, path, message });

  for (const i of validateManifest(m)) add(i.level, 'manifest', i.path, i.message);

  const covered = new Set(m.modules.flatMap((x) => x.objectives));
  m.objectives.forEach((o, i) => {
    if ((o.kind === 'cognitive' || o.kind === 'affective') && !covered.has(o.id)) {
      add('warning', 'objective-coverage', `objectives[${i}]`, `objective ${o.id} is not covered by any module`);
    }
  });

  for (const s of computeProgress(courseDir, m).stages) {
    if (s.status === 'stale') {
      add('warning', 'stale', s.output, `${s.name} is stale; changed sources: ${s.changed.join(', ')}`);
    }
  }

  const registry = loadRegistry(courseDir);
  const plan = loadPlan(courseDir);
  const objIds = new Set(m.objectives.map((o) => o.id));
  const modIds = new Set(m.modules.map((x) => x.id));
  const link = (path: string, objectives: string[], module: string | undefined) => {
    for (const id of objectives) {
      if (!objIds.has(id)) add('error', 'media-links', path, `unknown objective ${id}`);
    }
    if (module !== undefined && !modIds.has(module)) add('error', 'media-links', path, `unknown module ${module}`);
  };

  const named = new Set<string>();
  for (const a of registry.assets) {
    const path = `registry:${a.id}`;
    link(path, a.objectives, a.module);
    if (a.status !== 'rejected' && a.module !== undefined) named.add(a.module);
    if (a.alt.trim() === '') {
      if (a.status === 'approved') add('error', 'media-alt', path, `approved asset ${a.id} has no alt text`);
      else if (a.status === 'imported') add('warning', 'media-alt', path, `imported asset ${a.id} has no alt text`);
    }
    if (a.status === 'approved' && (a.kind === 'diagram' || a.kind === 'chart') && !(a.longDescription ?? '').trim()) {
      add('warning', 'media-long-description', path, `approved ${a.kind} ${a.id} has no long description`);
    }
  }
  for (const p of plan.items) {
    link(`plan:${p.id}`, p.objectives, p.module);
    named.add(p.module);
  }

  for (const x of m.modules) {
    if (!named.has(x.id)) {
      add('info', 'udl-representation', `modules:${x.id}`,
        `module ${x.id} has only text; plan at least one other representation (UDL)`);
    }
  }

  const counts = { error: 0, warning: 0, info: 0 };
  for (const i of issues) counts[i.level]++;
  return { ok: counts.error === 0, issues, counts };
}
