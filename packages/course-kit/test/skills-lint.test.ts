import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../plugins/course-curriculum-creator');

// Paths (relative to the plugin root) that the rules below check. Later tasks append their folders here.
const LINTED = ['skills/course-conventions', 'skills/course-kit', 'workflow/0-analysis', 'workflow/1-desired-results', 'workflow/2-assessment-evidence', 'workflow/3-learning-plan', 'workflow/4-materials', 'workflow/5-quality-and-review', 'workflow/6-delivery', 'workflow/7-templates'];

const CONVENTIONS = 'skills/course-conventions/SKILL.md';

/** All .md files under a path, as plugin-relative paths with forward slashes. */
function mdFiles(rel: string): string[] {
  const abs = join(PLUGIN_ROOT, rel);
  if (!existsSync(abs)) return [];
  if (!statSync(abs).isDirectory()) return rel.endsWith('.md') ? [rel] : [];
  const out: string[] = [];
  for (const name of readdirSync(abs)) out.push(...mdFiles(`${rel}/${name}`));
  return out;
}

const allFiles = () => LINTED.flatMap(mdFiles);
const read = (rel: string) => readFileSync(join(PLUGIN_ROOT, rel), 'utf8');
const isSkill = (f: string) => f.endsWith('/SKILL.md');
const isWorkflowSkill = (f: string) => isSkill(f) && f.includes('workflow/');
const isChecked = (f: string) => !/(^|\/)(examples|references)\//.test(f);

describe('skills lint', () => {
  test('linted folders exist', () => {
    for (const p of LINTED) expect(existsSync(join(PLUGIN_ROOT, p)), p).toBe(true);
  });

  test('no md5sum', () => {
    for (const f of allFiles()) expect(read(f), f).not.toContain('md5sum');
  });

  test('settings only in course-conventions', () => {
    for (const f of allFiles().filter((x) => x !== CONVENTIONS)) {
      expect(read(f), f).not.toContain('${user_config.');
    }
  });

  test('workflow skills load course-conventions', () => {
    for (const f of allFiles().filter(isWorkflowSkill)) {
      expect(read(f), f).toContain('course-curriculum-creator:course-conventions');
    }
  });

  test('workflow skills keep disable-model-invocation', () => {
    for (const f of allFiles().filter(isWorkflowSkill)) {
      const fm = /^---\n([\s\S]*?)\n---/.exec(read(f))?.[1] ?? '';
      expect(fm, f).toMatch(/^disable-model-invocation:\s*true\s*$/m);
    }
  });

  test('no fixed 1-2 day duration', () => {
    const banned = [/1-2[ -]day/i, /1-day or 2-day/i, /1-day vs 2-day/i];
    for (const f of allFiles().filter((x) => (isSkill(x) || x.includes('/agents/')) && isChecked(x))) {
      for (const re of banned) expect(read(f), `${f} ${re}`).not.toMatch(re);
    }
  });

  test('course-conventions has all settings', () => {
    const plugin = JSON.parse(readFileSync(join(PLUGIN_ROOT, '.claude-plugin/plugin.json'), 'utf8'));
    const keys = Object.keys(plugin.userConfig);
    expect(keys.length).toBe(11);
    expect(existsSync(join(PLUGIN_ROOT, CONVENTIONS))).toBe(true);
    const text = read(CONVENTIONS);
    for (const k of keys) expect(text, k).toContain('${user_config.' + k + '}');
  });
});
