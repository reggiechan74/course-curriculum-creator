import { type ExecFileException, execFile } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { ProviderUnavailableError } from '../errors.js';

const TIMEOUT_MS = 5 * 60_000;

type RunResult = { code: number | null; stdout: string; stderr: string; error?: ExecFileException };

/** The child never sees the OpenAI keys, so a plan-billed run cannot bill the API key. */
function childEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.OPENAI_API_KEY;
  delete env.COURSE_MEDIA_OPENAI_KEY;
  return env;
}

function run(bin: string, args: string[], opts: { cwd?: string; timeout?: number } = {}): Promise<RunResult> {
  return new Promise((resolve) => {
    execFile(bin, args, { ...opts, env: childEnv(), maxBuffer: 64 * 1024 * 1024, windowsHide: true }, (error, stdout, stderr) => {
      if (!error) return resolve({ code: 0, stdout: String(stdout), stderr: String(stderr) });
      const code = typeof error.code === 'number' ? error.code : null;
      resolve({ code, stdout: String(stdout), stderr: String(stderr), error });
    });
  });
}

/** plan: signed in with ChatGPT (images count against the plan); api-key: billed to an API key; unknown: anything else. */
export type CodexBilling = 'plan' | 'api-key' | 'unknown';
export type CodexProbe = { available: boolean; loggedIn: boolean; billing: CodexBilling };

/**
 * Reads `codex login status`. codex 0.166.0 prints `Logged in using ChatGPT` or
 * `Logged in using an API key - <masked>` (to stderr) and exits 0; it exits non-zero when signed out.
 */
export async function probeCodex(codexBin = 'codex'): Promise<CodexProbe> {
  const available = (await run(codexBin, ['--version'], { timeout: 30_000 })).code === 0;
  if (!available) return { available, loggedIn: false, billing: 'unknown' };
  const r = await run(codexBin, ['login', 'status'], { timeout: 30_000 });
  const loggedIn = r.code === 0;
  const text = `${r.stdout}\n${r.stderr}`;
  const billing: CodexBilling = !loggedIn ? 'unknown'
    : /\bAPI key\b/i.test(text) ? 'api-key'
      : /\bChatGPT\b/i.test(text) ? 'plan'
        : 'unknown';
  return { available, loggedIn, billing };
}

/** Throws ProviderUnavailableError unless codex is installed and signed in with ChatGPT (plan billing). */
export async function requirePlanBilledCodex(codexBin = 'codex'): Promise<void> {
  const p = await probeCodex(codexBin);
  if (!p.available) throw new ProviderUnavailableError(`codex not found (${codexBin}); install the Codex CLI or use --provider openai`);
  if (!p.loggedIn) throw new ProviderUnavailableError('codex is not signed in; run `codex login` and sign in with ChatGPT, or use --provider openai');
  if (p.billing === 'api-key') {
    throw new ProviderUnavailableError('codex is signed in with an API key, so the image would be billed to that key outside the course budget. '
      + 'Sign in with ChatGPT (`codex logout`, then `codex login`) to use plan images, or use --provider openai, which records spend in the ledger');
  }
  if (p.billing !== 'plan') {
    throw new ProviderUnavailableError('cannot confirm that codex is signed in with ChatGPT (plan billing) from `codex login status`; '
      + 'sign in with ChatGPT, or use --provider openai');
  }
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
