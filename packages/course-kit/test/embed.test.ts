import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { stringify } from 'yaml';
import { studioCommands } from '../src/cli.js';
import { runCli } from '../src/cli/args.js';
import { ValidationError } from '../src/errors.js';
import { embedAll, embedAsset, embedOne } from '../src/media/embed.js';
import { loadRegistry, saveRegistry, updateAssetText } from '../src/media/registry.js';
import { overlayHref } from '../src/render/overlay.js';
import type { Asset, PlanItem } from '../src/media/schema.js';

const md = '# Module 1\n<!-- id: M1 -->\nBody text.\n';
const p = '../05-media/out/A-M1-01.svg';
const generated: Asset = {
  id: 'A-M1-01', kind: 'diagram', objectives: ['LO-1'], module: 'M1', provider: 'mermaid', files: ['05-media/out/A-M1-01.svg'],
  alt: 'Lease abstraction flow', caption: 'Figure 1', longDescription: 'Steps one to three.', status: 'generated',
  costUsd: 0, quotaUnits: 0, createdAt: '2026-10-31',
};
const approved: Asset = { ...generated, status: 'approved', approvedBy: 'user' };
const item = (id: string, o: Partial<PlanItem> = {}): PlanItem => ({
  id, module: 'M1', objectives: ['LO-1'], function: 'process-flow', kind: 'diagram', description: `Desc ${id}`,
  provider: 'mermaid', estimateUsd: 0, quotaUnits: 0, status: 'approved', ...o,
});

test('embedAsset puts an approved block after the ID comment', () => {
  const out = embedAsset(md, approved, 'M1', p);
  expect(out).toContain('<!-- id: M1 -->\n\n<!-- media:A-M1-01 -->\n![Lease abstraction flow](../05-media/out/A-M1-01.svg)\n\n*Figure 1*\n\n<details><summary>Description</summary>\n\nSteps one to three.\n\n</details>\n<!-- /media:A-M1-01 -->\n\nBody text.');
});
test('empty caption and description are left out', () => {
  const out = embedAsset(md, { ...approved, caption: '', longDescription: undefined }, 'M1', p);
  expect(out).toContain('![Lease abstraction flow](../05-media/out/A-M1-01.svg)\n<!-- /media:A-M1-01 -->');
  expect(out).not.toContain('<details>');
});
test('running twice gives one block', () => {
  const once = embedAsset(md, approved, 'M1', p);
  expect(embedAsset(once, approved, 'M1', p)).toBe(once);
});
test('an unapproved asset gives the pending placeholder and no image link', () => {
  const out = embedAsset(md, generated, 'M1', p);
  expect(out).toContain('> **Media pending approval (A-M1-01):** Figure 1');
  expect(out).not.toContain('![');
});
test('a plan item gives a placeholder with its description, even when its plan status is approved', () => {
  const out = embedAsset(md, item('A-M1-01'), 'M1', p);
  expect(out).toContain('<!-- media:A-M1-01 -->\n> **Media pending approval (A-M1-01):** Desc A-M1-01\n<!-- /media:A-M1-01 -->');
});
test('approving later replaces the placeholder', () => {
  const ph = embedAsset(md, generated, 'M1', p);
  const out = embedAsset(ph, approved, 'M1', p);
  expect(out).toContain('![Lease abstraction flow]');
  expect(out).not.toContain('pending approval');
  expect(out.match(/<!-- media:A-M1-01 -->/g)).toHaveLength(1);
});
test('moved markers are replaced in place, not duplicated', () => {
  const moved = '# M\n<!-- id: M1 -->\nBody\n\n<!-- media:A-M1-01 -->\nold\n<!-- /media:A-M1-01 -->\n\nTail\n';
  const out = embedAsset(moved, approved, 'M1', p);
  expect(out.match(/media:A-M1-01 -->/g)).toHaveLength(2);
  expect(out.indexOf('Body')).toBeLessThan(out.indexOf('<!-- media:'));
  expect(out).not.toContain('old');
});
test('missing anchor throws', () => {
  expect(() => embedAsset(md, approved, 'M9', p)).toThrow(new ValidationError('Anchor M9 not found'));
});
test('CRLF is preserved', () => {
  const out = embedAsset(md.replace(/\n/g, '\r\n'), approved, 'M1', p);
  expect(out.replace(/\r\n/g, '')).not.toContain('\n');
  expect(out).toContain('<!-- id: M1 -->\r\n\r\n<!-- media:A-M1-01 -->\r\n');
});
test('a second asset in the same module is added without disturbing the first', () => {
  const a2 = { ...approved, id: 'A-M1-02', files: ['05-media/out/A-M1-02.svg'] };
  const out = embedAsset(embedAsset(md, approved, 'M1', p), a2, 'M1', p);
  expect(out.match(/<!-- media:/g)).toHaveLength(2);
  expect(embedAsset(out, approved, 'M1', p)).toBe(out);
});

function course(files: Record<string, string>, items: PlanItem[], assets: Asset[]): string {
  const d = join(mkdtempSync(join(tmpdir(), 'emb ')), 'My Course');
  mkdirSync(join(d, '05-media'), { recursive: true });
  writeFileSync(join(d, '05-media', 'media-plan.yaml'), stringify({ schema: 'media-plan/v1', items }));
  saveRegistry(d, { schema: 'registry/v1', assets });
  for (const [f, c] of Object.entries(files)) {
    mkdirSync(join(d, f, '..'), { recursive: true });
    writeFileSync(join(d, f), c);
  }
  return d;
}

test('embedAll skips absent files and computes relPath per file', () => {
  const d = course({
    '02-design/lesson-plans.md': md,
    '04-materials/instructor-guide.md': md,
  }, [item('A-M1-01')], [approved]);
  const rep = embedAll(d);
  expect(rep).toEqual([
    { file: '02-design/lesson-plans.md', embedded: ['A-M1-01'], placeholders: [] },
    { file: '04-materials/instructor-guide.md', embedded: ['A-M1-01'], placeholders: [] },
  ]);
  expect(readFileSync(join(d, '02-design/lesson-plans.md'), 'utf8')).toContain('](../05-media/out/A-M1-01.svg)');
  expect(embedAll(d)).toEqual(rep);
});
test('embedAll skips files without the module comment and does not rewrite unchanged files', () => {
  const d = course({ '02-design/lesson-plans.md': '# none\n' }, [item('A-M1-01')], [approved]);
  expect(embedAll(d)).toEqual([{ file: '02-design/lesson-plans.md', embedded: [], placeholders: [] }]);
  expect(readFileSync(join(d, '02-design/lesson-plans.md'), 'utf8')).toBe('# none\n');
});
test('with no providers, embedAll writes only placeholders and creates no ledger', () => {
  const d = course({ '02-design/lesson-plans.md': md + '<!-- id: M2 -->\n' }, [item('A-M1-01'), item('A-M2-01', { module: 'M2' }), item('X', { status: 'proposed' })], []);
  const rep = embedAll(d);
  expect(rep[0]).toEqual({ file: '02-design/lesson-plans.md', embedded: [], placeholders: ['A-M1-01', 'A-M2-01'] });
  const text = readFileSync(join(d, '02-design/lesson-plans.md'), 'utf8');
  expect(text).not.toContain('![');
  expect(text).not.toContain('media:X');
  expect(() => readFileSync(join(d, '.course', 'cost-ledger.jsonl'))).toThrow();
});
test('only approved assets get image links; imported and generated get placeholders', () => {
  const imported: Asset = { ...generated, id: 'IMG-1', status: 'imported', module: 'M1' };
  const d = course({ '02-design/lesson-plans.md': md }, [item('A-M1-01'), item('A-M1-02')], [approved, { ...generated, id: 'A-M1-02' }, imported]);
  const rep = embedAll(d);
  expect(rep[0].embedded).toEqual(['A-M1-01']);
  expect(rep[0].placeholders.sort()).toEqual(['A-M1-02', 'IMG-1']);
});
test('an approved registry asset not in the plan (migrated) embeds when it has a module', () => {
  const mig: Asset = { ...approved, id: 'IMG-9', files: ['05-media/imported/x.png'] };
  const d = course({ '02-design/lesson-plans.md': md }, [], [mig, { ...approved, id: 'NOMOD', module: undefined }]);
  expect(embedAll(d)[0].embedded).toEqual(['IMG-9']);
});

test('embed CLI: single file and embed all', async () => {
  const d = course({ '02-design/lesson-plans.md': md }, [item('A-M1-01')], [approved]);
  const f = join(d, '02-design/lesson-plans.md');
  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  expect(await runCli(['embed', f, '--asset', 'A-M1-01', '--anchor', 'M1', '--course', d], studioCommands)).toBe(0);
  expect(readFileSync(f, 'utf8')).toContain('](../05-media/out/A-M1-01.svg)');
  expect(await runCli(['embed', f, '--asset', 'A-M1-01', '--anchor', 'M7', '--course', d], studioCommands)).toBe(2);
  expect(await runCli(['embed', f, '--asset', 'nope', '--anchor', 'M1', '--course', d], studioCommands)).toBe(2);
  logs.length = 0;
  expect(await runCli(['embed', 'all', '--course', d], studioCommands)).toBe(0);
  expect(JSON.parse(logs.join('')).files[0].embedded).toEqual(['A-M1-01']);
  vi.restoreAllMocks();
});

afterEach(() => vi.restoreAllMocks());
beforeEach(() => undefined);

test('updateAssetText sets text fields only and never touches status', () => {
  const r = { schema: 'registry/v1' as const, assets: [{ ...generated, alt: '' }] };
  const next = updateAssetText(r, 'A-M1-01', { alt: 'New alt', caption: 'C' });
  expect(next.assets[0]).toMatchObject({ alt: 'New alt', caption: 'C', status: 'generated', longDescription: generated.longDescription });
  expect(() => updateAssetText(r, 'nope', {})).toThrow(ValidationError);
  expect(() => updateAssetText({ ...r, assets: [approved] }, 'A-M1-01', { alt: 'x' })).toThrow(ValidationError);
});
test('registry update CLI', async () => {
  const d = course({}, [], [{ ...generated, alt: '' }]);
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  expect(await runCli(['registry', 'update', 'A-M1-01', '--course', d, '--json', '{"alt":"Hello"}'], studioCommands)).toBe(0);
  expect(await runCli(['registry', 'update', 'A-M1-01', '--course', d, '--json', '{"status":"approved"}'], studioCommands)).toBe(1);
  expect(JSON.parse(readFileSync(join(d, '05-media/registry.json'), 'utf8')).assets[0]).toMatchObject({ alt: 'Hello', status: 'generated' });
});

describe('label overlays end to end', () => {
  const png = '05-media/out/A-M1-01.png';
  const overlay = '05-media/out/A-M1-01.overlay.svg';
  const withFiles = (files: string[]) => course({ '02-design/lesson-plans.md': md, [png]: 'png', [overlay]: '<svg/>' }, [item('A-M1-01')], [{ ...approved, files }]);
  const quiet = () => vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

  test('render overlay writes the image href relative to the overlay file', async () => {
    const d = course({ [png]: 'png' }, [], []);
    const labels = join(d, 'labels.json');
    writeFileSync(labels, JSON.stringify([{ text: 'Rent', x: 1, y: 2 }]));
    quiet();
    expect(await runCli(['render', 'overlay', join(d, png), labels, join(d, overlay)], studioCommands)).toBe(0);
    expect(readFileSync(join(d, overlay), 'utf8')).toContain('<image href="A-M1-01.png"');
    mkdirSync(join(d, 'sub dir'));
    expect(await runCli(['render', 'overlay', join(d, png), labels, join(d, 'sub dir', 'o.svg')], studioCommands)).toBe(0);
    expect(readFileSync(join(d, 'sub dir', 'o.svg'), 'utf8')).toContain('<image href="../05-media/out/A-M1-01.png"');
    expect(overlayHref(join(d, 'my img.png'), join(d, 'x.svg'))).toBe('my%20img.png');
  });

  test('registry update sets files (course-relative, existing) and never status; approved assets are refused', async () => {
    const d = course({ [png]: 'png', [overlay]: '<svg/>' }, [], [{ ...generated, files: [png] }]);
    quiet();
    const upd = (json: unknown) => runCli(['registry', 'update', 'A-M1-01', '--course', d, '--json', JSON.stringify(json)], studioCommands);
    expect(await upd({ files: [png, overlay] })).toBe(0);
    expect(loadRegistry(d).assets[0]).toMatchObject({ files: [png, overlay], status: 'generated' });
    for (const bad of [[join(d, png)], ['../x.png'], ['05-media/out/missing.svg'], [], ['05-media/out']]) {
      expect(await upd({ files: bad })).toBe(2);
    }
    expect(await upd({ files: 'x' })).toBe(1);
    const a = course({ [png]: 'png' }, [], [{ ...approved, files: [png] }]);
    expect(await runCli(['registry', 'update', 'A-M1-01', '--course', a, '--json', JSON.stringify({ files: [png] })], studioCommands)).toBe(2);
  });

  test('embed prefers a .overlay.svg file over files[0]', async () => {
    const d = withFiles([png, overlay]);
    embedAll(d);
    expect(readFileSync(join(d, '02-design/lesson-plans.md'), 'utf8')).toContain('](../05-media/out/A-M1-01.overlay.svg)');
    const e = withFiles([png, overlay]);
    embedOne(e, join(e, '02-design/lesson-plans.md'), 'A-M1-01', 'M1');
    expect(readFileSync(join(e, '02-design/lesson-plans.md'), 'utf8')).toContain('](../05-media/out/A-M1-01.overlay.svg)');
    const f = withFiles([png]);
    embedAll(f);
    expect(readFileSync(join(f, '02-design/lesson-plans.md'), 'utf8')).toContain('](../05-media/out/A-M1-01.png)');
  });
});

test('alt, caption and path are escaped for markdown', () => {
  const a: Asset = { ...approved, alt: 'Step [1] then ]x[ and back\\slash', caption: '*Note* the_ending*', longDescription: undefined };
  const out = embedAsset(md, a, 'M1', '../05-media/out/my (draft) img.png');
  expect(out).toContain('![Step \\[1\\] then \\]x\\[ and back\\\\slash](../05-media/out/my%20%28draft%29%20img.png)');
  expect(out).toContain('\n*\\*Note\\* the\\_ending\\**\n');
});
