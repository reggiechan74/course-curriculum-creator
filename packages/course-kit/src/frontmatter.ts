import { readFileSync, writeFileSync } from 'node:fs';
import { parse, stringify } from 'yaml';
import { ValidationError } from './errors.js';

// Groups: 1 opening delimiter line, 2 frontmatter text, 3 closing delimiter line, 4 body.
// Delimiter lines are captured verbatim (trailing spaces, CRLF). The closing `---` must start a
// line and be followed by a newline or end of file.
const FM = /^(---[ \t]*\r?\n)((?:[\s\S]*?\r?\n)?)(---[ \t]*(?:\r?\n|$))([\s\S]*)$/;

function split(text: string): { open: string; fm: string; close: string; body: string } | null {
  const m = FM.exec(text);
  return m ? { open: m[1], fm: m[2], close: m[3], body: m[4] } : null;
}

export function readFrontmatter(
  path: string,
  opts: { strings?: boolean } = {},
): { data: Record<string, unknown>; body: string } {
  const text = readFileSync(path, 'utf8');
  const parts = split(text);
  if (!parts) return { data: {}, body: text };
  let data: unknown;
  try {
    // strings: keep every scalar as text so values like 00123456 or 1234e567 are not coerced to numbers.
    data = parse(parts.fm, opts.strings ? { schema: 'failsafe' } : undefined);
  } catch (e) {
    throw new ValidationError(`invalid frontmatter in ${path}: ${(e as Error).message}`);
  }
  return {
    data: data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : {},
    body: parts.body,
  };
}

export function writeFrontmatter(path: string, data: Record<string, unknown>): void {
  const { body } = readFrontmatter(path);
  const yaml = Object.keys(data).length ? stringify(data) : '';
  writeFileSync(path, `---\n${yaml}---\n${body}`);
}

/** A top-level key line: column 0, not blank, not a comment, not a `- ` sequence item. */
const isTopLevelKey = (l: string) => /^[^\s#-]/.test(l) || /^-[^\s]/.test(l);
const isLooseLine = (l: string) => l.trim() === '' || l.startsWith('#');

/**
 * Line range [start, end) of a top-level key's block, or null. The block runs until the next
 * top-level key line or the end of the frontmatter, so column-0 comments and blank lines inside
 * it are included. Trailing blank/column-0 comment lines are left out: they stay with whatever
 * follows (usually a comment about the next key).
 */
function findBlock(lines: string[], key: string): [number, number] | null {
  const heads = [`${key}:`, `"${key}":`, `'${key}':`];
  const start = lines.findIndex((l) => heads.some((h) => l.startsWith(h)));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !isTopLevelKey(lines[end])) end++;
  while (end > start + 1 && isLooseLine(lines[end - 1])) end--;
  return [start, end];
}

/**
 * Sets only the given top-level keys by splicing text: each patched key's block is replaced
 * (or appended if absent); every other byte of the file, including delimiter lines and line
 * endings, is left as written. New blocks use the file's line ending (from the opening delimiter).
 */
export function updateFrontmatter(path: string, patch: Record<string, unknown>): void {
  const text = readFileSync(path, 'utf8');
  const parts = split(text) ?? { open: '---\n', fm: '', close: '---\n', body: text };
  const eol = parts.open.endsWith('\r\n') ? '\r\n' : '\n';
  // Lines keep their own endings; fm is empty or ends with a newline.
  const lines: string[] = parts.fm.match(/[^\n]*\n/g) ?? [];
  for (const [k, v] of Object.entries(patch)) {
    const block = stringify({ [k]: v }).replace(/\n$/, '').split('\n').map((l) => l + eol);
    const range = findBlock(lines, k);
    if (range) lines.splice(range[0], range[1] - range[0], ...block);
    else lines.push(...block);
  }
  writeFileSync(path, parts.open + lines.join('') + parts.close + parts.body);
}
