import { type ExecFileException, execFile } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { ProviderUnavailableError } from '../errors.js';

const TIMEOUT_MS = 5 * 60_000;

type RunResult = { code: number | null; stderr: string; error?: ExecFileException };

function run(bin: string, args: string[], opts: { cwd?: string; timeout?: number } = {}): Promise<RunResult> {
  return new Promise((resolve) => {
    execFile(bin, args, { ...opts, maxBuffer: 64 * 1024 * 1024, windowsHide: true }, (error, _stdout, stderr) => {
      if (!error) return resolve({ code: 0, stderr: String(stderr) });
      const code = typeof error.code === 'number' ? error.code : null;
      resolve({ code, stderr: String(stderr), error });
    });
  });
}

export async function probeCodex(codexBin = 'codex'): Promise<{ available: boolean; loggedIn: boolean }> {
  const available = (await run(codexBin, ['--version'], { timeout: 30_000 })).code === 0;
  if (!available) return { available, loggedIn: false };
  const loggedIn = (await run(codexBin, ['login', 'status'], { timeout: 30_000 })).code === 0;
  return { available, loggedIn };
}

function fileStamp(p: string): string | null {
  if (!existsSync(p)) return null;
  const s = statSync(p);
  return `${s.mtimeMs}:${s.size}`;
}

/** Runs `codex exec … "$imagegen <prompt> Save the image as <name>."` in the directory of outPath. */
export async function generateImageCodex(o: { prompt: string; outPath: string; codexBin?: string }): Promise<void> {
  const dir = dirname(o.outPath);
  const name = basename(o.outPath);
  mkdirSync(dir, { recursive: true });
  const before = fileStamp(o.outPath);
  const args = ['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-C', dir,
    `$imagegen ${o.prompt} Save the image as ${name}.`];
  const r = await run(o.codexBin ?? 'codex', args, { cwd: dir, timeout: TIMEOUT_MS });
  if (r.error) {
    if (r.error.code === 'ENOENT') throw new ProviderUnavailableError(`codex not found (${o.codexBin ?? 'codex'}); install the Codex CLI or use --provider openai`);
    if (r.error.killed) throw new ProviderUnavailableError('codex exec timed out after 5 minutes');
    const tail = r.stderr.trim().split('\n').slice(-5).join('\n');
    throw new ProviderUnavailableError(`codex exec failed (exit ${r.code ?? 'unknown'})${tail ? `: ${tail}` : ''}`);
  }
  const after = fileStamp(o.outPath);
  if (after === null || after === before) {
    throw new ProviderUnavailableError(`codex finished but did not write ${name}`);
  }
}
