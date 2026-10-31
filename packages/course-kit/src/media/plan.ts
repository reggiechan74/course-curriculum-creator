import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { ValidationError } from '../errors.js';
import type { Manifest, ValidationIssue } from '../manifest/io.js';
import { type MediaPlan, MediaPlanSchema, type Pricing, type Registry } from './schema.js';

const FILE = ['05-media', 'media-plan.yaml'];
const DIAGRAM_ONLY = new Set(['concept-map', 'process-flow', 'comparison', 'hierarchy', 'cycle', 'timeline']);

export function loadPlan(courseDir: string): MediaPlan {
  const f = join(courseDir, ...FILE);
  if (!existsSync(f)) return { schema: 'media-plan/v1', items: [] };
  let raw: unknown;
  try { raw = parse(readFileSync(f, 'utf8')); }
  catch { throw new ValidationError(`cannot parse ${f}`); }
  const r = MediaPlanSchema.safeParse(raw);
  if (!r.success) {
    throw new ValidationError(`invalid media plan: ${r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`);
  }
  return r.data;
}

export function savePlan(courseDir: string, p: MediaPlan): void {
  mkdirSync(join(courseDir, FILE[0]), { recursive: true });
  writeFileSync(join(courseDir, ...FILE), stringify(p));
}

export function validatePlan(p: MediaPlan, m: Manifest, r: Registry): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const objs = new Set(m.objectives.map((o) => o.id));
  const mods = new Set(m.modules.map((x) => x.id));
  const seen = new Set<string>();
  p.items.forEach((it, i) => {
    const at = `items[${i}]`;
    if (seen.has(it.id)) out.push({ level: 'error', path: `${at}.id`, message: `duplicate plan item id ${it.id}` });
    seen.add(it.id);
    if (it.objectives.length === 0) out.push({ level: 'error', path: `${at}.objectives`, message: `Item ${it.id} has no objectives.` });
    it.objectives.forEach((o, j) => {
      if (!objs.has(o)) out.push({ level: 'error', path: `${at}.objectives[${j}]`, message: `Item ${it.id} names unknown objective ${o}.` });
    });
    if (!mods.has(it.module)) out.push({ level: 'error', path: `${at}.module`, message: `Item ${it.id} names unknown module ${it.module}.` });
    if (DIAGRAM_ONLY.has(it.function) && it.kind === 'image') {
      out.push({ level: 'error', path: `${at}.kind`, message: `Item ${it.id}: function ${it.function} must use kind diagram, not image.` });
    }
  });
  r.assets.forEach((a, i) => {
    const at = `assets[${i}]`;
    a.objectives.forEach((o, j) => {
      if (!objs.has(o)) out.push({ level: 'error', path: `${at}.objectives[${j}]`, message: `Asset ${a.id} names unknown objective ${o}.` });
    });
    if (a.module !== undefined && !mods.has(a.module)) {
      out.push({ level: 'error', path: `${at}.module`, message: `Asset ${a.id} names unknown module ${a.module}.` });
    }
  });
  const covered = new Set(p.items.filter((it) => it.status !== 'rejected').map((it) => it.module));
  m.modules.forEach((mod, i) => {
    if (!covered.has(mod.id)) {
      out.push({ level: 'warning', path: `modules[${i}]`, message: `Module ${mod.id} has text only. UDL needs 2 or more representation modes.` });
    }
  });
  return out;
}

export function estimatePlan(p: MediaPlan, pricing: Pricing, quality: 'draft' | 'standard' | 'high'): {
  perModule: Record<string, { usd: number; quota: number }>; totalUsd: number; totalQuota: number;
} {
  // c is in micro-dollars (integer); rounded to cents only for output.
  const cents: Record<string, { c: number; quota: number }> = {};
  for (const it of p.items) {
    if (it.status === 'rejected') continue;
    const e = (cents[it.module] ??= { c: 0, quota: 0 });
    if (it.provider === 'openai' && it.kind === 'image') {
      const price = pricing.image['openai:gpt-image-2']?.[quality];
      if (price === undefined) throw new ValidationError('pricing has no entry for openai:gpt-image-2');
      e.c += Math.round(price * 1_000_000);
    } else if (it.provider === 'codex' && it.kind === 'image') {
      e.quota += it.quotaUnits ?? 1;
    }
  }
  const perModule: Record<string, { usd: number; quota: number }> = {};
  let totalC = 0, totalQuota = 0;
  for (const [k, v] of Object.entries(cents)) {
    perModule[k] = { usd: Math.round(v.c / 10_000) / 100, quota: v.quota };
    totalC += v.c; totalQuota += v.quota;
  }
  return { perModule, totalUsd: Math.round(totalC / 10_000) / 100, totalQuota };
}
