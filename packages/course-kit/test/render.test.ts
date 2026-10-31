import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { ProviderUnavailableError, ValidationError } from '../src/errors.js';
import { depPath, installDeps } from '../src/render/deps.js';
import { renderExcalidraw } from '../src/render/excalidraw.js';
import { renderMermaid } from '../src/render/mermaid.js';
import { buildLabelOverlay } from '../src/render/overlay.js';
import { renderVegaLite } from '../src/render/vegalite.js';

const DATA = process.env.CK_DATA ?? '/nonexistent';
const tmp = () => mkdtempSync(join(tmpdir(), 'render test '));
const barSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: { values: [{ a: 'A', b: 1 }, { a: 'B', b: 3 }] },
  mark: 'bar',
  encoding: { x: { field: 'a', type: 'nominal' }, y: { field: 'b', type: 'quantitative' } },
};

test('renderVegaLite writes an SVG with the bar marks', async () => {
  const out = join(tmp(), 'o.svg');
  await renderVegaLite(barSpec, out);
  const svg = readFileSync(out, 'utf8');
  expect(svg).toMatch(/^<svg[\s\S]*<\/svg>\s*$/);
  expect(svg).toContain('role="graphics-symbol"');
});
test('renderVegaLite applies token colors', async () => {
  const out = join(tmp(), 'o.svg');
  await renderVegaLite(barSpec, out, { color: { primary: '#123456' } });
  expect(readFileSync(out, 'utf8')).toContain('#123456');
});
test('renderMermaid throws ProviderUnavailableError when mermaid-cli is not installed', async () => {
  const d = tmp();
  await expect(renderMermaid(join(d, 'a.mmd'), join(d, 'o.svg'), d)).rejects.toBeInstanceOf(ProviderUnavailableError);
});
test('renderExcalidraw throws ProviderUnavailableError when not installed', async () => {
  const d = tmp();
  writeFileSync(join(d, 'a.excalidraw'), '{}');
  await expect(renderExcalidraw(join(d, 'a.excalidraw'), join(d, 'o.svg'), d)).rejects.toBeInstanceOf(ProviderUnavailableError);
});
test('renderExcalidraw with a partial install (empty excalidraw-to-svg dir) is ProviderUnavailableError', async () => {
  const d = tmp();
  mkdirSync(join(d, 'node_modules', 'excalidraw-to-svg'), { recursive: true });
  writeFileSync(join(d, 'a.excalidraw'), '{}');
  expect(depPath(d, 'excalidraw-to-svg')).toBeNull();
  await expect(renderExcalidraw(join(d, 'a.excalidraw'), join(d, 'o.svg'), d)).rejects.toBeInstanceOf(ProviderUnavailableError);
});
test('renderExcalidraw with a missing or invalid source is ValidationError', async () => {
  const d = tmp();
  await expect(renderExcalidraw(join(d, 'nope.excalidraw'), join(d, 'o.svg'), d)).rejects.toBeInstanceOf(ValidationError);
  writeFileSync(join(d, 'bad.excalidraw'), 'not json');
  await expect(renderExcalidraw(join(d, 'bad.excalidraw'), join(d, 'o.svg'), d)).rejects.toBeInstanceOf(ValidationError);
});
test('renderMermaid maps a failing mmdc to ProviderUnavailableError with its message', async () => {
  const d = tmp();
  mkdirSync(join(d, 'node_modules', '.bin'), { recursive: true });
  const fake = join(d, 'node_modules', '.bin', 'mmdc');
  writeFileSync(fake, '#!/bin/sh\necho "chrome exploded" >&2\nexit 3\n');
  chmodSync(fake, 0o755);
  writeFileSync(join(d, 'a.mmd'), 'flowchart LR; A-->B');
  await expect(renderMermaid(join(d, 'a.mmd'), join(d, 'o.svg'), d)).rejects.toThrow(/chrome exploded/);
  await expect(renderMermaid(join(d, 'a.mmd'), join(d, 'o.svg'), d)).rejects.toBeInstanceOf(ProviderUnavailableError);
  await expect(renderMermaid(join(d, 'missing.mmd'), join(d, 'o.svg'), d)).rejects.toBeInstanceOf(ValidationError);
});
test('depPath is null when nothing is installed; installDeps rejects unknown names', () => {
  const d = tmp();
  expect(depPath(d, 'mermaid-cli')).toBeNull();
  expect(depPath(d, 'excalidraw-to-svg')).toBeNull();
  expect(() => installDeps(d, ['nope' as never])).toThrow(/unknown dependency/);
});
test.skipIf(!depPath(DATA, 'mermaid-cli'))('renderMermaid writes an SVG', async () => {
  const d = tmp();
  writeFileSync(join(d, 'a.mmd'), 'flowchart LR; A-->B');
  await renderMermaid(join(d, 'a.mmd'), join(d, 'o.svg'), DATA);
  expect(readFileSync(join(d, 'o.svg'), 'utf8')).toContain('<svg');
}, 60000);
test.skipIf(!depPath(DATA, 'excalidraw-to-svg'))('renderExcalidraw writes an SVG', async () => {
  const d = tmp();
  const rect = { id: 'r1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50, angle: 0, strokeColor: '#000', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, opacity: 100, groupIds: [], frameId: null, roundness: null, seed: 1, version: 1, versionNonce: 1, isDeleted: false, boundElements: null, updated: 1, link: null, locked: false };
  writeFileSync(join(d, 'a.excalidraw'), JSON.stringify({ type: 'excalidraw', version: 2, source: 'test', elements: [rect], appState: { viewBackgroundColor: '#fff' }, files: {} }));
  await renderExcalidraw(join(d, 'a.excalidraw'), join(d, 'o.svg'), DATA);
  expect(readFileSync(join(d, 'o.svg'), 'utf8')).toContain('<svg');
}, 60000);

test('buildLabelOverlay escapes label text and uses the token font', () => {
  const svg = buildLabelOverlay('a.png', 800, 600, [{ text: 'Rent & <CAM>', x: 10, y: 20 }], { font: { body: 'Inter' } });
  expect(svg).toContain('Rent &amp; &lt;CAM&gt;');
  expect(svg).toContain('font-family="Inter"');
  expect(svg).toContain('href="a.png"');
  expect(svg).toContain('viewBox="0 0 800 600"');
  expect(svg).toContain('text-anchor="start"');
  expect(svg).toContain('fill="#1a1a1a"');
});
test('buildLabelOverlay escapes attribute values and honours anchor and fg token', () => {
  const svg = buildLabelOverlay('a "b".png', 10, 10, [{ text: 't', x: 1, y: 2, anchor: 'middle' }], { color: { fg: '#fff' }, font: { body: 'A"B' } });
  expect(svg).toContain('href="a &quot;b&quot;.png"');
  expect(svg).toContain('font-family="A&quot;B"');
  expect(svg).toContain('text-anchor="middle"');
  expect(svg).toContain('fill="#fff"');
});
