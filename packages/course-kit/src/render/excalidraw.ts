import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { ProviderUnavailableError, ValidationError } from '../errors.js';
import { depPath } from './deps.js';

interface Page {
  isClosed?(): boolean;
  setContent(html: string): Promise<void>;
  addScriptTag(o: { content: string }): Promise<unknown>;
  evaluate<T, A>(fn: (a: A) => Promise<T>, arg: A): Promise<T>;
}
interface Browser { connected?: boolean; newPage(): Promise<Page>; close(): Promise<void> }
interface Puppeteer { launch(o: { args: string[] }): Promise<Browser> }

const CHROME_FAILURE = /Target closed|Protocol error|Session closed|Execution context was destroyed|crash|disconnected/i;

/** Decides whether a page.evaluate failure is a Chrome/tooling failure (exit 4) or a bad scene (exit 2). */
export function classifyEvaluateError(err: unknown, ctx: { browserConnected?: boolean; pageClosed?: boolean } = {}): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (CHROME_FAILURE.test(msg) || ctx.browserConnected === false || ctx.pageClosed === true) {
    return new ProviderUnavailableError(`Chrome failed during export: ${msg}`);
  }
  return new ValidationError(`not a usable Excalidraw scene: ${msg}`);
}

export async function renderExcalidraw(srcPath: string, outSvg: string, dataDir: string): Promise<void> {
  let diagram: unknown;
  try { diagram = JSON.parse(readFileSync(srcPath, 'utf8')); }
  catch (e) { throw new ValidationError(`cannot read excalidraw source ${srcPath}: ${e instanceof Error ? e.message : String(e)}`); }
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
  let browser: Browser;
  try { browser = await puppeteer.launch({ args: ['--no-sandbox'] }); }
  catch (e) { throw new ProviderUnavailableError(`Chrome failed to launch: ${e instanceof Error ? e.message : String(e)}`); }
  try {
    let page: Page;
    try {
      page = await browser.newPage();
      await page.setContent('<html><body></body></html>');
      await page.addScriptTag({ content: readFileSync(bundle, 'utf8') });
    } catch (e) {
      throw new ProviderUnavailableError(`Chrome page setup failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    let svg: string;
    try {
      svg = await page.evaluate(
        async (d) => (await (globalThis as unknown as { ExcalidrawUtils: { exportToSvg(d: unknown): Promise<{ outerHTML: string }> } }).ExcalidrawUtils.exportToSvg(d)).outerHTML,
        diagram,
      );
    } catch (e) {
      throw classifyEvaluateError(e, { browserConnected: browser.connected, pageClosed: page.isClosed?.() });
    }
    writeFileSync(outSvg, svg);
  } finally {
    try { await browser.close(); } catch { /* ignore close failures */ }
  }
}
