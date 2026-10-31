import { readFileSync } from 'node:fs';
import { ValidationError } from '../errors.js';
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

/** Image types an overlay can embed, detected from the file's first bytes (not its name). */
const SIGNATURES: { mime: string; test: (b: Buffer) => boolean }[] = [
  { mime: 'image/png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/webp', test: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  { mime: 'image/gif', test: (b) => b.toString('ascii', 0, 4) === 'GIF8' },
];

export interface EmbeddedImage { href: string; width?: number; height?: number }

/**
 * The picture as a `data:` URI. Markdown viewers show an SVG as an image, and in that mode a browser
 * will not load a separate file the SVG points to, so the picture must live inside the overlay.
 * PNG width and height come from the IHDR header so the overlay matches the picture by default.
 */
export function embeddedImage(imagePath: string): EmbeddedImage {
  let bytes: Buffer;
  try { bytes = readFileSync(imagePath); } catch { throw new ValidationError(`image not found: ${imagePath}`); }
  const kind = SIGNATURES.find((s) => s.test(bytes));
  if (!kind) throw new ValidationError(`not a PNG, JPEG, WebP or GIF image: ${imagePath}`);
  const href = `data:${kind.mime};base64,${bytes.toString('base64')}`;
  if (kind.mime === 'image/png' && bytes.length >= 24) {
    return { href, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  return { href };
}
