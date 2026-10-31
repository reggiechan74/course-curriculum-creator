import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ProviderUnavailableError, UsageError } from '../errors.js';

export type DepName = 'mermaid-cli' | 'excalidraw-to-svg';

// excalidraw-to-svg@3.1.0 does not work on Node 22 (jsdom has no canvas; it also reads helper scripts from
// cwd-relative paths). renderExcalidraw therefore exports through headless Chrome (puppeteer) using
// @excalidraw/utils@0.1.2, which still ships the browser bundle. All three are installed together.
const PACKAGES: Record<DepName, string[]> = {
  'mermaid-cli': ['@mermaid-js/mermaid-cli@12.0.0'],
  'excalidraw-to-svg': ['excalidraw-to-svg@3.1.0', '@excalidraw/utils@0.1.2', 'puppeteer@25.16.0'],
};

export function isDepName(n: string): n is DepName {
  return Object.hasOwn(PACKAGES, n);
}

export function depPath(dataDir: string, dep: DepName): string | null {
  const nm = join(dataDir, 'node_modules');
  if (dep === 'mermaid-cli') {
    const p = join(nm, '.bin', 'mmdc');
    return existsSync(p) ? p : null;
  }
  const p = join(nm, 'excalidraw-to-svg');
  const needed = [p, join(nm, '@excalidraw', 'utils', 'dist', 'excalidraw-utils.min.js'), join(nm, 'puppeteer')];
  return needed.every((f) => existsSync(f)) ? p : null;
}

/** Installs into <dataDir>/node_modules. An npm failure (offline, no npm, registry error) is ProviderUnavailableError (exit 4). */
export function installDeps(dataDir: string, deps: DepName[], npmBin = 'npm'): void {
  for (const d of deps) if (!isDepName(d)) throw new UsageError(`unknown dependency: ${d}`);
  mkdirSync(dataDir, { recursive: true });
  const specs = deps.flatMap((d) => PACKAGES[d]);
  try {
    execFileSync(npmBin, ['install', '--prefix', dataDir, '--no-audit', '--no-fund', ...specs], { stdio: ['ignore', 'ignore', 'inherit'] });
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { status?: number | null };
    const why = err.code === 'ENOENT' ? `${npmBin} not found` : `exit ${err.status ?? 'unknown'}`;
    throw new ProviderUnavailableError(`npm install of ${deps.join(', ')} failed (${why}); check the network and npm, then run deps install again`);
  }
}
