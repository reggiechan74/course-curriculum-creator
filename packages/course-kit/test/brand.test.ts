import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { checkTokens, contrastRatio, deriveTokens, loadBrand } from '../src/brand/tokens.js';
import { runCli } from '../src/cli/args.js';
import { studioCommands } from '../src/cli.js';
import { initManifest, saveManifest } from '../src/manifest/io.js';

let logs: string[];
beforeEach(() => {
  logs = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
});
afterEach(() => vi.restoreAllMocks());

const YAML = (primary: string, extra = '') =>
  `name: Acme\ncolors:\n  primary: "${primary}"\n${extra}fonts:\n  heading: Inter\n  body: Georgia\n`;
function tmp(): string { return mkdtempSync(join(tmpdir(), 'brand-')); }
function brandFile(primary: string, extra = ''): string {
  const f = join(tmp(), 'brand.yaml');
  writeFileSync(f, YAML(primary, extra));
  return f;
}

test('contrastRatio black on white is 21', () => { expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1); });
test('contrastRatio #767676 on white is 4.54', () => { expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2); });

test('loadBrand normalises short and upper-case hex', () => {
  const b = loadBrand(brandFile('#ABC', '  neutral: ["#FFF", "#222222"]\n'));
  expect(b.colors.primary).toBe('#aabbcc');
  expect(b.colors.neutral).toEqual(['#ffffff', '#222222']);
});
test('loadBrand rejects a color that is not hex', () => {
  expect(() => loadBrand(brandFile('teal'))).toThrow(/colors\.primary/);
});

test('deriveTokens picks white or near-black text for primary to pass 4.5', () => {
  for (const p of ['#0d9488', '#fde047', '#1e3a8a', '#ffffff', '#000000']) {
    const t = deriveTokens(loadBrand(brandFile(p)));
    expect(contrastRatio(t.color.primaryFg, p)).toBeGreaterThanOrEqual(4.5);
  }
});
test('deriveTokens uses neutrals, secondary and mono default', () => {
  const t = deriveTokens(loadBrand(brandFile('#0d9488', '  secondary: "#b45309"\n  neutral: ["#e5e5e5", "#333333", "#737373"]\n')));
  expect(t.color.fg).toBe('#333333');
  expect(t.color.accent).toBe('#b45309');
  expect(t.color.muted).toBe('#333333');
  expect(t.font.mono).toBe('ui-monospace, monospace');
  expect(t.space).toEqual([4, 8, 12, 16, 24, 32, 48]);
  const d = deriveTokens(loadBrand(brandFile('#0d9488')));
  expect(d.color.fg).toBe('#1a1a1a');
  expect(d.color.accent).toBe('#0d9488');
  expect(d.color.muted).toBe('#6b6b6b');
});

test('checkTokens gives an error for light grey text on white', () => {
  const t = deriveTokens(loadBrand(brandFile('#0d9488')));
  t.color.fg = '#aaaaaa';
  const issues = checkTokens(t);
  expect(issues).toHaveLength(1);
  expect(issues[0]).toMatchObject({ level: 'error', path: 'color.fg' });
  expect(issues[0].message).toMatch(/2\.32.*4\.5/);
});
test('checkTokens passes for a good brand and flags weak accent', () => {
  const t = deriveTokens(loadBrand(brandFile('#1e3a8a')));
  expect(checkTokens(t)).toEqual([]);
  t.color.accent = '#ffff00';
  expect(checkTokens(t).map((i) => i.path)).toEqual(['color.accent']);
});

test('brand validate prints the brand; exits 2 on bad file', async () => {
  expect(await runCli(['brand', 'validate', brandFile('#ABC')], studioCommands)).toBe(0);
  expect(JSON.parse(logs.join('')).brand.colors.primary).toBe('#aabbcc');
  logs = [];
  expect(await runCli(['brand', 'validate', brandFile('teal')], studioCommands)).toBe(2);
});

function course(): string {
  const dir = join(tmp(), 'My Courses', 'Intro 101');
  mkdirSync(dir, { recursive: true });
  saveManifest(dir, initManifest({
    title: 'Intro', shape: 'self-paced', delivery: 'async', sessions: [],
    audienceLevel: 'beginner', audienceSummary: 's', budgetUsd: 20, maxPlanImages: 40,
  }, '2026-01-01'));
  return dir;
}

test('style tokens writes tokens.json using --brand', async () => {
  const dir = course();
  expect(await runCli(['style', 'tokens', '--course', dir, '--brand', brandFile('#1e3a8a')], studioCommands)).toBe(0);
  const out = JSON.parse(logs.join(''));
  expect(out.issues).toEqual([]);
  const written = JSON.parse(readFileSync(join(dir, '05-media', 'style', 'tokens.json'), 'utf8'));
  expect(written).toEqual(out.tokens);
});
test('style tokens falls back to theme.yaml, and exits 1 when no brand exists', async () => {
  const dir = course();
  expect(await runCli(['style', 'tokens', '--course', dir], studioCommands)).toBe(1);
  mkdirSync(join(dir, '05-media', 'style'), { recursive: true });
  writeFileSync(join(dir, '05-media', 'style', 'theme.yaml'), YAML('#1e3a8a'));
  logs = [];
  expect(await runCli(['style', 'tokens', '--course', dir], studioCommands)).toBe(0);
});
test('style tokens exits 2 and writes nothing when contrast fails', async () => {
  const dir = course();
  const f = brandFile('#1e3a8a', '  secondary: "#ffff99"\n');
  expect(await runCli(['style', 'tokens', '--course', dir, '--brand', f], studioCommands)).toBe(2);
  expect(existsSync(join(dir, '05-media', 'style', 'tokens.json'))).toBe(false);
});
