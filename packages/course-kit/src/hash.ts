import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Scalar } from 'yaml';
import { readFrontmatter, updateFrontmatter } from './frontmatter.js';

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
  const { data } = readFrontmatter(outputPath, { strings: true });
  const hashes: Record<string, Scalar> = {};
  for (const [key, rel] of Object.entries(sourceFilesOf(data))) {
    const h = currentHash(courseDir, rel);
    if (h) {
      const node = new Scalar(h);
      node.type = 'QUOTE_DOUBLE';
      hashes[key] = node;
    }
  }
  updateFrontmatter(outputPath, { sourceHashes: hashes });
}

function listMarkdown(root: string, rel = ''): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(root, rel), { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const r = rel ? join(rel, e.name) : e.name;
    if (e.isDirectory()) out.push(...listMarkdown(root, r));
    else if (e.name.endsWith('.md')) out.push(join(root, r));
  }
  return out;
}

/** Outputs (any .md in the course with `sourceFiles` frontmatter) that are fresh now. */
export function freshOutputs(courseDir: string): string[] {
  const dir = resolve(courseDir);
  return listMarkdown(dir).filter((p) => {
    try {
      const { data } = readFrontmatter(p, { strings: true });
      return Object.keys(sourceFilesOf(data)).length > 0 && checkStale(p, dir).status === 'fresh';
    } catch { return false; /* unreadable frontmatter: leave it alone */ }
  });
}

/**
 * Rewrites the hashes of the given outputs that have gone stale. Repeats until stable, because
 * refreshing one output changes its bytes, which can make an output that hashes it stale.
 */
export function refreshOutputs(courseDir: string, outputs: string[]): void {
  const dir = resolve(courseDir);
  for (let round = 0; round <= outputs.length; round++) {
    let changed = false;
    for (const p of outputs) {
      if (checkStale(p, dir).status === 'stale') { writeHashes(p, dir); changed = true; }
    }
    if (!changed) return;
  }
}

/**
 * Runs a toolkit write (ID comments, media blocks) that changes source files, then recomputes the
 * hashes of exactly the outputs that were fresh before it. Outputs that were already stale stay stale.
 */
export function keepFresh<T>(courseDir: string, write: () => T): T {
  const fresh = freshOutputs(courseDir);
  const result = write();
  refreshOutputs(courseDir, fresh);
  return result;
}

/** Sets frontmatter `sourceFiles` (key order kept). Paths are relative to the course folder. */
export function setSources(outputPath: string, sources: Record<string, string>): void {
  updateFrontmatter(outputPath, { sourceFiles: sources });
}
