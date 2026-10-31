import { readFileSync, writeFileSync } from 'node:fs';
import { parse, parseDocument, stringify } from 'yaml';

// Closing `---` must start a line; it may be followed by a newline or end of file.
const FM = /^---[ \t]*\r?\n((?:[\s\S]*?\r?\n)?)---[ \t]*(?:\r?\n([\s\S]*))?$/;

export function readFrontmatter(
  path: string,
  opts: { strings?: boolean } = {},
): { data: Record<string, unknown>; body: string } {
  const text = readFileSync(path, 'utf8');
  const m = FM.exec(text);
  if (!m) return { data: {}, body: text };
  // strings: keep every scalar as text so values like 00123456 or 1234e567 are not coerced to numbers.
  const data = parse(m[1], opts.strings ? { schema: 'failsafe' } : undefined) as unknown;
  return {
    data: data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : {},
    body: m[2] ?? '',
  };
}

export function writeFrontmatter(path: string, data: Record<string, unknown>): void {
  const { body } = readFrontmatter(path);
  const yaml = Object.keys(data).length ? stringify(data) : '';
  writeFileSync(path, `---\n${yaml}---\n${body}`);
}

/** Sets only the given top-level keys; all other frontmatter text is preserved as written. */
export function updateFrontmatter(path: string, patch: Record<string, unknown>): void {
  const text = readFileSync(path, 'utf8');
  const m = FM.exec(text);
  // failsafe schema: scalars stay as their original text instead of being re-resolved (1.10, 00123, 1234e567).
  const doc = parseDocument(m ? m[1] : '', { schema: 'failsafe' });
  for (const [k, v] of Object.entries(patch)) doc.set(k, doc.createNode(v));
  const body = m ? (m[2] ?? '') : text;
  writeFileSync(path, `---\n${doc.toString()}---\n${body}`);
}
