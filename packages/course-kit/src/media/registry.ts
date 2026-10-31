import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationError } from '../errors.js';
import { type Asset, type AssetStatus, type Registry, RegistrySchema, type ReviewRecord } from './schema.js';

const FILE = ['05-media', 'registry.json'];

export function loadRegistry(courseDir: string): Registry {
  const f = join(courseDir, ...FILE);
  if (!existsSync(f)) return { schema: 'registry/v1', assets: [] };
  let raw: unknown;
  try { raw = JSON.parse(readFileSync(f, 'utf8')); }
  catch { throw new ValidationError(`cannot parse ${f}`); }
  const r = RegistrySchema.safeParse(raw);
  if (!r.success) {
    throw new ValidationError(`invalid registry: ${r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`);
  }
  return r.data;
}

export function saveRegistry(courseDir: string, r: Registry): void {
  mkdirSync(join(courseDir, FILE[0]), { recursive: true });
  writeFileSync(join(courseDir, ...FILE), JSON.stringify(r, null, 2) + '\n');
}

export function addAsset(r: Registry, a: Asset): Registry {
  if (a.status === 'approved') {
    throw new ValidationError('Assets cannot be added as approved; add as generated or imported, then approve with registry status');
  }
  if (r.assets.some((x) => x.id === a.id)) throw new ValidationError(`duplicate asset id ${a.id}`);
  return { ...r, assets: [...r.assets, a] };
}

const TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  generated: ['approved', 'rejected'],
  rejected: ['generated'],
  imported: ['approved', 'rejected'],
  approved: [],
};

export function setStatus(
  r: Registry, id: string, to: AssetStatus, opts: { review?: ReviewRecord; approvedBy?: 'user' } = {},
): Registry {
  const a = r.assets.find((x) => x.id === id);
  if (!a) throw new ValidationError(`unknown asset id ${id}`);
  if (!TRANSITIONS[a.status].includes(to)) throw new ValidationError(`cannot change asset ${id} from ${a.status} to ${to}`);
  if (to === 'approved') {
    if (!a.alt.trim()) throw new ValidationError(`asset ${id} needs alt text before approval`);
    if (opts.approvedBy !== 'user') throw new ValidationError(`asset ${id} must be approved by the user (approvedBy: user)`);
  }
  const next: Asset = { ...a, status: to };
  if (opts.review) next.review = opts.review;
  if (opts.approvedBy) next.approvedBy = opts.approvedBy;
  return { ...r, assets: r.assets.map((x) => (x.id === id ? next : x)) };
}
