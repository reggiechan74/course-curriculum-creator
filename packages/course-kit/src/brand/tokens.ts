import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { ValidationError } from '../errors.js';
import type { ValidationIssue } from '../manifest/schema.js';
import { type Brand, BrandSchema } from './schema.js';

export type { Brand } from './schema.js';

export interface Tokens {
  color: { bg: string; fg: string; primary: string; primaryFg: string; accent: string; muted: string };
  font: { heading: string; body: string; mono: string };
  space: number[];
  radius: number;
}

export function loadBrand(path: string): Brand {
  let raw: unknown;
  try {
    raw = parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new ValidationError(`cannot read brand file ${path}: ${e instanceof Error ? e.message : String(e)}`);
  }
  const r = BrandSchema.safeParse(raw);
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new ValidationError(`invalid brand file ${path}: ${msg}`);
  }
  return r.data;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, always >= 1. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const WHITE = '#ffffff';
const NEAR_BLACK = '#1a1a1a';

export function deriveTokens(b: Brand): Tokens {
  const neutral = b.colors.neutral ?? [];
  const bg = WHITE;
  const darkest = neutral.length
    ? neutral.reduce((m, c) => (luminance(c) < luminance(m) ? c : m))
    : NEAR_BLACK;
  const primary = b.colors.primary;
  const primaryFg = contrastRatio(WHITE, primary) >= contrastRatio(NEAR_BLACK, primary) ? WHITE : NEAR_BLACK;
  return {
    color: {
      bg,
      fg: darkest,
      primary,
      primaryFg,
      accent: b.colors.secondary ?? primary,
      muted: neutral.find((c) => contrastRatio(c, bg) >= 3) ?? '#6b6b6b',
    },
    font: { heading: b.fonts.heading, body: b.fonts.body, mono: b.fonts.mono ?? 'ui-monospace, monospace' },
    space: [4, 8, 12, 16, 24, 32, 48],
    radius: 6,
  };
}

export function checkTokens(t: Tokens): ValidationIssue[] {
  const checks: [string, string, string, number, string][] = [
    ['color.fg', t.color.fg, t.color.bg, 4.5, 'text on background'],
    ['color.primaryFg', t.color.primaryFg, t.color.primary, 4.5, 'text on primary'],
    ['color.accent', t.color.accent, t.color.bg, 3, 'accent on background'],
  ];
  const out: ValidationIssue[] = [];
  for (const [path, a, b, min, what] of checks) {
    const ratio = contrastRatio(a, b);
    if (ratio < min) {
      out.push({
        level: 'error', path,
        message: `${what} contrast ${ratio.toFixed(2)}:1 is below the required minimum ${min}:1 (${a} on ${b})`,
      });
    }
  }
  return out;
}
