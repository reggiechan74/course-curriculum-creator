import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ProviderUnavailableError, ValidationError } from '../errors.js';
import { loadPricing } from '../media/pricing.js';
import type { Pricing } from '../media/schema.js';

export type ImageQuality = 'draft' | 'standard' | 'high';

const ENDPOINT = 'https://api.openai.com/v1/images/generations';
const MODEL = 'gpt-image-2';
const API_QUALITY: Record<ImageQuality, 'low' | 'medium' | 'high'> = { draft: 'low', standard: 'medium', high: 'high' };
const TIMEOUT_MS = 5 * 60_000;

/** COURSE_MEDIA_OPENAI_KEY, then OPENAI_API_KEY, then <dataDir>/openai.key. Empty values are skipped. */
export function resolveOpenAIKey(env: NodeJS.ProcessEnv, dataDir?: string): string | null {
  for (const v of [env.COURSE_MEDIA_OPENAI_KEY, env.OPENAI_API_KEY]) {
    if (v && v.trim()) return v.trim();
  }
  if (dataDir) {
    const f = join(dataDir, 'openai.key');
    if (existsSync(f)) {
      const v = readFileSync(f, 'utf8').trim();
      if (v) return v;
    }
  }
  return null;
}

/** Network errors that happen before the request is sent: OpenAI cannot have billed. */
const PRE_SEND_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'ENETUNREACH']);

/** Set on errors raised after OpenAI may have billed the request (sent but outcome unknown, or 2xx without a usable image). */
export function possiblyBilled(e: unknown): boolean {
  return e instanceof Error && (e as { possiblyBilled?: boolean }).possiblyBilled === true;
}
function billed<E extends Error>(e: E): E {
  return Object.assign(e, { possiblyBilled: true });
}

function redact(text: string, key: string): string {
  return key ? text.split(key).join('[redacted]') : text;
}

export function openaiPrice(pricing: Pricing, quality: ImageQuality): number {
  const price = pricing.image[`openai:${MODEL}`]?.[quality];
  if (price === undefined) throw new ValidationError(`pricing has no entry for openai:${MODEL}`);
  return price;
}

export async function generateImageOpenAI(o: {
  prompt: string; outPath: string; quality: ImageQuality; apiKey: string; fetchImpl?: typeof fetch; pricing?: Pricing;
}): Promise<{ usd: number; model: string }> {
  const usd = openaiPrice(o.pricing ?? loadPricing(), o.quality);
  const doFetch = o.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${o.apiKey}` },
      body: JSON.stringify({ model: MODEL, prompt: o.prompt, size: '1024x1024', quality: API_QUALITY[o.quality], n: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const err = new ProviderUnavailableError(redact(`OpenAI request failed: ${e instanceof Error ? e.message : String(e)}`, o.apiKey));
    const code = (e as { cause?: { code?: unknown } })?.cause?.code;
    throw typeof code === 'string' && PRE_SEND_CODES.has(code) ? err : billed(err);
  }
  let text = '';
  try { text = await res.text(); }
  catch (e) {
    if (res.ok) throw billed(new ProviderUnavailableError(redact(`OpenAI response could not be read: ${e instanceof Error ? e.message : String(e)}`, o.apiKey)));
  }
  let body: { data?: { b64_json?: string }[]; error?: { message?: string } } = {};
  try { body = JSON.parse(text); } catch { /* non-JSON body */ }
  if (!res.ok) {
    const msg = redact(body.error?.message ?? (text.slice(0, 200) || res.statusText), o.apiKey);
    if (res.status === 400) throw new ValidationError(`OpenAI rejected the request (400): ${msg}`);
    throw new ProviderUnavailableError(`OpenAI image API unavailable (${res.status}): ${msg}`);
  }
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) throw billed(new ProviderUnavailableError('OpenAI response had no image data (data[0].b64_json); the request may have been billed'));
  try {
    mkdirSync(dirname(o.outPath), { recursive: true });
    writeFileSync(o.outPath, Buffer.from(b64, 'base64'));
  } catch (e) {
    throw billed(new ProviderUnavailableError(`cannot write ${o.outPath}: ${e instanceof Error ? e.message : String(e)}`));
  }
  return { usd, model: MODEL };
}
