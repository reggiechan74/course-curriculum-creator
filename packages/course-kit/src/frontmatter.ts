import { readFileSync, writeFileSync } from 'node:fs';
import { parse, stringify } from 'yaml';

const FM = /^---\r?\n([\s\S]*?)---\r?\n([\s\S]*)$/;

export function readFrontmatter(path: string): { data: Record<string, unknown>; body: string } {
  const text = readFileSync(path, 'utf8');
  const m = FM.exec(text);
  if (!m) return { data: {}, body: text };
  const data = parse(m[1]) as unknown;
  return {
    data: data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : {},
    body: m[2],
  };
}

export function writeFrontmatter(path: string, data: Record<string, unknown>): void {
  const { body } = readFrontmatter(path);
  const yaml = Object.keys(data).length ? stringify(data) : '';
  writeFileSync(path, `---\n${yaml}---\n${body}`);
}
