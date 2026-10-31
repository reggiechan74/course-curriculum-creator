import { dirname, relative, resolve, sep } from 'node:path';
import type { Tokens } from '../brand/tokens.js';

export interface Label { text: string; x: number; y: number; anchor?: 'start' | 'middle' | 'end' }

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function buildLabelOverlay(
  imageHref: string, width: number, height: number, labels: Label[], tokens: { color?: Partial<Tokens['color']>; font?: Partial<Tokens['font']> } = {},
): string {
  const fill = tokens.color?.fg ?? '#1a1a1a';
  const family = tokens.font?.body ?? 'sans-serif';
  const texts = labels.map((l) =>
    `  <text x="${esc(String(l.x))}" y="${esc(String(l.y))}" text-anchor="${esc(l.anchor ?? 'start')}" fill="${esc(fill)}" font-family="${esc(family)}">${esc(l.text)}</text>`);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `  <image href="${esc(imageHref)}" width="${width}" height="${height}"/>`,
    ...texts,
    '</svg>',
    '',
  ].join('\n');
}

/** The `<image href>` for an overlay: the image path relative to the overlay file's folder, URL-encoded per segment. */
export function overlayHref(imagePath: string, overlayPath: string): string {
  return relative(dirname(resolve(overlayPath)), resolve(imagePath)).split(sep).map(encodeURIComponent).join('/');
}
