import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Tokens } from '../brand/tokens.js';
import { ProviderUnavailableError, ValidationError } from '../errors.js';
import { depPath } from './deps.js';

export async function renderMermaid(
  srcPath: string, outSvg: string, dataDir: string,
  tokens: { color?: Partial<Tokens['color']>; font?: Partial<Tokens['font']> } = {},
): Promise<void> {
  const mmdc = depPath(dataDir, 'mermaid-cli');
  if (!mmdc) throw new ProviderUnavailableError('mermaid-cli is not installed; run: deps install mermaid-cli --data-dir <dir>');
  const tmp = mkdtempSync(join(tmpdir(), 'ck-mmd-'));
  try {
    const c = tokens.color ?? {};
    const themeVariables: Record<string, string> = {};
    if (c.primary) themeVariables.primaryColor = c.primary;
    if (c.primaryFg) themeVariables.primaryTextColor = c.primaryFg;
    if (c.fg) themeVariables.lineColor = c.fg;
    if (c.bg) themeVariables.background = c.bg;
    if (tokens.font?.body) themeVariables.fontFamily = tokens.font.body;
    const cfg = join(tmp, 'config.json');
    writeFileSync(cfg, JSON.stringify({ theme: 'base', themeVariables }));
    const pup = join(tmp, 'puppeteer.json');
    writeFileSync(pup, JSON.stringify({ args: ['--no-sandbox'] }));
    if (!existsSync(srcPath)) throw new ValidationError(`mermaid source not found: ${srcPath}`);
    try {
      execFileSync(mmdc, ['-i', srcPath, '-o', outSvg, '-c', cfg, '-p', pup, ...(c.bg ? ['-b', c.bg] : [])], { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (e) {
      const err = e as Error & { stderr?: Buffer };
      const detail = err.stderr?.toString().trim() || err.message;
      if (/parse error|syntax error|lexical error|no diagram type detected/i.test(detail)) {
        throw new ValidationError(`invalid mermaid diagram: ${detail}`);
      }
      throw new ProviderUnavailableError(`mermaid-cli failed: ${detail}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
