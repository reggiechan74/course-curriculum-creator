import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { ValidationError } from '../src/errors.js';
import { addAsset, loadRegistry, saveRegistry, setStatus } from '../src/media/registry.js';
import type { Asset, Registry } from '../src/media/schema.js';

const asset = (o: Partial<Asset> = {}): Asset => ({
  id: 'A-M1-01', kind: 'diagram', objectives: ['O1'], module: 'M1', provider: 'mermaid', files: ['a.svg'],
  alt: 'A flow', status: 'generated', costUsd: 0, quotaUnits: 0, createdAt: '2026-10-31', ...o,
});
const reg = (...a: Asset[]): Registry => ({ schema: 'registry/v1', assets: a });

test('load returns empty registry when absent; save/load round trips', () => {
  const d = mkdtempSync(join(tmpdir(), 'reg '));
  expect(loadRegistry(d)).toEqual(reg());
  const r = addAsset(reg(), asset());
  saveRegistry(d, r);
  expect(loadRegistry(d)).toEqual(r);
});
test('duplicate id is rejected', () => {
  expect(() => addAsset(reg(asset()), asset())).toThrow(ValidationError);
});
test('approved needs alt text and user approval', () => {
  expect(() => setStatus(reg(asset({ alt: '' })), 'A-M1-01', 'approved', { approvedBy: 'user' })).toThrow(ValidationError);
  expect(() => setStatus(reg(asset()), 'A-M1-01', 'approved')).toThrow(ValidationError);
  const r = setStatus(reg(asset()), 'A-M1-01', 'approved', { approvedBy: 'user' });
  expect(r.assets[0]).toMatchObject({ status: 'approved', approvedBy: 'user' });
});
test('stores review record', () => {
  const review = { checks: { 'no-stray-text': 'pass', factual: 'pass', representation: 'n/a', style: 'pass', contrast: 'pass', physical: 'n/a' } as const, at: '2026-10-31' };
  expect(setStatus(reg(asset()), 'A-M1-01', 'rejected', { review }).assets[0].review).toEqual(review);
});
test('transitions', () => {
  expect(() => setStatus(reg(asset()), 'A-M1-01', 'imported')).toThrow(ValidationError);
  expect(setStatus(reg(asset({ status: 'rejected' })), 'A-M1-01', 'generated').assets[0].status).toBe('generated');
  expect(() => setStatus(reg(asset({ status: 'rejected' })), 'A-M1-01', 'approved', { approvedBy: 'user' })).toThrow();
  expect(setStatus(reg(asset({ status: 'imported' })), 'A-M1-01', 'approved', { approvedBy: 'user' }).assets[0].status).toBe('approved');
  expect(() => setStatus(reg(asset({ status: 'approved' })), 'A-M1-01', 'rejected')).toThrow();
  expect(() => setStatus(reg(), 'nope', 'rejected')).toThrow(ValidationError);
});
test('an asset cannot be added already approved', () => {
  expect(() => addAsset(reg(), asset({ status: 'approved', approvedBy: 'user' }))).toThrow(/cannot be added as approved/);
  expect(() => addAsset(reg(), asset({ status: 'approved' }))).toThrow(ValidationError);
});
