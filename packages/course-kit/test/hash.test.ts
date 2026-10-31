import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, expect, test } from 'vitest';
import { readFrontmatter } from '../src/frontmatter.js';
import { checkStale, hashFile, writeHashes } from '../src/hash.js';

let dir: string;
let out: string;
const originalBody = '# Handout\n\nBody text here.\n';

function setup(hash: string) {
  dir = join(mkdtempSync(join(tmpdir(), 'kit-')), 'My Courses', 'Intro 101');
  mkdirSync(join(dir, '01-planning'), { recursive: true });
  mkdirSync(join(dir, '04-materials'), { recursive: true });
  writeFileSync(join(dir, '01-planning/learning-objectives.md'), 'abc');
  out = join(dir, '04-materials/student-handout.md');
  writeFileSync(
    out,
    `---\ntitle: Handout\nsourceFiles:\n  obj: 01-planning/learning-objectives.md\nsourceHashes:\n  obj: "${hash}"\nzed: 1\n---\n${originalBody}`,
  );
}

beforeEach(() => setup('00000000'));

test('hashFile matches the v2 md5sum | cut -c1-8 format', () => {
  const f = join(dir, 'x.txt');
  writeFileSync(f, 'abc');
  expect(hashFile(f)).toBe('90015098');
});

test('checkStale reports a changed source', () => {
  expect(checkStale(out, dir)).toEqual({ status: 'stale', changed: ['obj'] });
});

test('checkStale counts a deleted source as changed', () => {
  setup('90015098');
  expect(checkStale(out, dir).status).toBe('fresh');
  writeFileSync(out, readFileSync(out, 'utf8').replace('learning-objectives.md', 'missing.md'));
  expect(checkStale(out, dir)).toEqual({ status: 'stale', changed: ['obj'] });
});

test('checkStale returns missing-output when the output is absent', () => {
  expect(checkStale(join(dir, 'nope.md'), dir).status).toBe('missing-output');
});

test('writeHashes then checkStale returns fresh and keeps the body and key order', () => {
  writeHashes(out, dir);
  expect(checkStale(out, dir).status).toBe('fresh');
  const fm = readFrontmatter(out);
  expect(fm.body).toBe(originalBody);
  expect(Object.keys(fm.data)).toEqual(['title', 'sourceFiles', 'sourceHashes', 'zed']);
  expect((fm.data.sourceHashes as Record<string, string>).obj).toBe('90015098');
});
