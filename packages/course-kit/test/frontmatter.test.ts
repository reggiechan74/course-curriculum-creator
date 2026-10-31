import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { readFrontmatter, writeFrontmatter } from '../src/frontmatter.js';
import { checkStale, writeHashes } from '../src/hash.js';
import { ValidationError } from '../src/errors.js';

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

test('writeHashes keeps long scalars, 4-space maps and flow sequences byte-identical and replaces the old block cleanly', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  const long = `revisionNote: ${'word '.repeat(40).trim()}\n`;
  expect(long.length).toBeGreaterThan(200);
  const nested = 'meta:\n    inner:\n        deep: 1\n    other: x\n';
  const flow = 'tags: [a, b,  c]\n';
  const old = 'sourceHashes:\n  a: "11111111"\n  stale: "22222222"\n  # note\n  b: "33333333"\n';
  writeFileSync(out, `---\n${long}${nested}sourceFiles:\n  a: s.md\n${old}${flow}tail: end\n---\nB\n`);
  writeHashes(out, dir);
  expect(readFileSync(out, 'utf8')).toBe(
    `---\n${long}${nested}sourceFiles:\n  a: s.md\nsourceHashes:\n  a: "90015098"\n${flow}tail: end\n---\nB\n`,
  );
});

test('writeHashes appends sourceHashes when absent', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  writeFileSync(out, '---\nsourceFiles:\n  a: s.md\n---\nB\n');
  writeHashes(out, dir);
  expect(readFileSync(out, 'utf8')).toBe('---\nsourceFiles:\n  a: s.md\nsourceHashes:\n  a: "90015098"\n---\nB\n');
});

test('a column-0 comment inside the old block does not leave stale lines behind', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  writeFileSync(
    out,
    '---\nsourceFiles:\n  a: s.md\nsourceHashes:\n  a: "11111111"\n# mid comment\n  b: "22222222"\n# about tail\ntail: end\n---\nB\n',
  );
  writeHashes(out, dir);
  // Trailing column-0 comments/blank lines before the next key stay with that key.
  expect(readFileSync(out, 'utf8')).toBe(
    '---\nsourceFiles:\n  a: s.md\nsourceHashes:\n  a: "90015098"\n# about tail\ntail: end\n---\nB\n',
  );
  expect(checkStale(out, dir).status).toBe('fresh');
});

test('CRLF file stays byte-identical except the patched block, which uses CRLF', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  const head = '---\r\n# c\r\nsourceFiles:\r\n  a: s.md\r\n';
  const tail = 'tail: end\r\n---\r\nBody\r\nline2\r\n';
  writeFileSync(out, `${head}sourceHashes:\r\n  a: "11111111"\r\n${tail}`);
  writeHashes(out, dir);
  expect(readFileSync(out, 'utf8')).toBe(`${head}sourceHashes:\r\n  a: "90015098"\r\n${tail}`);
  expect(checkStale(out, dir).status).toBe('fresh');
});

test('CRLF file gets an appended block with CRLF', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  writeFileSync(out, '---\r\nsourceFiles:\r\n  a: s.md\r\n---\r\nB\r\n');
  writeHashes(out, dir);
  expect(readFileSync(out, 'utf8')).toBe('---\r\nsourceFiles:\r\n  a: s.md\r\nsourceHashes:\r\n  a: "90015098"\r\n---\r\nB\r\n');
});

test('delimiter lines with trailing spaces are preserved', () => {
  const dir = tmp();
  writeFileSync(join(dir, 's.md'), 'abc');
  const out = join(dir, 'o.md');
  writeFileSync(out, '---  \nsourceFiles:\n  a: s.md\n--- \t\nB\n');
  writeHashes(out, dir);
  expect(readFileSync(out, 'utf8')).toBe('---  \nsourceFiles:\n  a: s.md\nsourceHashes:\n  a: "90015098"\n--- \t\nB\n');
});

test('unparseable frontmatter throws ValidationError', () => {
  const dir = tmp();
  const out = join(dir, 'o.md');
  writeFileSync(out, '---\nsourceHashes:\n  a: "1"\n  a: "2"\n---\nB\n');
  expect(() => checkStale(out, dir)).toThrow(ValidationError);
  expect(() => readFrontmatter(out)).toThrow(ValidationError);
  writeFileSync(out, '---\na: [unclosed\n---\nB\n');
  expect(() => checkStale(out, dir)).toThrow(ValidationError);
  try {
    checkStale(out, dir);
  } catch (e) {
    expect((e as ValidationError).exitCode).toBe(2);
  }
});
