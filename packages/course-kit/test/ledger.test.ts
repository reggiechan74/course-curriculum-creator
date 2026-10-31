import { appendFileSync, existsSync, mkdirSync, mkdtempSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { studioCommands } from '../src/cli.js';
import { runCli } from '../src/cli/args.js';
import { BudgetExceededError, ValidationError } from '../src/errors.js';
import { initManifest, type Manifest, saveManifest } from '../src/manifest/io.js';
import {
  checkBudget, type LedgerEntry, ledgerTotals, readLedger, recordSpend, releaseSpend, reserveSpend, settleSpend,
} from '../src/media/ledger.js';

const m = { media: { budgetUsd: 1.0, maxPlanImages: 2, approvalRequired: true } } as Manifest;
const dir = () => mkdtempSync(join(tmpdir(), 'led '));
const entry = (o: Partial<LedgerEntry> = {}): LedgerEntry => ({
  at: '2026-10-31T00:00:00Z', assetId: 'A1', provider: 'gemini', estimateUsd: 0.1, actualUsd: 0.1, quotaUnits: 0, ...o,
});

test('a request that crosses the cap is refused when spend is below the cap', () => {
  expect(() => checkBudget(m, { spentUsd: 0.95, quotaUsed: 0 }, { usd: 0.10, quota: 0 })).toThrow(BudgetExceededError);
});
test('a request that reaches the cap exactly is permitted', () => {
  expect(() => checkBudget(m, { spentUsd: 0.90, quotaUsed: 0 }, { usd: 0.10, quota: 0 })).not.toThrow();
});
test('plan-billed images above maxPlanImages are refused', () => {
  expect(() => checkBudget(m, { spentUsd: 0, quotaUsed: 2 }, { usd: 0, quota: 1 })).toThrow(/Plan image cap exceeded: cap 2, used 2, request 1/);
  expect(() => checkBudget(m, { spentUsd: 0, quotaUsed: 1 }, { usd: 0, quota: 1 })).not.toThrow();
});
test('the error message gives the cap, the spend and the request', () => {
  expect(() => checkBudget(m, { spentUsd: 0.95, quotaUsed: 0 }, { usd: 0.10, quota: 0 }))
    .toThrow('Budget exceeded: cap $1.00, spent $0.95, request $0.10');
});
test('absent ledger is empty with zero totals', () => {
  const d = dir();
  expect(readLedger(d)).toEqual([]);
  expect(ledgerTotals(d)).toEqual({ spentUsd: 0, quotaUsed: 0 });
});
test('recordSpend then ledgerTotals sums usd and quota', () => {
  const d = dir();
  recordSpend(d, entry({ actualUsd: 0.25, quotaUnits: 1 }));
  recordSpend(d, entry({ assetId: 'A2', actualUsd: 0.5, quotaUnits: 2 }));
  expect(readLedger(d)).toHaveLength(2);
  expect(ledgerTotals(d)).toEqual({ spentUsd: 0.75, quotaUsed: 3 });
});
test('sub-cent entries accumulate', () => {
  const d = dir();
  for (let i = 0; i < 10; i++) recordSpend(d, entry({ actualUsd: 0.006 }));
  expect(ledgerTotals(d).spentUsd).toBeCloseTo(0.06, 10);
});
test('a damaged ledger line is a ValidationError, not a zero total', () => {
  const d = dir();
  recordSpend(d, entry());
  appendFileSync(join(d, '.course', 'cost-ledger.jsonl'), 'not json\n');
  expect(() => ledgerTotals(d)).toThrow(ValidationError);
});
test('recordSpend rejects an invalid entry', () => {
  expect(() => recordSpend(dir(), { ...entry(), actualUsd: 'x' } as unknown as LedgerEntry)).toThrow(ValidationError);
});
test('checkBudget rejects NaN, negative and non-finite requests', () => {
  const t = { spentUsd: 0, quotaUsed: 0 };
  for (const bad of [NaN, -1, Infinity]) {
    expect(() => checkBudget(m, t, { usd: bad, quota: 0 })).toThrow(ValidationError);
    expect(() => checkBudget(m, t, { usd: 0, quota: bad })).toThrow(ValidationError);
  }
});
test('ledger entries require nonnegative finite numbers', () => {
  expect(() => recordSpend(dir(), entry({ actualUsd: -0.1 }))).toThrow(ValidationError);
  expect(() => recordSpend(dir(), entry({ quotaUnits: Infinity }))).toThrow(ValidationError);
  expect(() => recordSpend(dir(), entry({ estimateUsd: NaN }))).toThrow(ValidationError);
});
test('cap comparison rounds the sum once', () => {
  // 0.004 + 0.004 rounds to 0.01 once; separately rounded cents would give 0
  const tiny = { media: { budgetUsd: 0.0, maxPlanImages: 2, approvalRequired: true } } as Manifest;
  expect(() => checkBudget(tiny, { spentUsd: 0.004, quotaUsed: 0 }, { usd: 0.004, quota: 0 })).toThrow(BudgetExceededError);
});

const base = { assetId: 'A1', provider: 'openai', estimateUsd: 0.5, quotaUnits: 0 };
test('a reservation counts as spent until it is released', async () => {
  const d = dir();
  const id = await reserveSpend(d, m, base);
  expect(ledgerTotals(d)).toEqual({ spentUsd: 0.5, quotaUsed: 0 });
  await expect(reserveSpend(d, m, { ...base, estimateUsd: 0.6 })).rejects.toThrow('Budget exceeded: cap $1.00, spent $0.50, request $0.60');
  releaseSpend(d, id);
  expect(ledgerTotals(d)).toEqual({ spentUsd: 0, quotaUsed: 0 });
  expect(readLedger(d).map((e) => e.kind)).toEqual(['reserve', 'release']);
});
test('a settled reservation counts the settled amount once', async () => {
  const d = dir();
  recordSpend(d, entry({ actualUsd: 0.1 }));
  const id = await reserveSpend(d, m, { ...base, quotaUnits: 1 });
  settleSpend(d, id, { actualUsd: 0.4, model: 'gpt-image-2' });
  expect(ledgerTotals(d)).toEqual({ spentUsd: 0.5, quotaUsed: 1 });
  expect(readLedger(d)[2]).toMatchObject({ kind: 'settle', reservationId: id, assetId: 'A1', actualUsd: 0.4, model: 'gpt-image-2' });
});
test('parallel reservations that fit only one: one succeeds', async () => {
  const d = dir();
  const r = await Promise.allSettled([reserveSpend(d, m, { ...base, estimateUsd: 0.6 }), reserveSpend(d, m, { ...base, estimateUsd: 0.6 })]);
  expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
  expect(r.filter((x) => x.status === 'rejected').map((x) => (x as PromiseRejectedResult).reason)[0]).toBeInstanceOf(BudgetExceededError);
});
test('reserveSpend waits for the ledger lock and removes a stale lock', async () => {
  const d = dir();
  mkdirSync(join(d, '.course'), { recursive: true });
  const lock = join(d, '.course', 'ledger.lock');
  writeFileSync(lock, '');
  let done = false;
  const p = reserveSpend(d, m, base).then(() => { done = true; });
  await new Promise((r) => setTimeout(r, 150));
  expect(done).toBe(false);
  const { unlinkSync } = await import('node:fs');
  unlinkSync(lock);
  await p;
  expect(existsSync(lock)).toBe(false);
  writeFileSync(lock, '');
  const old = new Date(Date.now() - 10 * 60_000);
  utimesSync(lock, old, old);
  await reserveSpend(d, m, base);
  expect(ledgerTotals(d).spentUsd).toBe(1);
});

describe('ledger reserve, settle and release CLI (third-party paid tools)', () => {
  let logs: string[] = [];
  beforeEach(() => {
    logs = [];
    vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => { logs.push(String(s)); return true; });
  });
  afterEach(() => vi.restoreAllMocks());
  const last = () => JSON.parse(logs[logs.length - 1]);
  const courseWith = (budgetUsd: number, maxPlanImages = 40) => {
    const d = join(dir(), 'My Course');
    mkdirSync(d, { recursive: true });
    saveManifest(d, initManifest({ title: 'T', shape: 'workshop', delivery: 'virtual', sessions: [], audienceLevel: 'x', audienceSummary: 'y', budgetUsd, maxPlanImages }, '2026-10-31'));
    return d;
  };
  const reserve = (d: string, usd: string, quota = '0') =>
    runCli(['ledger', 'reserve', '--course', d, '--asset', 'A-M1-01', '--provider', 'mcp__x__generate_image', '--usd', usd, '--quota', quota], studioCommands);

  test('reserve returns a reservation id and counts it; settle records the actual amount', async () => {
    const d = courseWith(1);
    expect(await reserve(d, '0.40')).toBe(0);
    const { reservationId } = last();
    expect(reservationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(ledgerTotals(d)).toEqual({ spentUsd: 0.4, quotaUsed: 0 });
    expect(await runCli(['ledger', 'settle', '--course', d, '--reservation', reservationId, '--usd', '0.25'], studioCommands)).toBe(0);
    expect(ledgerTotals(d)).toEqual({ spentUsd: 0.25, quotaUsed: 0 });
    expect(readLedger(d).map((e) => [e.kind, e.provider, e.actualUsd])).toEqual([['reserve', 'mcp__x__generate_image', 0.4], ['settle', 'mcp__x__generate_image', 0.25]]);
  });

  test('settle without --usd uses the estimate; release counts nothing', async () => {
    const d = courseWith(1);
    await reserve(d, '0.40');
    const a = last().reservationId;
    expect(await runCli(['ledger', 'settle', '--course', d, '--reservation', a], studioCommands)).toBe(0);
    await reserve(d, '0.30', '1');
    const b = last().reservationId;
    expect(ledgerTotals(d)).toEqual({ spentUsd: 0.7, quotaUsed: 1 });
    expect(await runCli(['ledger', 'release', '--course', d, '--reservation', b], studioCommands)).toBe(0);
    expect(ledgerTotals(d)).toEqual({ spentUsd: 0.4, quotaUsed: 0 });
  });

  test('reserve over the cap exits 3 and writes nothing', async () => {
    const d = courseWith(0.5, 1);
    expect(await reserve(d, '0.60')).toBe(3);
    expect(last().error).toMatch(/Budget exceeded/);
    expect(await reserve(d, '0', '2')).toBe(3);
    expect(last().error).toMatch(/Plan image cap exceeded/);
    expect(readLedger(d)).toEqual([]);
  });

  test('unknown or already closed reservations are refused with exit 2; bad numbers exit 1', async () => {
    const d = courseWith(1);
    expect(await runCli(['ledger', 'settle', '--course', d, '--reservation', 'nope'], studioCommands)).toBe(2);
    await reserve(d, '0.10');
    const id = last().reservationId;
    expect(await runCli(['ledger', 'release', '--course', d, '--reservation', id], studioCommands)).toBe(0);
    expect(await runCli(['ledger', 'settle', '--course', d, '--reservation', id], studioCommands)).toBe(2);
    expect(await runCli(['ledger', 'release', '--course', d, '--reservation', id], studioCommands)).toBe(2);
    expect(await reserve(d, 'abc')).toBe(1);
    expect(await runCli(['ledger', 'reserve', '--course', d, '--usd', '0.1', '--quota', '0'], studioCommands)).toBe(1);
  });
});
