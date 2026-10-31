import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { ValidationError } from '../errors.js';
import {
  type Manifest, type ObjectiveKind, type Session, type ValidationIssue,
  initManifest, loadManifest, saveManifest, validateManifest,
} from './io.js';

export interface ParsedObjective { id: string; title: string; kind: ObjectiveKind; bloom?: string; line: number }
export interface ParsedSession { id: string; label: string; minutes: number }
export interface ParsedModule { id: string; title: string; session?: string; objectives: string[]; minutes?: number; line: number }

const OBJECTIVES_PATH = '01-planning/learning-objectives.md';
const OUTLINE_PATH = '02-design/course-outline.md';
const ID_COMMENT = /^<!-- id: [^>]*? -->\r?$/;

/** An ID comment line is one that directly follows a heading line. */
function markedComments(lines: string[]): boolean[] {
  return lines.map((l, i) => i > 0 && /^#{1,6}\s/.test(lines[i - 1]) && ID_COMMENT.test(l));
}

/** Lines without ID comments; `line` numbers are 1-based indexes into this list. */
function logicalLines(markdown: string): string[] {
  const lines = markdown.split('\n');
  const marked = markedComments(lines);
  return lines.filter((_, i) => !marked[i]).map((l) => l.replace(/\r$/, ''));
}

export function parseObjectives(markdown: string): ParsedObjective[] {
  const out: ParsedObjective[] = [];
  let current: ParsedObjective | undefined;
  logicalLines(markdown).forEach((text, i) => {
    const line = i + 1;
    let m: RegExpMatchArray | null;
    if ((m = text.match(/^###\s+Affective Objective\s+([A-Za-z0-9]+)\s*:\s*(.*?)\s*$/))) {
      out.push(current = { id: `LO-${m[1]}`, title: m[2], kind: 'affective', line });
    } else if ((m = text.match(/^###\s+Objective\s+(\d+)\s*:\s*(.*?)\s*$/))) {
      out.push(current = { id: `LO-${m[1]}`, title: m[2], kind: 'cognitive', line });
    } else if ((m = text.match(/^##\s+Level\s+0\s*:\s*(.*?)\s*$/))) {
      out.push(current = { id: 'LO-0', title: m[1], kind: 'orientation', line });
    } else if (/^#{1,6}\s/.test(text)) {
      current = undefined;
    } else if (current && current.bloom === undefined && (m = text.match(/^\*\*Cognitive Level:\*\*\s*([A-Za-z]+)/))) {
      current.bloom = m[1].toLowerCase();
    }
  });
  return out;
}

function lastMinutes(heading: string): number | undefined {
  const all = [...heading.matchAll(/(\d+)\s*min\b/g)];
  return all.length ? Number(all[all.length - 1][1]) : undefined;
}

export function parseOutline(markdown: string): { sessions: ParsedSession[]; modules: ParsedModule[] } {
  const sessions: ParsedSession[] = [];
  const modules: ParsedModule[] = [];
  let session: ParsedSession | undefined;
  let module: ParsedModule | undefined;
  logicalLines(markdown).forEach((text, i) => {
    let m: RegExpMatchArray | null;
    if (/^##\s/.test(text)) {
      module = undefined;
      const label = text.replace(/^##\s+/, '').trim();
      if (/\bDay\s+(\d+)\b/.test(label) && !/Schedule Summary/i.test(label)) {
        const n = label.match(/\bDay\s+(\d+)\b/)![1];
        sessions.push(session = { id: `S${n}`, label, minutes: 0 });
      } else {
        session = undefined;
      }
    } else if (/^###\s/.test(text)) {
      module = undefined;
      if (session && text.includes('(')) session.minutes += lastMinutes(text) ?? 0;
      if ((m = text.match(/^###\s+Module\s+(\d+)\s*:\s*(.*?)\s*$/))) {
        const rest = m[2];
        const paren = rest.lastIndexOf(' (');
        modules.push(module = {
          id: `M${m[1]}`, title: paren >= 0 ? rest.slice(0, paren).trim() : rest,
          ...(session ? { session: session.id } : {}), objectives: [],
          ...(lastMinutes(text) !== undefined ? { minutes: lastMinutes(text) } : {}), line: i + 1,
        });
      }
    } else if (module) {
      for (const r of text.matchAll(/\bObj(?:ective)?s?\s+(\d+)/g)) {
        const id = `LO-${r[1]}`;
        if (!module.objectives.includes(id)) module.objectives.push(id);
      }
    }
  });
  return { sessions, modules };
}

/** Puts `<!-- id: X -->` on the line after each item's heading. Idempotent; `line` is as parsed (ID comments do not count). */
export function insertIdComments(markdown: string, items: { id: string; line: number }[]): string {
  const lines = markdown.split('\n');
  const marked = markedComments(lines);
  const logical: number[] = [];
  lines.forEach((_, i) => { if (!marked[i]) logical.push(i); });
  const result: string[] = [];
  const byIndex = new Map<number, string>();
  for (const it of items) {
    const idx = logical[it.line - 1];
    if (idx !== undefined) byIndex.set(idx, it.id);
  }
  lines.forEach((l, i) => {
    if (marked[i] && byIndex.has(i - 1)) return; // replaced below
    result.push(l);
    const id = byIndex.get(i);
    if (id !== undefined) result.push(`<!-- id: ${id} -->${l.endsWith('\r') ? '\r' : ''}`);
  });
  return result.join('\n');
}

function readIfExists(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

export function syncManifest(courseDir: string, opts: { write: boolean }): { manifest: Manifest; issues: ValidationIssue[] } {
  const objPath = join(courseDir, OBJECTIVES_PATH);
  const outPath = join(courseDir, OUTLINE_PATH);
  const objMd = readIfExists(objPath);
  const outMd = readIfExists(outPath);
  if (objMd === undefined && outMd === undefined) {
    throw new ValidationError(`neither ${OBJECTIVES_PATH} nor ${OUTLINE_PATH} found in ${courseDir}`);
  }
  const objectives = parseObjectives(objMd ?? '');
  const { sessions: parsedSessions, modules } = parseOutline(outMd ?? '');
  const sessions: Session[] = parsedSessions;

  let manifest: Manifest;
  if (existsSync(join(courseDir, 'course.yaml'))) {
    manifest = loadManifest(courseDir);
    if (sessions.length > 0) manifest.timeBudget = { ...manifest.timeBudget, live: { sessions } };
  } else {
    const title = objMd?.match(/^##\s+Course:\s*(.+?)\s*\r?$/m)?.[1] ?? basename(resolve(courseDir));
    manifest = initManifest({
      title, shape: sessions.length > 2 ? 'cohort' : 'workshop', delivery: 'in-person', sessions,
      audienceLevel: 'professional', audienceSummary: '', budgetUsd: 20, maxPlanImages: 40,
    }, new Date().toISOString().slice(0, 10));
  }
  manifest.objectives = objectives.map(({ id, title, kind, bloom }) => ({ id, title, kind, ...(bloom ? { bloom } : {}) }));
  manifest.modules = modules.map(({ id, title, session, objectives: objs, minutes }) => ({
    id, title, ...(session ? { session } : {}), objectives: objs, ...(minutes !== undefined ? { minutes } : {}),
  }));

  const issues: ValidationIssue[] = validateManifest(manifest).map((i) => {
    const m = i.path.match(/^modules\[(\d+)\]\.objectives\[\d+\]$/);
    if (!m) return i;
    const mod = manifest.modules[Number(m[1])];
    return { ...i, message: `module ${mod.id} (${mod.title}) refers to ${i.message}` };
  });
  manifest.modules.forEach((mod, i) => {
    if (mod.objectives.length === 0) {
      issues.push({ level: 'warning', path: `modules[${i}].objectives`, message: `module ${mod.id} (${mod.title}) is not linked to any objective` });
    }
  });

  if (opts.write) {
    saveManifest(courseDir, manifest);
    if (objMd !== undefined) writeFileSync(objPath, insertIdComments(objMd, objectives));
    if (outMd !== undefined) writeFileSync(outPath, insertIdComments(outMd, modules));
  }
  return { manifest, issues };
}
