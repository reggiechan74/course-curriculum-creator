import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CommandTable, requireFlag, requirePositional, runCli } from './cli/args.js';
import { UsageError, ValidationError } from './errors.js';
import { checkStale, hashFile, writeHashes } from './hash.js';
import { InitOptionsSchema, initManifest, loadManifest, saveManifest, validateManifest } from './manifest/io.js';
import { syncManifest } from './manifest/sync.js';
import { estimatePlan, loadPlan, validatePlan } from './media/plan.js';
import { loadPricing } from './media/pricing.js';
import { addAsset, loadRegistry, saveRegistry, setStatus } from './media/registry.js';
import { AssetSchema, AssetStatusSchema, ReviewRecordSchema } from './media/schema.js';

function jsonFlag(raw: string, flag: string): unknown {
  try { return JSON.parse(raw); } catch { throw new UsageError(`--${flag} must be valid JSON`); }
}
function zodMsg(e: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return e.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
}

export const coreCommands: CommandTable = {
  hash: (a) => ({ hash: hashFile(requirePositional(a, 0, 'file')) }),
  stale: (a) => checkStale(requirePositional(a, 0, 'output'), requireFlag(a, 'course')),
  'hash-write': (a) => {
    writeHashes(requirePositional(a, 0, 'output'), requireFlag(a, 'course'));
    return { ok: true };
  },
  'manifest init': (a) => {
    const course = requireFlag(a, 'course');
    let raw: unknown;
    try { raw = JSON.parse(requireFlag(a, 'json')); }
    catch { throw new UsageError('--json must be valid JSON'); }
    const parsed = InitOptionsSchema.safeParse(raw);
    if (!parsed.success) {
      throw new UsageError(`invalid --json: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`);
    }
    if (existsSync(join(course, 'course.yaml')) && a.flags.force !== true) {
      throw new UsageError(`course.yaml already exists in ${course}; pass --force to overwrite`);
    }
    const opts = parsed.data;
    const m = initManifest(opts, new Date().toISOString().slice(0, 10));
    const issues = validateManifest(m).filter((i) => i.level === 'error');
    if (issues.length) throw new ValidationError(JSON.stringify({ issues }));
    mkdirSync(course, { recursive: true });
    saveManifest(course, m);
    return { manifest: m };
  },
  'manifest sync': (a) => syncManifest(requireFlag(a, 'course'), { write: a.flags.write === true }),
  'manifest validate': (a) => {
    const issues = validateManifest(loadManifest(requireFlag(a, 'course')));
    if (issues.some((i) => i.level === 'error')) throw new ValidationError(JSON.stringify({ issues }));
    return { issues };
  },
  'registry list': (a) => ({ assets: loadRegistry(requireFlag(a, 'course')).assets }),
  'registry add': (a) => {
    const course = requireFlag(a, 'course');
    const parsed = AssetSchema.safeParse(jsonFlag(requireFlag(a, 'json'), 'json'));
    if (!parsed.success) throw new ValidationError(`invalid asset: ${zodMsg(parsed.error)}`);
    saveRegistry(course, addAsset(loadRegistry(course), parsed.data));
    return { asset: parsed.data };
  },
  'registry status': (a) => {
    const course = requireFlag(a, 'course');
    const id = requirePositional(a, 0, 'id');
    const to = AssetStatusSchema.safeParse(requirePositional(a, 1, 'to'));
    if (!to.success) throw new UsageError('<to> must be one of generated, approved, rejected, imported');
    const opts: { review?: import('./media/schema.js').ReviewRecord; approvedBy?: 'user' } = {};
    const by = a.flags['approved-by'];
    if (by !== undefined) {
      if (by !== 'user') throw new UsageError('--approved-by must be "user"');
      opts.approvedBy = 'user';
    }
    if (typeof a.flags.review === 'string') {
      const rv = ReviewRecordSchema.safeParse(jsonFlag(a.flags.review, 'review'));
      if (!rv.success) throw new UsageError(`invalid --review: ${zodMsg(rv.error)}`);
      opts.review = rv.data;
    }
    const next = setStatus(loadRegistry(course), id, to.data, opts);
    saveRegistry(course, next);
    return { asset: next.assets.find((x) => x.id === id) };
  },
  'plan validate': (a) => {
    const course = requireFlag(a, 'course');
    const issues = validatePlan(loadPlan(course), loadManifest(course), loadRegistry(course));
    if (issues.some((i) => i.level === 'error')) throw new ValidationError(JSON.stringify({ issues }));
    return { issues };
  },
  'plan estimate': (a) => {
    const course = requireFlag(a, 'course');
    const q = requireFlag(a, 'quality');
    if (q !== 'draft' && q !== 'standard' && q !== 'high') throw new UsageError('--quality must be draft, standard or high');
    const dir = typeof a.flags['data-dir'] === 'string' ? a.flags['data-dir'] : undefined;
    return estimatePlan(loadPlan(course), loadPricing(dir), q);
  },
};
