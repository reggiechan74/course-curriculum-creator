import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Tokens } from './brand/tokens.js';
import { coreCommands } from './commands-core.js';
import { type CommandTable, type ParsedArgs, requireFlag, requirePositional, runCli } from './cli/args.js';
import { UsageError, ValidationError } from './errors.js';
import { loadManifest } from './manifest/io.js';
import { checkBudget, ledgerTotals } from './media/ledger.js';
import { type DepName, installDeps, isDepName } from './render/deps.js';
import { renderExcalidraw } from './render/excalidraw.js';
import { renderMermaid } from './render/mermaid.js';
import { buildLabelOverlay, type Label } from './render/overlay.js';
import { renderVegaLite } from './render/vegalite.js';

type PartialTokens = Partial<Tokens>;

function readJson(path: string, what: string): unknown {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (e) { throw new ValidationError(`cannot read ${what} ${path}: ${e instanceof Error ? e.message : String(e)}`); }
}
function tokensOf(a: ParsedArgs): PartialTokens {
  return typeof a.flags.tokens === 'string' ? (readJson(a.flags.tokens, 'tokens') as PartialTokens) : {};
}
function dataDir(a: ParsedArgs): string {
  return requireFlag(a, 'data-dir');
}
function num(a: ParsedArgs, flag: string): number {
  const raw = requireFlag(a, flag);
  const n = raw.trim() === '' ? NaN : Number(raw);
  if (!Number.isFinite(n)) throw new UsageError(`--${flag} must be a number`);
  return n;
}
function optNum(a: ParsedArgs, flag: string): number | undefined {
  return a.flags[flag] === undefined ? undefined : num(a, flag);
}

export const studioCommands: CommandTable = {
  ...coreCommands,
  'deps install': (a) => {
    const names = a.positionals;
    if (!names.length) throw new UsageError('missing argument: <names…>');
    for (const n of names) if (!isDepName(n)) throw new UsageError(`unknown dependency: ${n}`);
    installDeps(dataDir(a), names as DepName[]);
    return { installed: names };
  },
  'render vegalite': async (a) => {
    const out = requirePositional(a, 1, 'out');
    await renderVegaLite(readJson(requirePositional(a, 0, 'src'), 'spec') as object, out, tokensOf(a));
    return { out };
  },
  'render mermaid': async (a) => {
    const out = requirePositional(a, 1, 'out');
    await renderMermaid(requirePositional(a, 0, 'src'), out, dataDir(a), tokensOf(a));
    return { out };
  },
  'render excalidraw': async (a) => {
    const out = requirePositional(a, 1, 'out');
    await renderExcalidraw(requirePositional(a, 0, 'src'), out, dataDir(a));
    return { out };
  },
  'render overlay': (a) => {
    const image = requirePositional(a, 0, 'image');
    const labels = readJson(requirePositional(a, 1, 'labels.json'), 'labels') as Label[];
    if (!Array.isArray(labels)) throw new ValidationError('labels.json must be an array');
    const out = requirePositional(a, 2, 'out');
    const width = optNum(a, 'width') ?? 1024;
    const height = optNum(a, 'height') ?? 1024;
    writeFileSync(out, buildLabelOverlay(image, width, height, labels, tokensOf(a)));
    return { out };
  },
  'ledger totals': (a) => ledgerTotals(requireFlag(a, 'course')),
  'ledger check': (a) => {
    const course = requireFlag(a, 'course');
    const request = { usd: num(a, 'usd'), quota: num(a, 'quota') };
    checkBudget(loadManifest(course), ledgerTotals(course), request);
    return { ok: true };
  },
};

const isMain = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch { return false; }
})();

if (isMain) process.exitCode = await runCli(process.argv.slice(2), studioCommands);
