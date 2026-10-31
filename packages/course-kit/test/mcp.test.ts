import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, expect, test, vi } from 'vitest';
import { studioCommands } from '../src/cli.js';
import { runCli } from '../src/cli/args.js';
import { initManifest, saveManifest } from '../src/manifest/io.js';
import { readLedger } from '../src/media/ledger.js';
import { savePlan } from '../src/media/plan.js';
import { createServer } from '../src/mcp/course-media-server.js';

const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const ID = 'A-M1-01';

function course(budgetUsd = 20): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'mcp-')), 'My Courses', 'Intro 101');
  mkdirSync(join(dir, '05-media', 'style'), { recursive: true });
  saveManifest(dir, {
    ...initManifest({ title: 'T', shape: 'workshop', delivery: 'virtual', sessions: [], audienceLevel: 'x', audienceSummary: 'y', budgetUsd, maxPlanImages: 40 }, '2026-10-31'),
    objectives: [{ id: 'O1', title: 'o', kind: 'cognitive' }],
    modules: [{ id: 'M1', title: 'M1', objectives: ['O1'] }],
  });
  savePlan(dir, { schema: 'media-plan/v1', items: [{
    id: ID, module: 'M1', objectives: ['O1'], function: 'scenario-illustration', kind: 'image',
    description: 'a broker reads a lease', provider: 'openai', estimateUsd: 0.053, quotaUnits: 0, status: 'approved',
  }] });
  writeFileSync(join(dir, '05-media', 'style', 'prompt-anchors.md'), 'flat vector');
  return dir;
}

async function connect(deps: Parameters<typeof createServer>[0]): Promise<Client> {
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer(deps).connect(a);
  const client = new Client({ name: 'test', version: '0.0.0' });
  await client.connect(b);
  return client;
}
type ToolResult = { isError?: boolean; content: { type: string; text: string }[] };
const call = async (c: Client, name: string, args: Record<string, unknown>) => (await c.callTool({ name, arguments: args })) as ToolResult;
const okFetch = () => vi.fn<typeof fetch>().mockImplementation(async () => new Response(JSON.stringify({ data: [{ b64_json: PNG_1PX }] })));

afterEach(() => vi.restoreAllMocks());

test('the server lists generate_image and estimate_cost', async () => {
  const c = await connect({ env: {} });
  expect((await c.listTools()).tools.map((t) => t.name).sort()).toEqual(['estimate_cost', 'generate_image']);
});

test('MCP generate_image refuses over budget with the same error text as the CLI', async () => {
  const dir = course(0.01);
  const fetchImpl = okFetch();
  const c = await connect({ env: { OPENAI_API_KEY: 'k' }, fetchImpl });
  const r = await call(c, 'generate_image', { courseDir: dir, assetId: ID, quality: 'standard' });
  expect(r.isError).toBe(true);
  expect(fetchImpl).not.toHaveBeenCalled();

  const logs: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  expect(await runCli(['gen', 'image', '--course', dir, '--asset', ID, '--provider', 'openai', '--quality', 'standard'], studioCommands)).toBe(3);
  vi.restoreAllMocks();
  const cliError = JSON.parse(logs.join('')).error as string;
  expect(cliError).toMatch(/Budget exceeded/);
  expect(r.content[0].text).toContain(cliError);
});

test('MCP generate_image reports "not configured" when no key exists; estimate_cost works without a key', async () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'data-'));
  const c = await connect({ env: {}, dataDir, fetchImpl: okFetch() });
  const dir = course();
  const r = await call(c, 'generate_image', { courseDir: dir, assetId: ID });
  expect(r.isError).toBe(true);
  expect(r.content[0].text).toBe(`course-media is not configured: set openai_api_key, OPENAI_API_KEY, or ${dataDir}/openai.key`);
  // The server keeps operating after an error, and estimating spends nothing, so it needs no key.
  const e = await call(c, 'estimate_cost', { courseDir: dir, quality: 'high' });
  expect(e.isError).toBeFalsy();
  expect(JSON.parse(e.content[0].text)).toEqual({ perModule: { M1: { usd: 0.21, quota: 0 } }, totalUsd: 0.21, totalQuota: 0 });
  expect((await c.listTools()).tools).toHaveLength(2);
});

test('MCP estimate_cost returns the plan estimate', async () => {
  const c = await connect({ env: { OPENAI_API_KEY: 'k' } });
  const r = await call(c, 'estimate_cost', { courseDir: course(), quality: 'high' });
  expect(r.isError).toBeFalsy();
  expect(JSON.parse(r.content[0].text)).toEqual({ perModule: { M1: { usd: 0.21, quota: 0 } }, totalUsd: 0.21, totalQuota: 0 });
});

test('MCP generate_image generates with openai and returns the asset', async () => {
  const dir = course();
  const dataDir = mkdtempSync(join(tmpdir(), 'data-'));
  writeFileSync(join(dataDir, 'openai.key'), 'file-key');
  const fetchImpl = okFetch();
  const c = await connect({ env: {}, dataDir, fetchImpl });
  const r = await call(c, 'generate_image', { courseDir: dir, assetId: ID });
  expect(r.isError).toBeFalsy();
  expect(JSON.parse(r.content[0].text)).toMatchObject({ id: ID, provider: 'openai', status: 'generated', costUsd: 0.053 });
  expect((fetchImpl.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toBe('Bearer file-key');
  expect(readLedger(dir).map((e) => e.kind)).toEqual(['reserve', 'settle']);
});

test('parallel MCP generate_image calls where the budget fits one: exactly one succeeds', async () => {
  const dir = course(0.06);
  savePlan(dir, { schema: 'media-plan/v1', items: ['A-M1-01', 'A-M1-02'].map((id) => ({
    id, module: 'M1', objectives: ['O1'], function: 'scenario-illustration' as const, kind: 'image' as const,
    description: 'a broker reads a lease', provider: 'openai', estimateUsd: 0.053, quotaUnits: 0, status: 'approved' as const,
  })) });
  const fetchImpl = okFetch();
  const c = await connect({ env: { OPENAI_API_KEY: 'k' }, fetchImpl });
  const rs = await Promise.all(['A-M1-01', 'A-M1-02'].map((assetId) => call(c, 'generate_image', { courseDir: dir, assetId })));
  expect(rs.filter((r) => !r.isError)).toHaveLength(1);
  expect(rs.find((r) => r.isError)?.content[0].text).toBe('Budget exceeded: cap $0.06, spent $0.05, request $0.05');
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});
