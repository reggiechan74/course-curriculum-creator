import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProviderUnavailableError, ValidationError } from '../errors.js';
import { loadManifest } from '../manifest/io.js';
import { releaseSpend, reserveSpend, settleSpend } from '../media/ledger.js';
import { loadPlan } from '../media/plan.js';
import { loadPricing } from '../media/pricing.js';
import { addAsset, loadRegistry, saveRegistry } from '../media/registry.js';
import type { Asset } from '../media/schema.js';
import { generateImageCodex } from './codex.js';
import { generateImageOpenAI, type ImageQuality, openaiPrice, possiblyBilled, resolveOpenAIKey } from './openai.js';
import { composeImagePrompt } from './prompt.js';

export type ImageProvider = 'codex' | 'openai';
export const IMAGE_PROVIDERS: readonly ImageProvider[] = ['codex', 'openai'];
export const IMAGE_QUALITIES: readonly ImageQuality[] = ['draft', 'standard', 'high'];

/** Asset ids become file names; keep them to one safe path segment. */
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** The single entry point for CLI and MCP. Refuses (budget, status) before any network call or spawn. */
export async function generateAssetImage(courseDir: string, assetId: string, provider: ImageProvider, o: {
  quality: ImageQuality; dataDir?: string; env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; codexBin?: string;
}): Promise<Asset> {
  if (!SAFE_ID.test(assetId)) throw new ValidationError(`invalid asset id ${JSON.stringify(assetId)}`);
  if (!IMAGE_PROVIDERS.includes(provider)) throw new ValidationError(`unknown image provider ${provider}`);
  if (!IMAGE_QUALITIES.includes(o.quality)) throw new ValidationError(`unknown quality ${o.quality}`);
  const manifest = loadManifest(courseDir);

  // 1. The plan item must be an approved image.
  const item = loadPlan(courseDir).items.find((it) => it.id === assetId);
  if (!item) throw new ValidationError(`No plan item ${assetId} in 05-media/media-plan.yaml`);
  if (item.status !== 'approved') throw new ValidationError(`Plan item ${assetId} is ${item.status}; approve it in the media plan first`);
  if (item.kind !== 'image') throw new ValidationError(`Plan item ${assetId} has kind ${item.kind}; only kind image can be generated as an image`);
  const registry = loadRegistry(courseDir);
  const prior = registry.assets.find((a) => a.id === assetId);
  if (prior && (prior.status === 'approved' || prior.status === 'imported')) {
    throw new ValidationError(`Asset ${assetId} is ${prior.status}; reject it first to regenerate (registry status ${assetId} rejected)`);
  }

  // 2. Prompt anchors from the style guide.
  const anchorsFile = join(courseDir, '05-media', 'style', 'prompt-anchors.md');
  if (!existsSync(anchorsFile)) throw new ValidationError('Run generate-style-guide first.');
  const anchors = readFileSync(anchorsFile, 'utf8');

  // 3. Compose and save the prompt.
  const prompt = composeImagePrompt(anchors, item.description);
  const source = `05-media/src/${assetId}.prompt.txt`;
  mkdirSync(join(courseDir, '05-media', 'src'), { recursive: true });
  writeFileSync(join(courseDir, source), prompt);

  // 4. Budget check with the estimate: check and reserve atomically under the ledger lock,
  //    so parallel CLI/MCP calls cannot together pass the cap.
  const pricing = provider === 'openai' ? loadPricing(o.dataDir) : undefined;
  const estimate = pricing ? { usd: openaiPrice(pricing, o.quality), quota: 0 } : { usd: 0, quota: 1 };
  const reservationId = await reserveSpend(courseDir, manifest, {
    assetId, provider, ...(pricing ? { model: 'gpt-image-2' } : {}), estimateUsd: estimate.usd, quotaUnits: estimate.quota,
  });

  // 5. Generate. On failure release the reservation, unless the provider may have billed.
  const file = `05-media/out/${assetId}.png`;
  const outPath = join(courseDir, file);
  let model: string | undefined;
  try {
    if (provider === 'openai') {
      const apiKey = resolveOpenAIKey(o.env ?? process.env, o.dataDir);
      if (!apiKey) throw new ProviderUnavailableError('OpenAI API key not configured: set COURSE_MEDIA_OPENAI_KEY or OPENAI_API_KEY, or write <data-dir>/openai.key');
      model = (await generateImageOpenAI({ prompt, outPath, quality: o.quality, apiKey, fetchImpl: o.fetchImpl, pricing })).model;
    } else {
      await generateImageCodex({ prompt, outPath, codexBin: o.codexBin });
    }
  } catch (e) {
    if (possiblyBilled(e)) settleSpend(courseDir, reservationId);
    else releaseSpend(courseDir, reservationId);
    throw e;
  }

  // 6. Record spend (settle the reservation), then add or replace the asset.
  settleSpend(courseDir, reservationId, { actualUsd: estimate.usd, ...(model ? { model } : {}) });
  const asset: Asset = {
    id: assetId, kind: 'image', function: item.function, objectives: item.objectives, module: item.module, provider,
    source, files: [file], alt: '', status: 'generated', costUsd: estimate.usd, quotaUnits: estimate.quota,
    sha256: createHash('sha256').update(readFileSync(outPath)).digest('hex'), createdAt: new Date().toISOString(),
  };
  const rest = { ...registry, assets: registry.assets.filter((a) => a.id !== assetId) };
  saveRegistry(courseDir, addAsset(rest, asset));
  return asset;
}
