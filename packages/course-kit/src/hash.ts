import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Scalar } from 'yaml';
import { readFrontmatter, writeFrontmatter } from './frontmatter.js';

/** First 8 hex chars of MD5, matching v2 `md5sum | cut -c1-8`. */
export function hashFile(path: string): string {
  return createHash('md5').update(readFileSync(path)).digest('hex').slice(0, 8);
}

function sourceFilesOf(data: Record<string, unknown>): Record<string, string> {
  const sf = data.sourceFiles;
  return sf && typeof sf === 'object' ? (sf as Record<string, string>) : {};
}

function currentHash(courseDir: string, rel: string): string | undefined {
  const p = resolve(courseDir, rel);
  return existsSync(p) ? hashFile(p) : undefined;
}

export function checkStale(
  outputPath: string,
  courseDir: string,
): { status: 'missing-output' | 'fresh' | 'stale'; changed: string[] } {
  if (!existsSync(outputPath)) return { status: 'missing-output', changed: [] };
  const { data } = readFrontmatter(outputPath, { strings: true });
  const stored = (data.sourceHashes && typeof data.sourceHashes === 'object' ? data.sourceHashes : {}) as Record<string, string>;
  const changed = Object.entries(sourceFilesOf(data))
    .filter(([key, rel]) => currentHash(courseDir, rel) !== stored[key])
    .map(([key]) => key);
  return { status: changed.length ? 'stale' : 'fresh', changed };
}

export function writeHashes(outputPath: string, courseDir: string): void {
  const { data } = readFrontmatter(outputPath);
  const hashes: Record<string, Scalar> = {};
  for (const [key, rel] of Object.entries(sourceFilesOf(data))) {
    const h = currentHash(courseDir, rel);
    if (h) {
      const node = new Scalar(h);
      node.type = 'QUOTE_DOUBLE';
      hashes[key] = node;
    }
  }
  data.sourceHashes = hashes;
  writeFrontmatter(outputPath, data);
}
