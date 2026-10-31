import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { BudgetExceededError, ValidationError } from '../errors.js';
import type { Manifest } from '../manifest/io.js';

const LedgerEntrySchema = z.object({
  at: z.string(),
  assetId: z.string(),
  provider: z.string(),
  model: z.string().optional(),
  estimateUsd: z.number(),
  actualUsd: z.number(),
  quotaUnits: z.number(),
});
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

const DIR = '.course';
const FILE = 'cost-ledger.jsonl';

export function readLedger(courseDir: string): LedgerEntry[] {
  const f = join(courseDir, DIR, FILE);
  if (!existsSync(f)) return [];
  const out: LedgerEntry[] = [];
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    let raw: unknown;
    try { raw = JSON.parse(line); }
    catch { throw new ValidationError(`damaged ledger ${f} line ${i + 1}: not valid JSON`); }
    const r = LedgerEntrySchema.safeParse(raw);
    if (!r.success) {
      throw new ValidationError(`damaged ledger ${f} line ${i + 1}: ${r.error.issues.map((x) => `${x.path.join('.') || '(root)'}: ${x.message}`).join('; ')}`);
    }
    out.push(r.data);
  });
  return out;
}

export function ledgerTotals(courseDir: string): { spentUsd: number; quotaUsed: number } {
  let micro = 0;
  let quotaUsed = 0;
  for (const e of readLedger(courseDir)) {
    micro += Math.round(e.actualUsd * 1e6);
    quotaUsed += e.quotaUnits;
  }
  return { spentUsd: micro / 1e6, quotaUsed };
}

const cents = (usd: number): number => Math.round(usd * 100);
const usd2 = (usd: number): string => usd.toFixed(2);

export function checkBudget(
  m: Manifest, totals: { spentUsd: number; quotaUsed: number }, request: { usd: number; quota: number },
): void {
  const cap = m.media.budgetUsd;
  if (cents(totals.spentUsd) + cents(request.usd) > cents(cap)) {
    throw new BudgetExceededError(`Budget exceeded: cap $${usd2(cap)}, spent $${usd2(totals.spentUsd)}, request $${usd2(request.usd)}`);
  }
  const maxQ = m.media.maxPlanImages;
  if (totals.quotaUsed + request.quota > maxQ) {
    throw new BudgetExceededError(`Plan image cap exceeded: cap ${maxQ}, used ${totals.quotaUsed}, request ${request.quota}`);
  }
}

export function recordSpend(courseDir: string, e: LedgerEntry): void {
  const r = LedgerEntrySchema.safeParse(e);
  if (!r.success) {
    throw new ValidationError(`invalid ledger entry: ${r.error.issues.map((x) => `${x.path.join('.') || '(root)'}: ${x.message}`).join('; ')}`);
  }
  mkdirSync(join(courseDir, DIR), { recursive: true });
  appendFileSync(join(courseDir, DIR, FILE), JSON.stringify(r.data) + '\n');
}
