import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import patternsYaml from '../../data/providers.yaml';
import { ValidationError } from '../errors.js';

export const DetectedProvidersSchema = z.object({
  detectedAt: z.string(),
  image: z.array(z.string()),
  diagram: z.array(z.string()),
  designSkills: z.array(z.string()),
  codex: z.object({ available: z.boolean(), loggedIn: z.boolean() }),
});
export type DetectedProviders = z.infer<typeof DetectedProvidersSchema>;

const PatternsSchema = z.object({ image: z.array(z.string()), diagram: z.array(z.string()), designSkills: z.array(z.string()) });
export type ProviderPatterns = z.infer<typeof PatternsSchema>;

const FILE = ['.course', 'providers.json'];

export function parseDetectedProviders(raw: unknown, what = 'detected providers'): DetectedProviders {
  const r = DetectedProvidersSchema.safeParse(raw);
  if (!r.success) {
    throw new ValidationError(`invalid ${what}: ${r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`);
  }
  return r.data;
}

export function recordProviders(courseDir: string, d: DetectedProviders): void {
  const data = parseDetectedProviders(d);
  mkdirSync(join(courseDir, FILE[0]), { recursive: true });
  writeFileSync(join(courseDir, ...FILE), JSON.stringify(data, null, 2) + '\n');
}

export function loadProviders(courseDir: string): DetectedProviders | null {
  const f = join(courseDir, ...FILE);
  if (!existsSync(f)) return null;
  let raw: unknown;
  try { raw = JSON.parse(readFileSync(f, 'utf8')); }
  catch { throw new ValidationError(`cannot parse ${f}`); }
  return parseDetectedProviders(raw, f);
}

/** The bundled data/providers.yaml: name patterns for each capability. */
export function providerPatterns(): ProviderPatterns {
  return PatternsSchema.parse(parse(patternsYaml));
}
