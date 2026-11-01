import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, resolve } from 'node:path';
import { ValidationError } from '../errors.js';
import { readFrontmatter } from '../frontmatter.js';
import { keepFresh } from '../hash.js';
import {
  type Manifest, type Shape, type SourceRef, type StageName, ShapeSchema,
  initManifest, loadManifest, saveManifest,
} from '../manifest/io.js';
import { syncManifest } from '../manifest/sync.js';
import { addAsset, loadRegistry, saveRegistry } from '../media/registry.js';
import type { Asset } from '../media/schema.js';

export interface MigrationQuestion { id: string; text: string; default?: string }
export interface MigrationReport { manifest: Manifest; actions: string[]; questions: MigrationQuestion[]; imported: string[] }

const POSITIONING = '01-planning/course-positioning.md';
const ID_COMMENT_FILES = [
  '01-planning/learning-objectives.md', '02-design/course-outline.md', '02-design/lesson-plans.md',
  '04-materials/student-handout.md', '04-materials/instructor-guide.md',
];
const V2_PLANNING = new Set([
  'README.md', 'course-positioning.md', 'course-description.md', 'learning-objectives.md',
  'training-needs-analysis.md', 'learner-profile.md', 'content-sources.md',
]);
const STAGE_FILES: Partial<Record<StageName, string>> = {
  positioning: POSITIONING,
  objectives: '01-planning/learning-objectives.md',
  rubrics: '03-assessment/rubrics.md',
  outline: '02-design/course-outline.md',
  lessonPlans: '02-design/lesson-plans.md',
};
const MATERIAL_STAGE_FILES = ['04-materials/student-handout.md', '04-materials/instructor-guide.md'];
const IMAGE_EXT = /\.(png|jpe?g|svg)$/i;
const MAPPED_KEYS = new Set(['title', 'status', 'audience', 'version', 'date']);

export function parseDuration(s: string): { shape: Shape; days?: number } {
  const n = /(\d+)\s*-?\s*day/i.exec(s);
  const days = n ? Number(n[1]) : undefined;
  if (days !== undefined) return { shape: days > 2 || /week/i.test(s) ? 'cohort' : 'workshop', days };
  if (/week/i.test(s)) return { shape: 'cohort' };
  return { shape: 'workshop' };
}

function listFiles(root: string, rel = ''): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(root, rel), { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...listFiles(root, r));
    else out.push(r);
  }
  return out.sort();
}

function externalLinks(readme: string): string[] {
  const found = new Set<string>();
  for (const m of readme.matchAll(/\]\(\s*<?([^)\s>]+)/g)) {
    const target = m[1].split('#')[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('/')) continue;
    if (posix.normalize(target).startsWith('../')) found.add(target);
  }
  return [...found].sort();
}

function computeSources(dir: string): SourceRef[] {
  const files = listFiles(dir);
  const has = new Set(files);
  const derived: SourceRef[] = [], variant: SourceRef[] = [], source: SourceRef[] = [], material: SourceRef[] = [];
  for (const f of files) {
    const dirName = posix.dirname(f), name = posix.basename(f);
    if (f.endsWith('.pdf') && has.has(f.replace(/\.pdf$/, '.md'))) derived.push({ path: f, role: 'derived', of: f.replace(/\.pdf$/, '.md') });
    if (dirName === '02-design' && /^course-outline-.+\.md$/.test(name)) variant.push({ path: f, role: 'variant', of: '02-design/course-outline.md' });
    if (dirName === '01-planning' && name.endsWith('.md') && !V2_PLANNING.has(name)) source.push({ path: f, role: 'source' });
    if (dirName === '04-materials' && name.endsWith('.md') && name !== 'README.md' && !MATERIAL_STAGE_FILES.includes(f)) {
      material.push({ path: f, role: 'material' });
    }
  }
  const external: SourceRef[] = has.has('README.md')
    ? externalLinks(readFileSync(join(dir, 'README.md'), 'utf8')).map((path) => ({ path, role: 'external' as const }))
    : [];
  return [...derived, ...variant, ...source, ...material, ...external];
}

export function migrateV2(courseDir: string, o: { dryRun: boolean; answers?: Record<string, string> }): MigrationReport {
  const answers = o.answers ?? {};
  const dir = resolve(courseDir);
  const actions: string[] = [];
  const questions: MigrationQuestion[] = [];

  // Run the sync in a scratch copy so the course itself is untouched until we know what changes.
  const scratch = mkdtempSync(join(tmpdir(), 'migrate-'));
  try {
    for (const rel of [...ID_COMMENT_FILES, 'course.yaml']) {
      if (!existsSync(join(dir, rel))) continue;
      mkdirSync(dirname(join(scratch, rel)), { recursive: true });
      cpSync(join(dir, rel), join(scratch, rel));
    }
    const synced = syncManifest(scratch, { write: true }).manifest;
    const existing = existsSync(join(dir, 'course.yaml')) ? loadManifest(dir) : undefined;

    const fm = existsSync(join(dir, POSITIONING)) ? readFrontmatter(join(dir, POSITIONING)).data : {};
    const extraNew: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fm)) if (!MAPPED_KEYS.has(k)) extraNew[k] = v;

    let target: Manifest;
    if (existing) {
      target = { ...synced };
    } else {
      const rawTitle = typeof fm.title === 'string' ? fm.title : synced.title;
      const title = rawTitle.replace(/\s+-\s+Course Positioning\s*$/, '');
      const dur = typeof fm.duration === 'string' ? fm.duration : typeof fm.format === 'string' ? fm.format : '';
      const parsed = parseDuration(dur);
      let shape: Shape = parsed.shape;
      if (parsed.shape === 'workshop' && parsed.days === undefined) {
        if (answers.shape === undefined) {
          questions.push({ id: 'shape', text: 'What is the course shape: workshop (1-2 sessions), cohort (several sessions with work between) or self-paced?', default: 'workshop' });
        }
      }
      if (answers.shape !== undefined) {
        const s = ShapeSchema.safeParse(answers.shape);
        if (!s.success) throw new ValidationError(`answer "shape" must be one of workshop, cohort, self-paced`);
        shape = s.data;
      }
      const sessions = shape === 'self-paced' ? [] : synced.timeBudget.live?.sessions ?? [];
      target = initManifest({
        title, shape, delivery: 'in-person', sessions,
        audienceLevel: 'professional', audienceSummary: typeof fm.audience === 'string' ? fm.audience : '',
        budgetUsd: 20, maxPlanImages: 40,
      }, typeof fm.date === 'string' && /^\d{4}-\d\d-\d\d$/.test(fm.date) ? fm.date : new Date().toISOString().slice(0, 10));
      target.objectives = synced.objectives;
      target.modules = synced.modules;
      if (typeof fm.status === 'string' && ['draft', 'review', 'final'].includes(fm.status)) target.status = fm.status as Manifest['status'];
      if (typeof fm.version === 'string') target.version = fm.version;
    }

    const computed = computeSources(dir);
    const kept = (existing?.sources ?? []).filter((s) => !computed.some((c) => c.path === s.path));
    target.sources = [...computed, ...kept];

    const present = (rel: string) => existsSync(join(dir, rel));
    const stages: Manifest['stages'] = {};
    for (const [k, rel] of Object.entries(STAGE_FILES)) stages[k as StageName] = present(rel) ? 'present' : 'missing';
    stages.materials = MATERIAL_STAGE_FILES.some(present) ? 'present' : 'missing';
    target.stages = stages;
    target.extra = { ...extraNew, ...(existing?.extra ?? {}) };

    // Registry: imported images.
    let registry = loadRegistry(dir);
    const imported: string[] = [];
    const registryActions: string[] = [];
    const matDir = join(dir, '04-materials');
    const images = existsSync(matDir) ? readdirSync(matDir).filter((f) => IMAGE_EXT.test(f)).sort() : [];
    const now = new Date().toISOString();
    for (const name of images) {
      const id = `IMG-${name.replace(/\.[^.]+$/, '')}`;
      if (imported.includes(id)) continue;
      imported.push(id);
      const answered = answers[`alt:${id}`];
      const found = registry.assets.find((a) => a.id === id);
      if (found) {
        if (found.alt === '' && answered) {
          registry = { ...registry, assets: registry.assets.map((a) => (a.id === id ? { ...a, alt: answered } : a)) };
          registryActions.push(`set alt on registry asset ${id}`);
        } else if (found.alt === '') {
          questions.push({ id: `alt:${id}`, text: `Alt text for 04-materials/${name}` });
        }
        continue;
      }
      const asset: Asset = {
        id, kind: 'image', objectives: [], provider: 'imported', files: [`04-materials/${name}`],
        alt: answered ?? '', status: 'imported', costUsd: 0, quotaUnits: 0, createdAt: now,
      };
      registry = addAsset(registry, asset);
      registryActions.push(`add registry asset ${id}`);
      if (!answered) questions.push({ id: `alt:${id}`, text: `Alt text for 04-materials/${name}` });
    }
    imported.sort();

    // Diff against the current files.
    const probe = join(scratch, 'probe');
    mkdirSync(probe);
    saveManifest(probe, target);
    const next = readFileSync(join(probe, 'course.yaml'), 'utf8');
    const manifestChanged = !existing || readFileSync(join(dir, 'course.yaml'), 'utf8') !== next;
    if (manifestChanged) actions.push('write course.yaml');
    actions.push(...registryActions);
    const idChanges = ID_COMMENT_FILES.filter((rel) => existsSync(join(scratch, rel)) && existsSync(join(dir, rel))
      && readFileSync(join(scratch, rel), 'utf8') !== readFileSync(join(dir, rel), 'utf8'));
    for (const rel of idChanges) actions.push(`insert ID comments in ${rel}`);

    if (!o.dryRun) {
      keepFresh(dir, () => {
        if (manifestChanged) writeFileSync(join(dir, 'course.yaml'), next);
        if (registryActions.length) saveRegistry(dir, registry);
        for (const rel of idChanges) writeFileSync(join(dir, rel), readFileSync(join(scratch, rel), 'utf8'));
      });
    }
    return { manifest: target, actions, questions, imported };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
