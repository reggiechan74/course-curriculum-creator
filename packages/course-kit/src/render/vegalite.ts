import { writeFileSync } from 'node:fs';
import * as vega from 'vega';
import { compile, type TopLevelSpec } from 'vega-lite';
import type { Tokens } from '../brand/tokens.js';

type PartialTokens = { color?: Partial<Tokens['color']>; font?: Partial<Tokens['font']> };

export async function renderVegaLite(spec: object, outSvg: string, tokens: PartialTokens = {}): Promise<void> {
  const c = tokens.color ?? {};
  const config: Record<string, unknown> = {
    ...(c.bg ? { background: c.bg } : {}),
    ...(c.primary ? { range: { category: [c.primary, c.accent, c.muted].filter(Boolean) }, mark: { color: c.primary } } : {}),
    ...(c.fg ? { axis: { labelColor: c.fg, titleColor: c.fg, domainColor: c.fg, tickColor: c.fg }, title: { color: c.fg }, legend: { labelColor: c.fg, titleColor: c.fg } } : {}),
    ...(tokens.font?.body ? { font: tokens.font.body } : {}),
  };
  const vl = compile({ ...(spec as TopLevelSpec), config: { ...config, ...((spec as { config?: object }).config ?? {}) } } as TopLevelSpec);
  const view = new vega.View(vega.parse(vl.spec), { renderer: 'none' });
  writeFileSync(outSvg, await view.toSVG());
}
