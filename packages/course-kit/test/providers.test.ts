import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { studioCommands } from '../src/cli.js';
import { runCli } from '../src/cli/args.js';
import { BudgetExceededError, ProviderUnavailableError, ValidationError } from '../src/errors.js';
import { initManifest, saveManifest } from '../src/manifest/io.js';
import { ledgerTotals, readLedger } from '../src/media/ledger.js';
import { savePlan } from '../src/media/plan.js';
import { addAsset, loadRegistry, saveRegistry } from '../src/media/registry.js';
import type { Asset, PlanItem } from '../src/media/schema.js';
import { probeCodex } from '../src/providers/codex.js';
import { generateAssetImage } from '../src/providers/generate.js';
import { resolveOpenAIKey } from '../src/providers/openai.js';
import { composeImagePrompt, NO_TEXT_RULE } from '../src/providers/prompt.js';
import { type DetectedProviders, loadProviders, providerPatterns, recordProviders } from '../src/providers/record.js';

const stubs = join(dirname(fileURLToPath(import.meta.url)), 'stubs');
const CODEX = join(stubs, 'codex');
const CODEX_NOFILE = join(stubs, 'codex-nofile');
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const KEY = 'sk-test-SECRET-123';
const ID = 'A-M1-01';

const item = (o: Partial<PlanItem> = {}): PlanItem => ({
  id: ID, module: 'M1', objectives: ['O1'], function: 'scenario-illustration', kind: 'image',
  description: 'a broker reads a lease', provider: 'openai', estimateUsd: 0.053, quotaUnits: 0, status: 'approved', ...o,
});

function course(o: { budgetUsd?: number; maxPlanImages?: number; items?: PlanItem[]; anchors?: boolean } = {}): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'prov-')), 'My Courses', 'Intro 101');
  mkdirSync(dir, { recursive: true });
  saveManifest(dir, {
    ...initManifest({ title: 'T', shape: 'workshop', delivery: 'virtual', sessions: [], audienceLevel: 'x', audienceSummary: 'y',
      budgetUsd: o.budgetUsd ?? 20, maxPlanImages: o.maxPlanImages ?? 40 }, '2026-10-31'),
    objectives: [{ id: 'O1', title: 'o', kind: 'cognitive' }],
    modules: [{ id: 'M1', title: 'M1', objectives: ['O1'] }],
  });
  savePlan(dir, { schema: 'media-plan/v1', items: o.items ?? [item()] });
  if (o.anchors !== false) {
    mkdirSync(join(dir, '05-media', 'style'), { recursive: true });
    writeFileSync(join(dir, '05-media', 'style', 'prompt-anchors.md'), 'flat vector, teal palette\n');
  }
  return dir;
}
const okFetch = () => vi.fn<typeof fetch>().mockImplementation(async () => new Response(JSON.stringify({ data: [{ b64_json: PNG_1PX }] })));
const errFetch = (status: number, message: string) =>
  vi.fn<typeof fetch>().mockImplementation(async () => new Response(JSON.stringify({ error: { message } }), { status }));
const existing = (dir: string, status: Asset['status']) => {
  const a: Asset = { id: ID, kind: 'image', objectives: ['O1'], provider: 'openai', files: [], alt: 'x', status: 'generated', costUsd: 0, quotaUnits: 0, createdAt: 'x' };
  const r = addAsset(loadRegistry(dir), a);
  saveRegistry(dir, { ...r, assets: r.assets.map((x) => ({ ...x, status })) });
};

test('composeImagePrompt ends with the exact no-text rule', () => {
  expect(composeImagePrompt('flat vector, teal palette', 'a broker reads a lease'))
    .toMatch(/No text, letters, numbers, logos, or watermarks anywhere in the image\.$/);
  expect(composeImagePrompt('A', 'B')).toBe(`A\n\nB\n\n${NO_TEXT_RULE}`);
});

test('resolveOpenAIKey prefers COURSE_MEDIA_OPENAI_KEY, then OPENAI_API_KEY, then the key file', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'data-'));
  writeFileSync(join(dataDir, 'openai.key'), 'from-file\n');
  expect(resolveOpenAIKey({ COURSE_MEDIA_OPENAI_KEY: 'a', OPENAI_API_KEY: 'b' }, dataDir)).toBe('a');
  expect(resolveOpenAIKey({ COURSE_MEDIA_OPENAI_KEY: '', OPENAI_API_KEY: 'b' }, dataDir)).toBe('b');
  expect(resolveOpenAIKey({ COURSE_MEDIA_OPENAI_KEY: '' }, dataDir)).toBe('from-file');
  expect(resolveOpenAIKey({}, mkdtempSync(join(tmpdir(), 'data-')))).toBeNull();
  expect(resolveOpenAIKey({})).toBeNull();
});

test('generateAssetImage with openai records spend and a generated asset', async () => {
  const dir = course();
  const fetchImpl = okFetch();
  const a = await generateAssetImage(dir, ID, 'openai', { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl });
  expect(a).toMatchObject({
    id: ID, kind: 'image', function: 'scenario-illustration', objectives: ['O1'], module: 'M1', provider: 'openai',
    source: `05-media/src/${ID}.prompt.txt`, files: [`05-media/out/${ID}.png`], alt: '', status: 'generated',
    costUsd: 0.053, quotaUnits: 0,
  });
  expect(a.sha256).toMatch(/^[0-9a-f]{64}$/);
  expect(ledgerTotals(dir)).toEqual({ spentUsd: 0.053, quotaUsed: 0 });
  expect(readLedger(dir).map((e) => e.kind)).toEqual(['reserve', 'settle']);
  expect(readLedger(dir)[1]).toMatchObject({ assetId: ID, provider: 'openai', model: 'gpt-image-2', estimateUsd: 0.053, actualUsd: 0.053 });
  expect(loadRegistry(dir).assets).toEqual([a]);
  expect(readFileSync(join(dir, '05-media', 'out', `${ID}.png`))).toEqual(Buffer.from(PNG_1PX, 'base64'));
  expect(readFileSync(join(dir, '05-media', 'src', `${ID}.prompt.txt`), 'utf8'))
    .toBe(`flat vector, teal palette\n\na broker reads a lease\n\n${NO_TEXT_RULE}`);
  const [url, init] = fetchImpl.mock.calls[0];
  expect(url).toBe('https://api.openai.com/v1/images/generations');
  expect(init?.method).toBe('POST');
  expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
  expect(JSON.parse(String(init?.body))).toEqual({
    model: 'gpt-image-2', prompt: `flat vector, teal palette\n\na broker reads a lease\n\n${NO_TEXT_RULE}`, size: '1024x1024', quality: 'medium', n: 1,
  });
  for (const f of ['.course/cost-ledger.jsonl', '05-media/registry.json', `05-media/src/${ID}.prompt.txt`]) {
    expect(readFileSync(join(dir, f), 'utf8')).not.toContain(KEY);
  }
});

test('draft and high map to the API qualities low and high', async () => {
  for (const [q, api] of [['draft', 'low'], ['high', 'high']] as const) {
    const fetchImpl = okFetch();
    await generateAssetImage(course(), ID, 'openai', { quality: q, env: { OPENAI_API_KEY: KEY }, fetchImpl });
    expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body)).quality).toBe(api);
  }
});

test('generateAssetImage refuses before any network call when the budget is too small', async () => {
  const dir = course({ budgetUsd: 0.01 });
  const fetchImpl = okFetch();
  await expect(generateAssetImage(dir, ID, 'openai', { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl }))
    .rejects.toBeInstanceOf(BudgetExceededError);
  expect(fetchImpl).not.toHaveBeenCalled();
  expect(readLedger(dir)).toEqual([]);
  expect(existsSync(join(dir, '05-media', 'out', `${ID}.png`))).toBe(false);
});

test('generateAssetImage refuses a plan item that is not approved', async () => {
  const fetchImpl = okFetch();
  await expect(generateAssetImage(course({ items: [item({ status: 'proposed' })] }), ID, 'openai',
    { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl })).rejects.toBeInstanceOf(ValidationError);
  await expect(generateAssetImage(course({ items: [item({ kind: 'diagram' })] }), ID, 'openai',
    { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl })).rejects.toBeInstanceOf(ValidationError);
  await expect(generateAssetImage(course(), 'A-M9-99', 'openai',
    { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl })).rejects.toBeInstanceOf(ValidationError);
  await expect(generateAssetImage(course(), '../evil', 'openai',
    { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl })).rejects.toBeInstanceOf(ValidationError);
  expect(fetchImpl).not.toHaveBeenCalled();
});

test('generateAssetImage needs the prompt anchors', async () => {
  await expect(generateAssetImage(course({ anchors: false }), ID, 'openai', { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl: okFetch() }))
    .rejects.toThrow(new ValidationError('Run generate-style-guide first.'));
});

test('generateAssetImage with codex uses a stub codex binary and records quota 1', async () => {
  const dir = course({ items: [item({ provider: 'codex' })] });
  const log = join(mkdtempSync(join(tmpdir(), 'log-')), 'argv.jsonl');
  vi.stubEnv('CODEX_STUB_LOG', log);
  try {
    const a = await generateAssetImage(dir, ID, 'codex', { quality: 'standard', codexBin: CODEX });
    expect(a).toMatchObject({ provider: 'codex', costUsd: 0, quotaUnits: 1, status: 'generated', files: [`05-media/out/${ID}.png`] });
  } finally { vi.unstubAllEnvs(); }
  expect(ledgerTotals(dir)).toEqual({ spentUsd: 0, quotaUsed: 1 });
  expect(existsSync(join(dir, '05-media', 'out', `${ID}.png`))).toBe(true);
  const call = JSON.parse(readFileSync(log, 'utf8').trim());
  const outDir = join(dir, '05-media', 'out');
  expect(call.cwd).toBe(outDir);
  expect(call.args.slice(0, 6)).toEqual(['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-C', outDir]);
  expect(call.args[6]).toBe(`$imagegen flat vector, teal palette\n\na broker reads a lease\n\n${NO_TEXT_RULE} Save the image as ${ID}.png.`);
});

test('codex that writes no file gives ProviderUnavailableError and no ledger entry', async () => {
  const dir = course({ items: [item({ provider: 'codex' })] });
  await expect(generateAssetImage(dir, ID, 'codex', { quality: 'standard', codexBin: CODEX_NOFILE }))
    .rejects.toBeInstanceOf(ProviderUnavailableError);
  expect(ledgerTotals(dir)).toEqual({ spentUsd: 0, quotaUsed: 0 });
  expect(readLedger(dir).map((e) => e.kind)).toEqual(['reserve', 'release']);
  expect(loadRegistry(dir).assets).toEqual([]);
});

test('codex runs without the OpenAI key variables in its environment', async () => {
  const dir = course({ items: [item({ provider: 'codex' })] });
  const log = join(mkdtempSync(join(tmpdir(), 'log-')), 'argv.jsonl');
  vi.stubEnv('CODEX_STUB_LOG', log);
  vi.stubEnv('OPENAI_API_KEY', KEY);
  vi.stubEnv('COURSE_MEDIA_OPENAI_KEY', KEY);
  try {
    await generateAssetImage(dir, ID, 'codex', { quality: 'standard', codexBin: CODEX });
    await probeCodex(CODEX);
  } finally { vi.unstubAllEnvs(); }
  const calls = readFileSync(log, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  expect(calls).toHaveLength(3);
  for (const c of calls) expect(c.keys).toEqual({ OPENAI_API_KEY: false, COURSE_MEDIA_OPENAI_KEY: false });
});

test('parallel generations where the budget fits one: one succeeds, one is refused, one request', async () => {
  const dir = course({ budgetUsd: 0.06 });
  const fetchImpl = okFetch();
  const r = await Promise.allSettled([1, 2].map(() =>
    generateAssetImage(dir, ID, 'openai', { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl })));
  expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
  expect((r.find((x) => x.status === 'rejected') as PromiseRejectedResult).reason).toBeInstanceOf(BudgetExceededError);
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(ledgerTotals(dir)).toEqual({ spentUsd: 0.053, quotaUsed: 0 });
});

test('parallel CLI processes share the plan image cap through the ledger', async () => {
  const dir = course({ maxPlanImages: 1, items: [item({ provider: 'codex' }), item({ id: 'A-M1-02', provider: 'codex' })] });
  const bundle = join(stubs, '..', '..', '..', '..', 'plugins/course-studio/skills/course-kit/scripts/course-kit.mjs');
  const env = { ...process.env, PATH: `${stubs}:${process.env.PATH}` };
  const runOne = (id: string) => new Promise<number | null>((resolve) => {
    execFile('node', [bundle, 'gen', 'image', '--course', dir, '--asset', id, '--provider', 'codex', '--quality', 'standard'], { env },
      (err) => resolve(err ? (typeof err.code === 'number' ? err.code : null) : 0));
  });
  const codes = await Promise.all([runOne(ID), runOne('A-M1-02')]);
  expect(codes.sort()).toEqual([0, 3]);
  expect(ledgerTotals(dir)).toEqual({ spentUsd: 0, quotaUsed: 1 });
}, 30000);

test('codex refuses before running when the plan image cap is reached', async () => {
  const dir = course({ maxPlanImages: 0, items: [item({ provider: 'codex' })] });
  const log = join(mkdtempSync(join(tmpdir(), 'log-')), 'argv.jsonl');
  vi.stubEnv('CODEX_STUB_LOG', log);
  try {
    await expect(generateAssetImage(dir, ID, 'codex', { quality: 'standard', codexBin: CODEX }))
      .rejects.toThrow(/Plan image cap exceeded/);
  } finally { vi.unstubAllEnvs(); }
  expect(existsSync(log)).toBe(false);
});

test('a missing codex binary is ProviderUnavailableError', async () => {
  await expect(generateAssetImage(course(), ID, 'codex', { quality: 'standard', codexBin: join(stubs, 'no-such-codex') }))
    .rejects.toBeInstanceOf(ProviderUnavailableError);
});

test('regeneration replaces a generated or rejected asset', async () => {
  for (const status of ['generated', 'rejected'] as const) {
    const dir = course();
    existing(dir, status);
    const a = await generateAssetImage(dir, ID, 'openai', { quality: 'draft', env: { OPENAI_API_KEY: KEY }, fetchImpl: okFetch() });
    expect(loadRegistry(dir).assets).toEqual([a]);
  }
});

test('regeneration of an approved or imported asset is refused before the budget check and network', async () => {
  for (const status of ['approved', 'imported'] as const) {
    const dir = course({ budgetUsd: 0 });
    existing(dir, status);
    const fetchImpl = okFetch();
    await expect(generateAssetImage(dir, ID, 'openai', { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl }))
      .rejects.toThrow(new ValidationError(`Asset ${ID} is ${status}; reject it first to regenerate`));
    expect(fetchImpl).not.toHaveBeenCalled();
  }
});

test('OpenAI errors map to exit classes and never include the key', async () => {
  const cases: [typeof fetch, new (m: string) => Error, RegExp][] = [
    [errFetch(401, `Incorrect API key provided: ${KEY}`), ProviderUnavailableError, /401/],
    [errFetch(429, 'Rate limit reached'), ProviderUnavailableError, /429.*Rate limit reached/],
    [errFetch(503, 'overloaded'), ProviderUnavailableError, /503.*overloaded/],
    [errFetch(400, 'Your request was rejected by the safety system'), ValidationError, /400.*safety system/],
    [vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed', { cause: Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }) })),
      ProviderUnavailableError, /fetch failed/],
  ];
  for (const [fetchImpl, cls, re] of cases) {
    const dir = course();
    const p = generateAssetImage(dir, ID, 'openai', { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl });
    await expect(p).rejects.toBeInstanceOf(cls);
    const msg = await p.catch((e: Error) => e.message);
    expect(msg).toMatch(re);
    expect(msg).not.toContain(KEY);
    expect(ledgerTotals(dir)).toEqual({ spentUsd: 0, quotaUsed: 0 });
    expect(loadRegistry(dir).assets).toEqual([]);
  }
});

test('a request that may have been billed is recorded as spent even when it fails', async () => {
  const cases: typeof fetch[] = [
    vi.fn<typeof fetch>().mockImplementation(async () => new Response('{"data":[]}')),
    vi.fn<typeof fetch>().mockRejectedValue(Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' })),
    vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed', { cause: Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' }) })),
  ];
  for (const fetchImpl of cases) {
    const dir = course();
    await expect(generateAssetImage(dir, ID, 'openai', { quality: 'standard', env: { OPENAI_API_KEY: KEY }, fetchImpl }))
      .rejects.toBeInstanceOf(ProviderUnavailableError);
    expect(ledgerTotals(dir)).toEqual({ spentUsd: 0.053, quotaUsed: 0 });
    expect(readLedger(dir).map((e) => e.kind)).toEqual(['reserve', 'settle']);
    expect(loadRegistry(dir).assets).toEqual([]);
  }
});

test('openai without a key is ProviderUnavailableError and makes no request', async () => {
  const fetchImpl = okFetch();
  await expect(generateAssetImage(course(), ID, 'openai', { quality: 'standard', env: {}, dataDir: mkdtempSync(join(tmpdir(), 'd-')), fetchImpl }))
    .rejects.toBeInstanceOf(ProviderUnavailableError);
  expect(fetchImpl).not.toHaveBeenCalled();
});

test('probeCodex reports availability and login', async () => {
  expect(await probeCodex(CODEX)).toEqual({ available: true, loggedIn: true });
  expect(await probeCodex(CODEX_NOFILE)).toEqual({ available: true, loggedIn: false });
  expect(await probeCodex(join(stubs, 'no-such-codex'))).toEqual({ available: false, loggedIn: false });
});

const detected: DetectedProviders = {
  detectedAt: '2026-10-31T00:00:00Z', image: ['mcp__x__generate_image'], diagram: ['mcp__claude_ai_Excalidraw__x'],
  designSkills: ['impeccable:impeccable'], codex: { available: true, loggedIn: false },
};

test('recordProviders and loadProviders round-trip through .course/providers.json', () => {
  const dir = course();
  expect(loadProviders(dir)).toBeNull();
  recordProviders(dir, detected);
  expect(existsSync(join(dir, '.course', 'providers.json'))).toBe(true);
  expect(loadProviders(dir)).toEqual(detected);
  expect(() => recordProviders(dir, { ...detected, image: 'x' } as unknown as DetectedProviders)).toThrow(ValidationError);
});

test('providerPatterns gives the bundled name patterns', () => {
  expect(providerPatterns()).toEqual({
    image: ['*generate_image*', '*image_gen*'],
    diagram: ['*Excalidraw*', '*Mermaid*'],
    designSkills: ['impeccable*', 'design-taste-frontend*', 'ui-ux-pro-max*', 'frontend-design*'],
  });
});

let logs: string[];
const out = () => JSON.parse(logs.join(''));
beforeEach(() => { logs = []; });
afterEach(() => vi.restoreAllMocks());
const capture = () => vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });

test('CLI gen image refuses over budget with exit 3', async () => {
  const dir = course({ budgetUsd: 0.01 });
  capture();
  expect(await runCli(['gen', 'image', '--course', dir, '--asset', ID, '--provider', 'openai', '--quality', 'standard'], studioCommands)).toBe(3);
  expect(out()).toEqual({ error: 'Budget exceeded: cap $0.01, spent $0.00, request $0.05' });
});

test('CLI gen image validates provider and quality', async () => {
  const dir = course();
  capture();
  expect(await runCli(['gen', 'image', '--course', dir, '--asset', ID, '--provider', 'gemini', '--quality', 'standard'], studioCommands)).toBe(1);
  expect(await runCli(['gen', 'image', '--course', dir, '--asset', ID, '--provider', 'openai', '--quality', 'ultra'], studioCommands)).toBe(1);
});

test('CLI providers record, show and patterns', async () => {
  const dir = course();
  capture();
  expect(await runCli(['providers', 'show', '--course', dir], studioCommands)).toBe(0);
  expect(out()).toEqual({ detected: null });
  logs = [];
  expect(await runCli(['providers', 'record', '--course', dir, '--json', JSON.stringify(detected)], studioCommands)).toBe(0);
  expect(out()).toEqual({ ok: true });
  logs = [];
  expect(await runCli(['providers', 'show', '--course', dir], studioCommands)).toBe(0);
  expect(out()).toEqual(detected);
  logs = [];
  expect(await runCli(['providers', 'record', '--course', dir, '--json', '{"image":1}'], studioCommands)).toBe(2);
  expect(await runCli(['providers', 'record', '--course', dir, '--json', 'not json'], studioCommands)).toBe(2);
  logs = [];
  expect(await runCli(['providers', 'patterns'], studioCommands)).toBe(0);
  expect(out().image).toEqual(['*generate_image*', '*image_gen*']);
});
