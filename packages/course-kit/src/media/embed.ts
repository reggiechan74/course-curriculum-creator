import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { ValidationError } from '../errors.js';
import { keepFresh } from '../hash.js';
import { loadPlan } from './plan.js';
import { loadRegistry } from './registry.js';
import type { Asset, PlanItem } from './schema.js';

export const EMBED_FILES = [
  ['02-design', 'lesson-plans.md'],
  ['04-materials', 'student-handout.md'],
  ['04-materials', 'instructor-guide.md'],
] as const;

const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const oneLine = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** An Asset has `files`; a PlanItem does not (both can have status "approved"). */
function isApprovedAsset(x: Asset | PlanItem): x is Asset {
  return 'files' in x && x.status === 'approved';
}

function pendingText(x: Asset | PlanItem): string {
  if ('description' in x && x.description) return oneLine(x.description);
  const a = x as Asset;
  return oneLine(a.caption || a.alt || a.id);
}

function buildBlock(x: Asset | PlanItem, relPath: string): string {
  const open = `<!-- media:${x.id} -->`;
  const close = `<!-- /media:${x.id} -->`;
  if (!isApprovedAsset(x)) {
    return `${open}\n> **Media pending approval (${x.id}):** ${pendingText(x)}\n${close}`;
  }
  const lines = [open, `![${oneLine(x.alt)}](${relPath.replace(/ /g, '%20')})`];
  if (x.caption?.trim()) lines.push('', `*${oneLine(x.caption)}*`);
  if (x.longDescription?.trim()) {
    lines.push('', '<details><summary>Description</summary>', '', x.longDescription.trim(), '', '</details>');
  }
  lines.push(close);
  return lines.join('\n');
}

const anchorRe = (id: string): RegExp => new RegExp(`^<!-- id: ${esc(id)} -->[ \\t]*$`, 'm');

export function hasAnchor(markdown: string, anchorId: string): boolean {
  return anchorRe(anchorId).test(markdown.replace(/\r\n/g, '\n'));
}

export function embedAsset(markdown: string, asset: Asset | PlanItem, anchorId: string, relPath: string): string {
  const crlf = markdown.includes('\r\n');
  const md = markdown.replace(/\r\n/g, '\n');
  const m = anchorRe(anchorId).exec(md);
  if (!m) throw new ValidationError(`Anchor ${anchorId} not found`);
  const block = buildBlock(asset, relPath);
  const markers = new RegExp(`<!-- media:${esc(asset.id)} -->[\\s\\S]*?<!-- /media:${esc(asset.id)} -->`);
  let out: string;
  if (markers.test(md)) {
    out = md.replace(markers, () => block);
  } else {
    const end = m.index + m[0].length;
    const rest = md.slice(end).replace(/^\n+/, '');
    out = md.slice(0, end) + '\n\n' + block + '\n' + (rest ? '\n' + rest : '');
  }
  return crlf ? out.replace(/\n/g, '\r\n') : out;
}

export type EmbedReport = { file: string; embedded: string[]; placeholders: string[] };

export function embedAll(courseDir: string): EmbedReport[] {
  const plan = loadPlan(courseDir);
  const registry = loadRegistry(courseDir);
  const byId = new Map(registry.assets.map((a) => [a.id, a]));
  const planIds = new Set(plan.items.map((i) => i.id));

  const work: { id: string; module: string; item: Asset | PlanItem; files0?: string }[] = [];
  for (const it of plan.items) {
    if (it.status !== 'approved') continue;
    const a = byId.get(it.id);
    // Approved asset wins; otherwise the plan item (it carries the description for the placeholder).
    const chosen: Asset | PlanItem = a && a.status === 'approved' ? a : it;
    work.push({ id: it.id, module: it.module, item: chosen, files0: a?.files[0] });
  }
  for (const a of registry.assets) {
    if (planIds.has(a.id) || !a.module) continue;
    if (a.status !== 'approved' && a.status !== 'imported') continue;
    work.push({ id: a.id, module: a.module, item: a, files0: a.files[0] });
  }

  const reports: EmbedReport[] = [];
  keepFresh(courseDir, () => {
    for (const parts of EMBED_FILES) {
      const file = join(courseDir, ...parts);
      if (!existsSync(file)) continue;
      const original = readFileSync(file, 'utf8');
      let text = original;
      const report: EmbedReport = { file: parts.join('/'), embedded: [], placeholders: [] };
      for (const w of work) {
        if (!hasAnchor(text, w.module)) continue;
        const rel = w.files0 ? relative(dirname(file), join(courseDir, w.files0)).split(sep).join('/') : '';
        const item = isApprovedAsset(w.item) && !rel ? ({ ...w.item, status: 'generated' } as Asset) : w.item;
        text = embedAsset(text, item, w.module, rel);
        (isApprovedAsset(item) ? report.embedded : report.placeholders).push(w.id);
      }
      if (text !== original) writeFileSync(file, text);
      reports.push(report);
    }
  });
  return reports;
}

/** Embed one item into one file; used by the `embed` CLI command. */
export function embedOne(courseDir: string, file: string, id: string, anchorId: string): { embedded: boolean } {
  const a = loadRegistry(courseDir).assets.find((x) => x.id === id);
  const p = loadPlan(courseDir).items.find((x) => x.id === id);
  const item: Asset | PlanItem | undefined = a && a.status === 'approved' ? a : (p ?? a);
  if (!item) throw new ValidationError(`unknown asset or plan item ${id}`);
  if (!existsSync(file)) throw new ValidationError(`file not found: ${file}`);
  const first = a?.files[0];
  const rel = first ? relative(dirname(file), join(courseDir, first)).split(sep).join('/') : '';
  const original = readFileSync(file, 'utf8');
  const out = embedAsset(original, item, anchorId, rel);
  if (out !== original) keepFresh(courseDir, () => writeFileSync(file, out));
  return { embedded: isApprovedAsset(item) };
}
