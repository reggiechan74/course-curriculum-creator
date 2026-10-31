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

/** Index range [start, end) of a top-level key's block in the frontmatter lines, or null. */
function findBlock(lines: string[], key: string): [number, number] | null {
  const start = lines.findIndex((l) => l.startsWith(`${key}:`) || l.startsWith(`"${key}":`) || l.startsWith(`'${key}':`));
  if (start < 0) return null;
  let end = start + 1;
  let last = start + 1;
  while (end < lines.length) {
    const l = lines[end];
    if (/^[ \t]/.test(l) || /^-(\s|$)/.test(l)) last = end + 1;
    else if (l.trim() !== '') break;
    end++;
  }
  return [start, last];
}

/**
 * Sets only the given top-level keys by splicing text: each patched key's block is replaced
 * (or appended if absent); every other byte of the frontmatter and body is left as written.
 */
export function updateFrontmatter(path: string, patch: Record<string, unknown>): void {
  const text = readFileSync(path, 'utf8');
  const m = FM.exec(text);
  let fm = m ? m[1] : '';
  const body = m ? (m[2] ?? '') : text;
  for (const [k, v] of Object.entries(patch)) {
    const block = stringify({ [k]: v });
    const lines = fm.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    const range = findBlock(lines, k);
    if (range) lines.splice(range[0], range[1] - range[0], ...block.replace(/\n$/, '').split('\n'));
    else lines.push(...block.replace(/\n$/, '').split('\n'));
    fm = lines.join('\n') + '\n';
  }
  writeFileSync(path, `---\n${fm}---\n${body}`);
}
