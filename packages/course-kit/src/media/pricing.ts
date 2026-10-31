import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import bundled from '../../data/pricing.json' with { type: 'json' };
import { ValidationError } from '../errors.js';
import { type Pricing, PricingSchema } from './schema.js';

/** ${dataDir}/pricing.json overrides the bundled file. */
export function loadPricing(dataDir?: string): Pricing {
  let raw: unknown = bundled;
  if (dataDir) {
    const f = join(dataDir, 'pricing.json');
    if (existsSync(f)) {
      try { raw = JSON.parse(readFileSync(f, 'utf8')); }
      catch { throw new ValidationError(`cannot parse ${f}`); }
    }
  }
  const r = PricingSchema.safeParse(raw);
  if (!r.success) throw new ValidationError(`invalid pricing.json: ${r.error.issues.map((i) => i.message).join('; ')}`);
  return r.data;
}
