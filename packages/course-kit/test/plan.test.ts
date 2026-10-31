import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { initManifest, type Manifest } from '../src/manifest/io.js';
import { loadPricing } from '../src/media/pricing.js';
import { estimatePlan, loadPlan, savePlan, validatePlan } from '../src/media/plan.js';
import type { Asset, MediaPlan, PlanItem, Pricing, Registry } from '../src/media/schema.js';

const m: Manifest = {
  ...initManifest({ title: 'T', shape: 'workshop', delivery: 'virtual', sessions: [], audienceLevel: 'x', audienceSummary: 'y', budgetUsd: 20, maxPlanImages: 40 }, '2026-10-31'),
  objectives: [{ id: 'O1', title: 'o', kind: 'cognitive' }],
  modules: ['M1', 'M2', 'M3', 'M4'].map((id) => ({ id, title: id, objectives: ['O1'] })),
};
const item = (o: Partial<PlanItem> = {}): PlanItem => ({
  id: 'P1', module: 'M1', objectives: ['O1'], function: 'process-flow', kind: 'diagram', description: 'd',
  provider: 'mermaid', estimateUsd: 0, quotaUnits: 0, status: 'proposed', ...o,
});
const plan = (...items: PlanItem[]): MediaPlan => ({ schema: 'media-plan/v1', items });
const emptyReg: Registry = { schema: 'registry/v1', assets: [] };
const pricing: Pricing = { asOf: 'x', image: { 'openai:gpt-image-2': { draft: 0.01, standard: 0.05, high: 0.2 } } };

test('a process-flow item with kind image is an error', () => {
  expect(validatePlan(plan(item({ kind: 'image' })), m, emptyReg))
    .toContainEqual(expect.objectContaining({ level: 'error', path: 'items[0].kind' }));
});
test('an item with no objectives is an error', () => {
  expect(validatePlan(plan(item({ objectives: [] })), m, emptyReg))
    .toContainEqual(expect.objectContaining({ level: 'error', path: 'items[0].objectives' }));
});
test('unknown objective, module and duplicate ids are errors', () => {
  const issues = validatePlan(plan(item({ objectives: ['O9'], module: 'M9' }), item()), m, emptyReg);
  expect(issues.filter((i) => i.level === 'error').map((i) => i.path))
    .toEqual(expect.arrayContaining(['items[0].objectives[0]', 'items[0].module', 'items[1].id']));
});
test('an asset that refers to a deleted module or objective is an error', () => {
  const a = { id: 'A', kind: 'image', objectives: ['O7'], module: 'M9', provider: 'x', files: [], alt: '', status: 'generated', costUsd: 0, quotaUnits: 0, createdAt: 'x' } as Asset;
  const issues = validatePlan(plan(), m, { schema: 'registry/v1', assets: [a] });
  expect(issues).toContainEqual(expect.objectContaining({ level: 'error', path: 'assets[0].module' }));
  expect(issues).toContainEqual(expect.objectContaining({ level: 'error', path: 'assets[0].objectives[0]' }));
});
test('a module with no items gives the UDL warning', () => {
  const issues = validatePlan(plan(item()), m, emptyReg);
  expect(issues).toContainEqual({ level: 'warning', path: 'modules[1]', message: 'Module M2 has text only. UDL needs 2 or more representation modes.' });
  expect(issues.some((i) => i.message.startsWith('Module M1 '))).toBe(false);
});
test('rejected items do not count as coverage', () => {
  expect(validatePlan(plan(item({ status: 'rejected' })), m, emptyReg).some((i) => i.message.startsWith('Module M1 '))).toBe(true);
});
test('estimatePlan sums usd for each module and quota units', () => {
  const oa = (id: string) => item({ id, provider: 'openai', kind: 'image', function: 'scenario-illustration' });
  const p = plan(oa('a'), oa('b'), item({ id: 'c', module: 'M2', provider: 'codex', kind: 'image', function: 'scenario-illustration', quotaUnits: 1 }),
    oa('r') && { ...oa('r'), status: 'rejected' });
  expect(estimatePlan(p, pricing, 'standard')).toEqual({
    perModule: { M1: { usd: 0.1, quota: 0 }, M2: { usd: 0, quota: 1 } }, totalUsd: 0.1, totalQuota: 1 });
});
test('estimate avoids float drift', () => {
  const p = plan(...Array.from({ length: 3 }, (_, i) => item({ id: `x${i}`, provider: 'openai', kind: 'image', function: 'infographic' })));
  expect(estimatePlan(p, { asOf: 'x', image: { 'openai:gpt-image-2': { draft: 0.1, standard: 0.1, high: 0.1 } } }, 'draft').totalUsd).toBe(0.3);
});
test('loadPricing: bundled, and dataDir override', () => {
  expect(loadPricing().image['openai:gpt-image-2'].standard).toBeGreaterThan(0);
  const d = mkdtempSync(join(tmpdir(), 'pr '));
  writeFileSync(join(d, 'pricing.json'), JSON.stringify(pricing));
  expect(loadPricing(d)).toEqual(pricing);
});
test('plan save/load round trip; absent plan is empty', () => {
  const d = mkdtempSync(join(tmpdir(), 'pl '));
  expect(loadPlan(d).items).toEqual([]);
  savePlan(d, plan(item()));
  expect(loadPlan(d)).toEqual(plan(item()));
});
