import { readFileSync, writeFileSync } from 'node:fs';
import { parse, stringify } from 'yaml';

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
