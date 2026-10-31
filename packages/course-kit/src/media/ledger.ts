import { randomUUID } from 'node:crypto';
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { BudgetExceededError, ValidationError } from '../errors.js';
import type { Manifest } from '../manifest/io.js';

const LedgerEntrySchema = z.object({
  at: z.string(),
  assetId: z.string(),
  provider: z.string(),
  model: z.string().optional(),
  estimateUsd: z.number().nonnegative().finite(),
  actualUsd: z.number().nonnegative().finite(),
  quotaUnits: z.number().nonnegative().finite(),
  /** Absent = 'record' (a completed spend). reserve/settle/release share a reservationId. */
  kind: z.enum(['record', 'reserve', 'settle', 'release']).optional(),
  reservationId: z.string().optional(),
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

/**
 * Sums completed spend plus open reservations. A settled reservation counts its settled amount;
 * a released one counts nothing; an open one counts its reserved estimate.
 */
export function ledgerTotals(courseDir: string): { spentUsd: number; quotaUsed: number } {
  let micro = 0;
  let quotaUsed = 0;
  const reservations = new Map<string, LedgerEntry | null>();
  for (const e of readLedger(courseDir)) {
    const kind = e.kind ?? 'record';
    if (kind === 'record' || !e.reservationId) {
      if (kind !== 'release') { micro += Math.round(e.actualUsd * 1e6); quotaUsed += e.quotaUnits; }
    } else if (kind === 'reserve') {
      if (!reservations.has(e.reservationId)) reservations.set(e.reservationId, e);
    } else {
      reservations.set(e.reservationId, kind === 'settle' ? e : null);
    }
  }
  for (const e of reservations.values()) {
    if (e) { micro += Math.round(e.actualUsd * 1e6); quotaUsed += e.quotaUnits; }
  }
  return { spentUsd: micro / 1e6, quotaUsed };
}

const cents = (usd: number): number => Math.round(usd * 100);
const usd2 = (usd: number): string => usd.toFixed(2);

export function checkBudget(
  m: Manifest, totals: { spentUsd: number; quotaUsed: number }, request: { usd: number; quota: number },
): void {
  for (const [k, v] of Object.entries(request)) {
    if (!Number.isFinite(v) || v < 0) throw new ValidationError(`invalid budget request: ${k} must be a nonnegative finite number`);
  }
  const cap = m.media.budgetUsd;
  if (cents(totals.spentUsd + request.usd) > cents(cap)) {
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

const LOCK = 'ledger.lock';
const LOCK_STALE_MS = 2 * 60_000;
const LOCK_WAIT_MS = 30_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Exclusive lock across processes: .course/ledger.lock created with O_EXCL; a lock older than 2 minutes is stale. */
async function withLedgerLock<T>(courseDir: string, fn: () => T): Promise<T> {
  mkdirSync(join(courseDir, DIR), { recursive: true });
  const lock = join(courseDir, DIR, LOCK);
  const deadline = Date.now() + LOCK_WAIT_MS;
  for (let attempt = 0; ; attempt++) {
    let fd: number;
    try {
      fd = openSync(lock, 'wx');
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
      try {
        if (Date.now() - statSync(lock).mtimeMs > LOCK_STALE_MS) { unlinkSync(lock); continue; }
      } catch { continue; /* lock vanished between open and stat */ }
      if (Date.now() > deadline) {
        throw new ValidationError(`cost ledger is locked (${lock}); if no generation is running, delete the lock file`);
      }
      await sleep(Math.min(20 + attempt * 10, 200));
      continue;
    }
    try { return fn(); }
    finally {
      closeSync(fd);
      try { unlinkSync(lock); } catch { /* already removed */ }
    }
  }
}

export type SpendRequest = { assetId: string; provider: string; model?: string; estimateUsd: number; quotaUnits: number };

/**
 * Atomically (under the ledger lock) checks the budget and appends a reservation for the estimate.
 * Throws BudgetExceededError with the checkBudget message. Returns the reservation id.
 */
export async function reserveSpend(courseDir: string, m: Manifest, req: SpendRequest): Promise<string> {
  return withLedgerLock(courseDir, () => {
    checkBudget(m, ledgerTotals(courseDir), { usd: req.estimateUsd, quota: req.quotaUnits });
    const reservationId = randomUUID();
    recordSpend(courseDir, {
      at: new Date().toISOString(), ...req, actualUsd: req.estimateUsd, kind: 'reserve', reservationId,
    });
    return reservationId;
  });
}

function reservation(courseDir: string, reservationId: string): LedgerEntry {
  const r = readLedger(courseDir).find((e) => e.kind === 'reserve' && e.reservationId === reservationId);
  if (!r) throw new ValidationError(`unknown ledger reservation ${reservationId}`);
  return r;
}

/** Marks a reservation as spent with the actual amount (defaults to the estimate). */
export function settleSpend(courseDir: string, reservationId: string, o: { actualUsd?: number; model?: string } = {}): void {
  const r = reservation(courseDir, reservationId);
  recordSpend(courseDir, {
    ...r, at: new Date().toISOString(), ...(o.model ? { model: o.model } : {}),
    actualUsd: o.actualUsd ?? r.estimateUsd, kind: 'settle', reservationId,
  });
}

/** Cancels a reservation: use only when the provider certainly did not bill. */
export function releaseSpend(courseDir: string, reservationId: string): void {
  const r = reservation(courseDir, reservationId);
  recordSpend(courseDir, { ...r, at: new Date().toISOString(), actualUsd: 0, quotaUnits: 0, kind: 'release', reservationId });
}
