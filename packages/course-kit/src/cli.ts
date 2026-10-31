import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkTokens, deriveTokens, loadBrand, type Tokens } from './brand/tokens.js';
import { coreCommands } from './commands-core.js';
import { type CommandTable, type ParsedArgs, requireFlag, requirePositional, runCli } from './cli/args.js';
import { UsageError, ValidationError } from './errors.js';
import { loadManifest } from './manifest/io.js';
import { embedAll, embedOne } from './media/embed.js';
import { checkBudget, ledgerTotals, releaseSpend, reserveSpend, settleSpend } from './media/ledger.js';
import { probeCodex } from './providers/codex.js';
import { generateAssetImage, IMAGE_PROVIDERS, IMAGE_QUALITIES, type ImageProvider } from './providers/generate.js';
import type { ImageQuality } from './providers/openai.js';
import { loadProviders, parseDetectedProviders, providerPatterns, recordProviders } from './providers/record.js';
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
function oneOf<T extends string>(a: ParsedArgs, flag: string, allowed: readonly T[]): T {
  const v = requireFlag(a, flag);
  if (!(allowed as readonly string[]).includes(v)) throw new UsageError(`--${flag} must be one of ${allowed.join('|')}`);
  return v as T;
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
  // Third-party paid tools (not gen image / generate_image, which reserve themselves): reserve before the call,
  // then settle with the actual cost, or release only when the tool certainly did not bill.
  'ledger reserve': async (a) => {
    const course = requireFlag(a, 'course');
    const req = {
      assetId: requireFlag(a, 'asset'), provider: requireFlag(a, 'provider'), estimateUsd: num(a, 'usd'), quotaUnits: num(a, 'quota'),
    };
    return { reservationId: await reserveSpend(course, loadManifest(course), req) };
  },
  'ledger settle': (a) => {
    const course = requireFlag(a, 'course');
    const actualUsd = optNum(a, 'usd');
    settleSpend(course, requireFlag(a, 'reservation'), actualUsd === undefined ? {} : { actualUsd });
    return { ok: true, ...ledgerTotals(course) };
  },
  'ledger release': (a) => {
    const course = requireFlag(a, 'course');
    releaseSpend(course, requireFlag(a, 'reservation'));
    return { ok: true, ...ledgerTotals(course) };
  },
  'gen image': async (a) => {
    const course = requireFlag(a, 'course');
    const assetId = requireFlag(a, 'asset');
    const provider = oneOf<ImageProvider>(a, 'provider', IMAGE_PROVIDERS);
    const quality = oneOf<ImageQuality>(a, 'quality', IMAGE_QUALITIES);
    const dataDirFlag = typeof a.flags['data-dir'] === 'string' ? a.flags['data-dir'] : undefined;
    return { asset: await generateAssetImage(course, assetId, provider, { quality, dataDir: dataDirFlag }) };
  },
  embed: (a) => {
    const course = requireFlag(a, 'course');
    return embedOne(course, resolve(requirePositional(a, 0, 'file')), requireFlag(a, 'asset'), requireFlag(a, 'anchor'));
  },
  'embed all': (a) => ({ files: embedAll(requireFlag(a, 'course')) }),
  'providers probe-codex': () => probeCodex(),
  'providers record': (a) => {
    const course = requireFlag(a, 'course');
    let raw: unknown;
    try { raw = JSON.parse(requireFlag(a, 'json')); }
    catch (e) {
      if (e instanceof UsageError) throw e;
      throw new ValidationError('--json is not valid JSON');
    }
    recordProviders(course, parseDetectedProviders(raw));
    return { ok: true };
  },
  'providers show': (a) => loadProviders(requireFlag(a, 'course')) ?? { detected: null },
  'brand validate': (a) => ({ brand: loadBrand(requirePositional(a, 0, 'file')) }),
  'style tokens': (a) => {
    const course = requireFlag(a, 'course');
    let brandPath: string | undefined;
    if (typeof a.flags.brand === 'string') brandPath = resolve(a.flags.brand);
    else {
      const rel = loadManifest(course).brand;
      const theme = join(course, '05-media', 'style', 'theme.yaml');
      if (rel) brandPath = resolve(course, rel);
      else if (existsSync(theme)) brandPath = theme;
    }
    if (!brandPath) throw new UsageError('no brand file: pass --brand, set brand in course.yaml, or create 05-media/style/theme.yaml');
    const tokens = deriveTokens(loadBrand(brandPath));
    const issues = checkTokens(tokens);
    const errors = issues.filter((i) => i.level === 'error');
    if (errors.length) throw new ValidationError(`brand tokens fail contrast checks: ${errors.map((i) => `${i.path}: ${i.message}`).join('; ')}`);
    const dir = join(course, '05-media', 'style');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'tokens.json'), JSON.stringify(tokens, null, 2) + '\n');
    return { tokens, issues };
  },
  'providers patterns': () => providerPatterns(),
};

const isMain = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch { return false; }
})();

if (isMain) process.exitCode = await runCli(process.argv.slice(2), studioCommands);
