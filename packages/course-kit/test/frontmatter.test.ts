import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { readFrontmatter, writeFrontmatter } from '../src/frontmatter.js';
import { checkStale, writeHashes } from '../src/hash.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'kit-'));

test('a value ending in --- does not end the block and round-trips', () => {
  const f = join(tmp(), 'a.md');
  writeFileSync(f, '---\ntitle: "Foo ---"\nx: 1\n---\nBody\n');
  const fm = readFrontmatter(f);
  expect(fm.data).toEqual({ title: 'Foo ---', x: 1 });
  expect(fm.body).toBe('Body\n');
  writeFrontmatter(f, { ...fm.data, y: 2 });
  expect(readFrontmatter(f)).toEqual({ data: { title: 'Foo ---', x: 1, y: 2 }, body: 'Body\n' });
});

test('mid-line --- in a multi-line scalar is not a delimiter', () => {
  const f = join(tmp(), 'a.md');
  writeFileSync(f, '---\ntitle: Foo ---\nx: 1\n---\nBody\n');
  expect(readFrontmatter(f).data).toEqual({ title: 'Foo ---', x: 1 });
});

test('closing --- at EOF without newline is frontmatter with empty body', () => {
  const f = join(tmp(), 'a.md');
  writeFileSync(f, '---\na: 1\n---');
  expect(readFrontmatter(f)).toEqual({ data: { a: 1 }, body: '' });
});

test('unquoted numeric-looking hashes compare as strings', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc'); // md5 90015098
  const out = join(dir, 'o.md');
  writeFileSync(out, '---\nsourceFiles:\n  a: s.md\nsourceHashes:\n  a: 90015098\n---\nB\n');
  expect(checkStale(out, dir).status).toBe('fresh');
  // leading-zero and exponent forms
  writeFileSync(join(dir, 'z.md'), 'x');
  writeFileSync(out, '---\nsourceFiles:\n  a: z.md\nsourceHashes:\n  a: 00123456\n---\nB\n');
  expect(checkStale(out, dir)).toEqual({ status: 'stale', changed: ['a'] });
});

test('unquoted all-digit hash with a leading zero matching the file is fresh', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), '158'); // md5 prefix 06409663
  const out = join(dir, 'o.md');
  writeFileSync(out, '---\nsourceFiles:\n  a: s.md\nsourceHashes:\n  a: 06409663\n---\nB\n');
  expect(checkStale(out, dir).status).toBe('fresh');
});

test('writeHashes writes hashes quoted', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  writeFileSync(out, '---\nsourceFiles:\n  a: s.md\n---\nB\n');
  writeHashes(out, dir);
  expect(readFileSync(out, 'utf8')).toContain('a: "90015098"');
  expect(checkStale(out, dir).status).toBe('fresh');
});

test('writeHashes leaves untouched frontmatter lines byte-identical', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  const keep = '# keep this comment\nversion: 1.10\ncode: 00123\nbig: 1234e567\n';
  writeFileSync(out, `---\n${keep}sourceFiles:\n  a: s.md\n---\nB\n`);
  writeHashes(out, dir);
  const text = readFileSync(out, 'utf8');
  expect(text).toContain(keep);
  expect(text).toContain('a: "90015098"');
  expect(text.endsWith('---\nB\n')).toBe(true);
  expect(checkStale(out, dir).status).toBe('fresh');
});
