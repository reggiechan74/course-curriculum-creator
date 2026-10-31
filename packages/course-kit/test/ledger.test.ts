import { appendFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { BudgetExceededError, ValidationError } from '../src/errors.js';
import type { Manifest } from '../src/manifest/io.js';
import { checkBudget, type LedgerEntry, ledgerTotals, readLedger, recordSpend } from '../src/media/ledger.js';

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
