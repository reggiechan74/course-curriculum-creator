import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { ProviderUnavailableError } from '../errors.js';
import { depPath } from './deps.js';

interface Page {
  setContent(html: string): Promise<void>;
  addScriptTag(o: { content: string }): Promise<unknown>;
  evaluate<T, A>(fn: (a: A) => Promise<T>, arg: A): Promise<T>;
}
interface Browser { newPage(): Promise<Page>; close(): Promise<void> }
interface Puppeteer { launch(o: { args: string[] }): Promise<Browser> }

export async function renderExcalidraw(srcPath: string, outSvg: string, dataDir: string): Promise<void> {
  if (!depPath(dataDir, 'excalidraw-to-svg')) {
    throw new ProviderUnavailableError('excalidraw-to-svg is not installed; run: deps install excalidraw-to-svg --data-dir <dir>');
  }
  const root = resolve(dataDir);
  const bundle = join(root, 'node_modules', '@excalidraw', 'utils', 'dist', 'excalidraw-utils.min.js');
  let puppeteer: Puppeteer;
  try {
    puppeteer = createRequire(join(root, 'noop.js'))('puppeteer') as Puppeteer;
  } catch {
    throw new ProviderUnavailableError('puppeteer is not installed; run: deps install excalidraw-to-svg --data-dir <dir>');
  }
  const diagram = JSON.parse(readFileSync(srcPath, 'utf8')) as unknown;
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent('<html><body></body></html>');
    await page.addScriptTag({ content: readFileSync(bundle, 'utf8') });
    const svg = await page.evaluate(
      async (d) => (await (globalThis as unknown as { ExcalidrawUtils: { exportToSvg(d: unknown): Promise<{ outerHTML: string }> } }).ExcalidrawUtils.exportToSvg(d)).outerHTML,
      diagram,
    );
    writeFileSync(outSvg, svg);
  } finally {
    await browser.close();
  }
}
