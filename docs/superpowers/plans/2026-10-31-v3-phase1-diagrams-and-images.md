# v3 Phase 1 — Diagrams and Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Language:** The text of this plan obeys ASD-STE100 Simplified Technical English. Code, commands, file names and quoted strings do not obey STE100.

**Goal:** Add a course data contract and a new `course-studio` plugin. The plugin plans, makes, reviews and embeds diagrams, charts and images for a course.

**Architecture:** The repository becomes a marketplace with a `plugins/` folder. A TypeScript toolkit (`packages/course-kit`) holds all logic. esbuild compiles the toolkit into one file per plugin. Skills call that file with Bash. The toolkit writes `course.yaml`, a media plan, a media registry and a cost ledger in each course folder.

**Tech Stack:** Node ≥ 20, TypeScript 5, npm workspaces, vitest, esbuild, zod, yaml, `@modelcontextprotocol/sdk`, vega and vega-lite. Optional lazy installs: `@mermaid-js/mermaid-cli` and `excalidraw-to-svg`.

**Spec:** `docs/superpowers/specs/2026-10-31-v3-blended-course-studio-design.md`. Phase 1 is in spec §11. Read spec §7.1, §7.1a, §7.2, §7.4, §7.5, §7.6, §7.10 and §8 item 5 before you start.

## Global Constraints

- Node ≥ 20 is necessary for all plugins. Do not write prose fallbacks for logic that `course-kit` does (spec §7.1).
- Core plugin version: `2.1.0`. This release is additive. v2 course folders must continue to operate (spec §11, release mapping).
- `course-studio` version: `0.1.0`. It declares `"dependencies": ["course-curriculum-creator"]`.
- Do not put a top-level `bin/` folder in a plugin. Put the toolkit bundle in `skills/course-kit/scripts/` (spec §7.1a).
- Every `userConfig` field that an MCP server uses must have a default. Cowork drops the server if a default is missing (spec §7.1a).
- Hashes in frontmatter use the v2 format: the first 8 hex characters of the MD5 of the file. Existing `sourceHashes` must stay valid.
- Raster image prompts must end with this exact text: `No text, letters, numbers, logos, or watermarks anywhere in the image.` (spec §7.4).
- Only assets with status `approved` go into course materials. Other assets show a placeholder (spec §7.4).
- The toolkit must refuse a paid generation that makes spend go above `media.budgetUsd`. It must refuse a plan-billed generation that makes the count go above `media.maxPlanImages` (spec §7.6).
- Workflow skills keep `disable-model-invocation: true`. Knowledge skills (`course-kit`, `media-pedagogy`) set `user-invocable: false`.
- CLI output is JSON on stdout. Exit codes: `0` success, `1` usage error, `2` validation error, `3` budget exceeded, `4` provider not available.

## Review Focus

1. **Schedule summary headings.** The CRE-201 outline has `## Schedule Summary — Day 1` headings after the day sections. The session parser must ignore them. Expected: 4 sessions, not 8. Test in Task 4.
2. **Repeated runs.** A user runs `manifest sync` or `embed` two or more times. Expected: no duplicate ID comments and no duplicate media blocks. Tests in Task 4 and Task 13.
3. **One request that crosses the budget.** Spend is below the cap, but one estimate goes above it. Expected: refusal with exit code 3, also through the MCP server path. Tests in Task 8 and Task 10.
4. **Hand edits after IDs exist.** A user renames a module heading or deletes an objective. Expected: IDs stay the same for the same number. Plan items and assets that refer to a removed ID cause a validation error. Tests in Task 4 and Task 12.
5. **Spaces in paths.** The course folder is `~/My Courses/Intro 101`. Expected: all commands operate. Test in Task 2.

---

## File Structure

```
package.json                         root: npm workspaces, scripts test/build/check
tsconfig.base.json
.github/workflows/ci.yml
.claude-plugin/marketplace.json      two plugin entries in Phase 1
packages/course-kit/
  package.json
  src/
    cli.ts                           full CLI (studio bundle)
    cli-core.ts                      core CLI subset (core bundle)
    cli/args.ts                      argument parse, JSON output, exit codes
    errors.ts                        KitError classes with exit codes
    hash.ts                          hashFile, checkStale, writeHashes
    frontmatter.ts                   readFrontmatter, writeFrontmatter
    manifest/schema.ts               zod schema + types for course.yaml
    manifest/io.ts                   initManifest, loadManifest, saveManifest, validateManifest
    manifest/sync.ts                 parse objectives + outline markdown, IDs, ID comments
    migrate/v2.ts                    migrateV2
    media/schema.ts                  Asset, PlanItem, MediaPlan types + zod
    media/registry.ts                registry load/save/add/setStatus
    media/plan.ts                    validatePlan, estimatePlan
    media/ledger.ts                  ledger totals, checkBudget, recordSpend
    media/pricing.ts                 loadPricing
    media/embed.ts                   embedAsset, embedAll
    render/vegalite.ts               renderVegaLite
    render/mermaid.ts                renderMermaid
    render/excalidraw.ts             renderExcalidraw
    render/overlay.ts                buildLabelOverlay
    render/deps.ts                   installDeps, depPath
    providers/prompt.ts              composeImagePrompt, NO_TEXT_RULE
    providers/codex.ts               probeCodex, generateImageCodex
    providers/openai.ts              resolveOpenAIKey, generateImageOpenAI
    providers/generate.ts            generateAssetImage (single entry for CLI + MCP)
    providers/record.ts              recordProviders, loadProviders
    brand/schema.ts                  Brand type + zod
    brand/tokens.ts                  contrastRatio, deriveTokens, checkTokens
    mcp/course-media-server.ts       stdio MCP server
  data/pricing.json
  data/providers.yaml
  scripts/build.mjs                  esbuild: writes the bundles into plugins/
  test/…                             vitest tests, one file for each src module
  test/fixtures/CRE-201/             snapshot of the real course
  test/fixtures/v2-sample/           synthetic course in v2 template format
plugins/course-curriculum-creator/   all current plugin files, moved here
  skills/course-kit/SKILL.md         knowledge skill: how to call the CLI
  skills/course-kit/scripts/course-kit.mjs           generated bundle (core)
  workflow/0-analysis/migrate-course/SKILL.md        new
plugins/course-studio/
  .claude-plugin/plugin.json
  .mcp.json
  README.md
  skills/course-kit/SKILL.md
  skills/course-kit/scripts/course-kit.mjs           generated bundle (full)
  skills/course-kit/scripts/course-media-server.mjs  generated bundle
  skills/media-pedagogy/SKILL.md
  skills/setup/SKILL.md
  skills/setup-brand/SKILL.md
  skills/generate-style-guide/SKILL.md
  skills/plan-media/SKILL.md
  skills/generate-media/SKILL.md
  skills/review-media/SKILL.md
  skills/embed-media/SKILL.md
  evals/
```

**Decision (deviation from the spec text):** Spec §7.2 shows anchors as `{#M1}` at the end of headings. GitHub shows that text literally. Use an HTML comment on the line after the heading: `<!-- id: M1 -->`. It is not visible in any renderer.

**Bundle path in skills:** Skills call `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`. Claude Code substitutes the variable in skill content. Task 15 has a manual check for Cowork.

---

### Task 1: Move the plugin into a monorepo

**Files:**
- Move: all plugin files (`.claude-plugin/plugin.json`, `agents/`, `skills/`, `workflow/`, `assets/`, `examples/`) → `plugins/course-curriculum-creator/`
- Modify: `.claude-plugin/marketplace.json`
- Create: `package.json`, `tsconfig.base.json`, `packages/course-kit/package.json`, `packages/course-kit/tsconfig.json`, `packages/course-kit/vitest.config.ts`
- Modify: `.gitignore`, `README.md`

**Interfaces:**
- Produces: root scripts `npm test`, `npm run build`, `npm run check`. Workspace package name `@course/kit` (private).

- [ ] **Step 1: Move the files with `git mv`**

Keep `README.md`, `LICENSE`, `docs/`, `.planning/` and `.claude-plugin/marketplace.json` at the root. Do not change file content in this step.

- [ ] **Step 2: Change the marketplace entry**

Set the `course-curriculum-creator` entry `source` to `"./plugins/course-curriculum-creator"`. Set its `description` to `"Design blended courses (workshop, cohort, self-paced) using backward design and Bloom's taxonomy"`.

- [ ] **Step 3: Validate the plugin and the marketplace**

Run: `claude plugin validate plugins/course-curriculum-creator && claude plugin validate .`
Expected: `Validation passed` two times. Warnings are permitted. Errors are not permitted.

- [ ] **Step 4: Add the workspace files**

Root `package.json`: `"private": true`, `"workspaces": ["packages/*"]`, `"engines": {"node": ">=20"}`. Scripts: `test` = `npm -w @course/kit test`, `build` = `node packages/course-kit/scripts/build.mjs`, `check` = `npm run build && git diff --exit-code plugins/`. Pin exact versions for all dev dependencies.

Add `node_modules/` and `dist/` to `.gitignore`.

- [ ] **Step 5: Write a smoke test**

`packages/course-kit/test/smoke.test.ts`:

```ts
import { expect, test } from 'vitest';
test('toolchain runs', () => { expect(1 + 1).toBe(2); });
```

- [ ] **Step 6: Run the tests**

Run: `npm install && npm test`
Expected: 1 test passes.

- [ ] **Step 7: Change the paths in the README**

Change the local development path to `plugins/course-curriculum-creator`. Add one line: "This repository is a marketplace. It contains more than one plugin."

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: move plugin into plugins/ and add npm workspace"
```

---

### Task 2: Hash, frontmatter and stale check

**Files:**
- Create: `packages/course-kit/src/errors.ts`, `src/hash.ts`, `src/frontmatter.ts`, `src/cli/args.ts`, `src/cli-core.ts`
- Test: `test/hash.test.ts`, `test/cli.test.ts`

**Interfaces:**
- Produces:
  - `class KitError extends Error { exitCode: 1|2|3|4 }` and subclasses `UsageError(1)`, `ValidationError(2)`, `BudgetExceededError(3)`, `ProviderUnavailableError(4)`.
  - `hashFile(path: string): string` returns the first 8 hex characters of MD5.
  - `readFrontmatter(path: string): { data: Record<string, unknown>; body: string }`
  - `writeFrontmatter(path: string, data: Record<string, unknown>): void` keeps the body unchanged.
  - `checkStale(outputPath: string, courseDir: string): { status: 'missing-output'|'fresh'|'stale'; changed: string[] }`. It reads `sourceFiles` and `sourceHashes` from the output frontmatter.
  - `writeHashes(outputPath: string, courseDir: string): void`
  - `runCli(argv: string[], commands: CommandTable): Promise<number>`. It prints one JSON object to stdout. On a `KitError` it prints `{"error": message}` and returns the error's exit code.
  - CLI commands: `hash <file>`, `stale <output> --course <dir>`, `hash-write <output> --course <dir>`.

- [ ] **Step 1: Write the failing tests**

```ts
test('hashFile matches the v2 md5sum | cut -c1-8 format', () => {
  writeFileSync(f, 'abc');
  expect(hashFile(f)).toBe('90015098'); // md5("abc") = 900150983cd24fb0…
});
test('checkStale reports a changed source', () => {
  // output frontmatter: sourceFiles {obj: "01-planning/learning-objectives.md"}, sourceHashes {obj: "00000000"}
  expect(checkStale(out, dir)).toEqual({ status: 'stale', changed: ['obj'] });
});
test('checkStale returns missing-output when the output is absent', () => {
  expect(checkStale(join(dir, 'nope.md'), dir).status).toBe('missing-output');
});
test('writeHashes then checkStale returns fresh and keeps the body', () => {
  writeHashes(out, dir);
  expect(checkStale(out, dir).status).toBe('fresh');
  expect(readFrontmatter(out).body).toBe(originalBody);
});
test('CLI operates when the course path has spaces', async () => {
  // dir = mkdtemp + '/My Courses/Intro 101'
  expect(await runCli(['stale', out, '--course', dir], coreCommands)).toBe(0);
});
test('CLI prints an error and returns 1 for an unknown command', async () => {
  expect(await runCli(['nope'], coreCommands)).toBe(1);
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- hash cli`
Expected: FAIL. The modules do not exist.

- [ ] **Step 3: Write the modules**

Use `node:crypto` for MD5. Use the `yaml` package for frontmatter. Do not change key order in frontmatter that you do not write.

- [ ] **Step 4: Run the tests**

Run: `npm test -- hash cli`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): add hash, frontmatter, stale check and CLI runner"
```

---

### Task 3: Course manifest schema

**Files:**
- Create: `src/manifest/schema.ts`, `src/manifest/io.ts`
- Modify: `src/cli-core.ts`
- Test: `test/manifest.test.ts`

**Interfaces:**
- Produces (types are normative; copy the field names):

```ts
type Shape = 'workshop' | 'cohort' | 'self-paced';
type Delivery = 'in-person' | 'virtual' | 'hybrid' | 'async';
type ObjectiveKind = 'cognitive' | 'affective' | 'orientation' | 'integration';
type StageName = 'positioning' | 'objectives' | 'rubrics' | 'outline' | 'lessonPlans' | 'materials';
interface Session { id: string; label: string; minutes: number }            // id "S1"
interface Objective { id: string; title: string; kind: ObjectiveKind; bloom?: string } // id "LO-1", "LO-0", "LO-A"
interface Module { id: string; title: string; session?: string; objectives: string[]; minutes?: number } // id "M1"
interface SourceRef { path: string; role: 'source' | 'derived' | 'variant' | 'external' | 'material'; of?: string }
interface Manifest {
  schema: 'course/v3'; id: string; title: string; version: string;
  status: 'draft' | 'review' | 'final'; created: string;
  shape: Shape; delivery: Delivery;
  audience: { level: string; summary: string };
  timeBudget: { live?: { sessions: Session[] };
                async?: { preWorkMinutes: number; betweenSessionMinutes: number; postWorkMinutes: number } };
  objectives: Objective[]; modules: Module[];
  brand?: string; style?: string;
  media: { budgetUsd: number; maxPlanImages: number; approvalRequired: boolean };
  sources?: SourceRef[]; stages?: Partial<Record<StageName, 'present' | 'missing'>>;
  extra?: Record<string, unknown>;      // frontmatter keys v3 does not use, kept as-is
  targets: Record<string, unknown>;
}
interface ValidationIssue { level: 'error' | 'warning'; path: string; message: string }
interface InitOptions { title: string; shape: Shape; delivery: Delivery; sessions: Session[];
                        audienceLevel: string; audienceSummary: string; budgetUsd: number; maxPlanImages: number }
function initManifest(opts: InitOptions, today: string): Manifest
function loadManifest(courseDir: string): Manifest          // throws ValidationError on schema failure
function saveManifest(courseDir: string, m: Manifest): void // writes course.yaml
function validateManifest(m: Manifest): ValidationIssue[]
```

- CLI: `manifest init --course <dir> --json <InitOptions>`, `manifest validate --course <dir>`.

- [ ] **Step 1: Write the failing tests**

```ts
test('initManifest makes a valid workshop manifest', () => {
  const m = initManifest({ title: 'PropTech Fundamentals', shape: 'workshop', delivery: 'in-person',
    sessions: [{ id: 'S1', label: 'Day 1', minutes: 420 }], audienceLevel: 'professional',
    audienceSummary: 'CRE analysts', budgetUsd: 20, maxPlanImages: 40 }, '2026-10-31');
  expect(m.id).toBe('proptech-fundamentals');
  expect(validateManifest(m)).toEqual([]);
});
test('a module that names an unknown objective is an error', () => {
  m.modules = [{ id: 'M1', title: 'X', objectives: ['LO-9'] }];
  expect(validateManifest(m)).toContainEqual(expect.objectContaining({ level: 'error', path: 'modules[0].objectives[0]' }));
});
test('a self-paced course with live sessions is an error', () => { /* shape self-paced + timeBudget.live */ });
test('a workshop with more than 2 sessions is a warning that suggests cohort', () => { /* 3 sessions */ });
test('module minutes above session minutes is a warning', () => { /* M1 500 min in S1 420 */ });
test('save then load gives the same object', () => { saveManifest(dir, m); expect(loadManifest(dir)).toEqual(m); });
test('loadManifest throws ValidationError for a bad schema value', () => { /* shape: "bootcamp" */ });
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- manifest`
Expected: FAIL.

- [ ] **Step 3: Write `schema.ts` and `io.ts`**

Use zod for the schema. Make the `id` slug from the title: lowercase, ASCII, hyphens.

- [ ] **Step 4: Run the tests**

Run: `npm test -- manifest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): add course.yaml schema, init and validate"
```

---

### Task 4: Manifest sync from markdown

**Files:**
- Create: `src/manifest/sync.ts`
- Create: `test/fixtures/CRE-201/` (snapshot), `test/fixtures/v2-sample/`
- Modify: `src/cli-core.ts`
- Test: `test/sync.test.ts`

**Interfaces:**
- Consumes: `Manifest`, `loadManifest`, `saveManifest` (Task 3).
- Produces:

```ts
interface ParsedObjective { id: string; title: string; kind: ObjectiveKind; bloom?: string; line: number }
interface ParsedSession { id: string; label: string; minutes: number }
interface ParsedModule { id: string; title: string; session?: string; objectives: string[]; minutes?: number; line: number }
function parseObjectives(markdown: string): ParsedObjective[]
function parseOutline(markdown: string): { sessions: ParsedSession[]; modules: ParsedModule[] }
function insertIdComments(markdown: string, items: { id: string; line: number }[]): string // idempotent
function syncManifest(courseDir: string, opts: { write: boolean }): { manifest: Manifest; issues: ValidationIssue[] }
```

- CLI: `manifest sync --course <dir> [--write]`.

Parse rules (they are decisions; do not change them):

| Heading | Result |
|---|---|
| `### Objective N: Title` | `LO-N`, kind `cognitive` |
| `## Level 0: Title` | `LO-0`, kind `orientation` |
| `### Affective Objective X: Title` | `LO-X`, kind `affective` |
| `**Cognitive Level:** Word` under an objective | `bloom` = lowercase word |
| `## …Day N…` (not `Schedule Summary`) | session `SN`; label = heading text |
| `### Module N: Title (…, NN min)` | `MN`; minutes = the last `NN min` in the heading |
| `Obj N`, `Objective N`, `Objectives N` in a module section | add `LO-N` to the module |
| Any `### … (…, NN min)` under a day heading | add NN to the session minutes |

A module heading with no day heading above it has no `session`. Module title = heading text after `Module N:` and before ` (`.

- [ ] **Step 1: Copy the fixtures**

Download `CRE-201` from `reggiechan74/CRE-Courses` (main branch) with `gh api`. Copy all `.md`, `.png` and `.pdf` files. Write `test/fixtures/v2-sample/` from the output templates in `generate-objectives/SKILL.md` and `generate-outline/SKILL.md`: 4 objectives, 2 days, 4 modules.

- [ ] **Step 2: Write the failing tests**

```ts
const cre = readFileSync('test/fixtures/CRE-201/02-design/course-outline.md', 'utf8');
test('CRE-201 outline gives 4 sessions and ignores Schedule Summary headings', () => {
  const { sessions } = parseOutline(cre);
  expect(sessions.map(s => s.minutes)).toEqual([255, 280, 300, 315]);
});
test('CRE-201 outline gives 9 modules with objective links', () => {
  const { modules } = parseOutline(cre);
  expect(modules).toHaveLength(9);
  expect(modules[0]).toMatchObject({ id: 'M1', session: 'S1', minutes: 100 });
  expect(modules[0].objectives).toEqual(expect.arrayContaining(['LO-1', 'LO-2']));
  expect(modules[8].objectives).toContain('LO-10');
});
test('CRE-201 objectives give LO-0, LO-1..LO-10, LO-A, LO-B', () => {
  const ids = parseObjectives(creObjectives).map(o => o.id);
  expect(ids).toEqual(['LO-0', ...Array.from({ length: 10 }, (_, i) => `LO-${i + 1}`), 'LO-A', 'LO-B']);
  expect(parseObjectives(creObjectives)[1]).toMatchObject({ kind: 'cognitive', bloom: 'understand' });
});
test('insertIdComments run two times gives the same text', () => {
  const once = insertIdComments(md, items);
  expect(insertIdComments(once, items)).toBe(once);
  expect(once).toContain('### Module 1: Foundations — Orientation & Mental Models (9:10-10:50, 100 min)\n<!-- id: M1 -->');
});
test('a renamed module heading keeps its ID', () => { /* change title text; id stays M1, title updates */ });
test('a deleted objective gives an error for each module that refers to it', () => {
  // remove "### Objective 3" from v2-sample; a module that says "Objective 3" → issue level error
});
test('syncManifest with write false does not change files', () => { /* compare file mtimes and content */ });
```

- [ ] **Step 3: Run the tests**

Run: `npm test -- sync`
Expected: FAIL.

- [ ] **Step 4: Write `sync.ts`**

`syncManifest` reads `01-planning/learning-objectives.md` and `02-design/course-outline.md`. If `course.yaml` is absent, it makes one with `initManifest`. The title comes from the `## Course:` line, or from the folder name. The shape is `workshop` for 1 or 2 sessions and `cohort` for more. The budget values are `20` and `40`. It merges the result into `course.yaml`. It keeps manifest fields that markdown does not give. With `write: true` it writes `course.yaml` and the ID comments.

- [ ] **Step 5: Run the tests**

Run: `npm test -- sync`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): sync course.yaml IDs from objectives and outline markdown"
```

---

### Task 5: Build the bundles, the core knowledge skill and CI

**Files:**
- Create: `packages/course-kit/scripts/build.mjs`
- Create: `plugins/course-curriculum-creator/skills/course-kit/SKILL.md`
- Create (generated): `plugins/course-curriculum-creator/skills/course-kit/scripts/course-kit.mjs`
- Create: `.github/workflows/ci.yml`
- Test: `packages/course-kit/test/bundle.test.ts`

**Interfaces:**
- Consumes: `cli-core.ts` (Tasks 2–4). Task 9 adds `cli.ts` and Task 10 adds the MCP server entry to `build.mjs`.
- Produces: `build.mjs` writes one ESM file for each entry. The entry list is: `src/cli-core.ts` → core plugin; `src/cli.ts` → studio plugin; `src/mcp/course-media-server.ts` → studio plugin. Missing entries are skipped with a message.

- [ ] **Step 1: Write the failing test**

```ts
test('core bundle runs manifest validate on the v2-sample fixture', () => {
  execFileSync('node', ['packages/course-kit/scripts/build.mjs']);
  const out = execFileSync('node', [coreBundle, 'manifest', 'sync', '--course', fixture], { encoding: 'utf8' });
  expect(JSON.parse(out).manifest.modules).toHaveLength(4);
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- bundle`
Expected: FAIL.

- [ ] **Step 3: Write `build.mjs`**

esbuild options: `platform: 'node'`, `format: 'esm'`, `target: 'node20'`, `bundle: true`, a `#!/usr/bin/env node` banner. Add a header comment: `// GENERATED from packages/course-kit — do not edit`.

- [ ] **Step 4: Run the test**

Run: `npm test -- bundle`
Expected: PASS.

- [ ] **Step 5: Write the core `course-kit` knowledge skill**

Frontmatter: `name: course-kit`, `user-invocable: false`, a description that says "Use when a course-curriculum-creator workflow tells you to run course-kit". The body gives:
- The call form: `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" <command> --course "<dir>"`.
- The command list from Tasks 2–4 and Task 7.
- The exit code table from Global Constraints.
- One rule: "If `node` is not available, stop. Tell the user that Node 20 or later is necessary."

- [ ] **Step 6: Write the CI workflow**

Jobs on `push` and `pull_request`: set up Node 20, `npm ci`, `npm test`, `npm run check`, and `npx -y @anthropic-ai/claude-code plugin validate .` for the marketplace and for each plugin folder.

- [ ] **Step 7: Run the full check**

Run: `npm test && npm run check`
Expected: all tests pass. `git diff` shows no change after the build.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "build(kit): bundle course-kit into the core plugin and add CI"
```

---

### Task 6: Core workflows write course.yaml (core v2.1.0)

**Files:**
- Modify: `plugins/course-curriculum-creator/workflow/0-analysis/create-course/SKILL.md`
- Modify: `plugins/course-curriculum-creator/workflow/1-desired-results/generate-objectives/SKILL.md`
- Modify: `plugins/course-curriculum-creator/workflow/3-learning-plan/generate-outline/SKILL.md`
- Modify: `plugins/course-curriculum-creator/.claude-plugin/plugin.json`
- Modify: `README.md`
- Create: `plugins/course-curriculum-creator/evals/` (cases below)

**Interfaces:**
- Consumes: CLI `manifest init`, `manifest sync` (Tasks 3–4).
- Produces: every new course has `course.yaml` and the folders `05-media/src`, `05-media/out` and `05-media/style`. `userConfig` gets `brand_config` (type `file`, default `""`) and `default_shape` (options `workshop|cohort|self-paced`, default `workshop`).

- [ ] **Step 1: Write the eval cases**

Read https://code.claude.com/docs/en/plugin-evals.md for the case format. Write 2 cases:
- `create-course-writes-manifest`: prompt `/course-curriculum-creator:create-course "Lease Basics" --duration 1-day`. The case passes when `course.yaml` exists and `manifest validate` exits 0.
- `generate-outline-syncs-ids`: start from a copy of `v2-sample` without `course.yaml`. The case passes when `course.yaml` has 4 modules and `course-outline.md` contains `<!-- id: M1 -->`.

- [ ] **Step 2: Run the evals**

Run: `claude plugin eval plugins/course-curriculum-creator`
Expected: the 2 new cases FAIL.

- [ ] **Step 3: Change `create-course`**

Add a step after the folder step: "Run `manifest init`." Map `--duration 1-day` to one session of 420 minutes. Map `2-day` to two sessions of 420 minutes. For `cohort`, ask for the number of sessions and the minutes in each session. For `self-paced`, write no live sessions. Ask for the shape first. Use `default_shape` when the user gives no shape. Add the `05-media/` folders to the folder tree.

- [ ] **Step 4: Change `generate-objectives` and `generate-outline`**

Add a last step to each skill: "Run `manifest sync --write`. Show each issue to the user." Do not change other content.

- [ ] **Step 5: Set the version and the settings**

Set `"version": "2.1.0"`. Add the two `userConfig` fields. Update the README version badge and add a v2.1.0 changelog entry.

- [ ] **Step 6: Run the evals and validation**

Run: `claude plugin eval plugins/course-curriculum-creator && claude plugin validate plugins/course-curriculum-creator`
Expected: the 2 cases PASS. Validation passes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(core): write and sync course.yaml from create-course, objectives and outline (v2.1.0)"
```

---

### Task 7: Media schema, registry and plan

**Files:**
- Create: `src/media/schema.ts`, `src/media/registry.ts`, `src/media/plan.ts`, `src/media/pricing.ts`, `data/pricing.json`
- Modify: `src/cli-core.ts` (registry commands only, for `migrate-course`)
- Test: `test/registry.test.ts`, `test/plan.test.ts`

**Interfaces:**
- Consumes: `Manifest`, `ValidationIssue` (Task 3).
- Produces:

```ts
type AssetFunction = 'concept-map'|'process-flow'|'comparison'|'hierarchy'|'cycle'|'timeline'|'data-viz'
  |'worked-example'|'scenario-illustration'|'analogy-illustration'|'infographic'|'job-aid'
  |'interactive-explainer'|'audio-recap'|'video-explainer';
type AssetKind = 'diagram'|'chart'|'image'|'infographic'|'audio'|'video';
type AssetStatus = 'generated'|'approved'|'rejected'|'imported';
type ReviewCheck = 'no-stray-text'|'factual'|'representation'|'style'|'contrast'|'physical';
interface ReviewRecord { checks: Record<ReviewCheck, 'pass'|'fail'|'n/a'>; notes?: string; at: string }
interface Asset { id: string; kind: AssetKind; function?: AssetFunction; objectives: string[]; module?: string;
  provider: string; source?: string; files: string[]; alt: string; longDescription?: string; caption?: string;
  status: AssetStatus; costUsd: number; quotaUnits: number; sha256?: string; shareUrl?: string;
  review?: ReviewRecord; approvedBy?: 'user'; createdAt: string }
interface Registry { schema: 'registry/v1'; assets: Asset[] }
interface PlanItem { id: string; module: string; segment?: string; objectives: string[]; function: AssetFunction;
  kind: AssetKind; description: string; provider: string; estimateUsd: number; quotaUnits: number;
  status: 'proposed'|'approved'|'rejected' }
interface MediaPlan { schema: 'media-plan/v1'; items: PlanItem[] }
interface Pricing { asOf: string; image: Record<string, { draft: number; standard: number; high: number }> }

function loadRegistry(courseDir: string): Registry            // empty registry if the file is absent
function saveRegistry(courseDir: string, r: Registry): void   // 05-media/registry.json
function addAsset(r: Registry, a: Asset): Registry            // ValidationError on duplicate id
function setStatus(r: Registry, id: string, to: AssetStatus,
  opts?: { review?: ReviewRecord; approvedBy?: 'user' }): Registry
function loadPlan(courseDir: string): MediaPlan               // 05-media/media-plan.yaml
function savePlan(courseDir: string, p: MediaPlan): void
function validatePlan(p: MediaPlan, m: Manifest, r: Registry): ValidationIssue[]
function estimatePlan(p: MediaPlan, pricing: Pricing, quality: 'draft'|'standard'|'high'):
  { perModule: Record<string, { usd: number; quota: number }>; totalUsd: number; totalQuota: number }
function loadPricing(dataDir?: string): Pricing   // ${dataDir}/pricing.json overrides the bundled file
```

- CLI: `registry list|add|status`, `plan validate`, `plan estimate --quality <q>`.

Status transitions (decision): `generated → approved | rejected`; `rejected → generated`; `imported → approved | rejected`. To set `approved`, `alt` must not be empty and `approvedBy` must be `'user'`.

Plan rules for `validatePlan` (decision):
- Error: an item has no objectives, or names an objective or module that is not in the manifest.
- Error: an item uses one of `concept-map`, `process-flow`, `comparison`, `hierarchy`, `cycle`, `timeline` with kind `image`. These functions must use kind `diagram`.
- Error: an asset in the registry names an objective or module that is not in the manifest.
- Warning: a module has no approved or proposed item. Message: `Module <id> has text only. UDL needs 2 or more representation modes.`

- [ ] **Step 1: Write the failing tests**

```ts
test('approved needs alt text and user approval', () => {
  expect(() => setStatus(reg, 'A-M1-01', 'approved', { approvedBy: 'user' })).toThrow(ValidationError); // alt ''
});
test('generated cannot go directly to imported', () => { expect(() => setStatus(reg, id, 'imported')).toThrow(); });
test('a process-flow item with kind image is an error', () => {
  expect(validatePlan(plan, m, emptyReg)).toContainEqual(expect.objectContaining({ level: 'error', path: 'items[0].kind' }));
});
test('an item with no objectives is an error', () => { /* objectives: [] */ });
test('an asset that refers to a deleted module is an error', () => { /* registry asset module M9, manifest has M1..M4 */ });
test('a module with no items gives the UDL warning', () => { /* exact message text */ });
test('estimatePlan sums usd for each module and quota units', () => {
  // fixture pricing: image['openai:gpt-image-2'].standard = 0.05; 2 OpenAI items in M1, 1 codex item (quota 1) in M2
  expect(estimatePlan(plan, pricing, 'standard')).toEqual({
    perModule: { M1: { usd: 0.1, quota: 0 }, M2: { usd: 0, quota: 1 } }, totalUsd: 0.1, totalQuota: 1 });
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- registry plan`
Expected: FAIL.

- [ ] **Step 3: Write the modules and `data/pricing.json`**

Get the gpt-image-2 values for each quality from https://openai.com/api/pricing on the day that you write this file. Set `asOf` to that date. The tests use their own fixture pricing and do not use these values.

- [ ] **Step 4: Run the tests**

Run: `npm test -- registry plan`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): add media registry, media plan validation and estimates"
```

---

### Task 8: Ledger and budget enforcement

**Files:**
- Create: `src/media/ledger.ts`
- Test: `test/ledger.test.ts`

**Interfaces:**
- Consumes: `Manifest` (Task 3), `BudgetExceededError` (Task 2).
- Produces:

```ts
interface LedgerEntry { at: string; assetId: string; provider: string; model?: string;
  estimateUsd: number; actualUsd: number; quotaUnits: number }
function readLedger(courseDir: string): LedgerEntry[]                // .course/cost-ledger.jsonl
function ledgerTotals(courseDir: string): { spentUsd: number; quotaUsed: number }
function checkBudget(m: Manifest, totals: { spentUsd: number; quotaUsed: number },
  request: { usd: number; quota: number }): void                     // throws BudgetExceededError
function recordSpend(courseDir: string, e: LedgerEntry): void        // append one line
```

- CLI (in `cli.ts` from Task 9): `ledger totals`, `ledger check --usd <n> --quota <n>`.

- [ ] **Step 1: Write the failing tests**

```ts
test('a request that crosses the cap is refused when spend is below the cap', () => {
  // budgetUsd 1.00, spent 0.95
  expect(() => checkBudget(m, { spentUsd: 0.95, quotaUsed: 0 }, { usd: 0.10, quota: 0 }))
    .toThrow(BudgetExceededError);
});
test('a request that reaches the cap exactly is permitted', () => {
  expect(() => checkBudget(m, { spentUsd: 0.90, quotaUsed: 0 }, { usd: 0.10, quota: 0 })).not.toThrow();
});
test('plan-billed images above maxPlanImages are refused', () => {
  // maxPlanImages 2, quotaUsed 2
  expect(() => checkBudget(m, { spentUsd: 0, quotaUsed: 2 }, { usd: 0, quota: 1 })).toThrow(BudgetExceededError);
});
test('the error message gives the cap, the spend and the request', () => {
  // message contains "1.00", "0.95", "0.10"
});
test('recordSpend then ledgerTotals sums usd and quota', () => { /* 2 entries */ });
test('a damaged ledger line is a ValidationError, not a zero total', () => { /* append "not json" */ });
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- ledger`
Expected: FAIL.

- [ ] **Step 3: Write `ledger.ts`**

Compare money in integer cents. This prevents floating-point errors at the cap.

- [ ] **Step 4: Run the tests**

Run: `npm test -- ledger`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): add cost ledger and budget enforcement"
```

---

### Task 9: Renderers

**Files:**
- Create: `src/cli.ts` (full CLI; it includes all core commands)
- Create: `src/render/deps.ts`, `src/render/vegalite.ts`, `src/render/mermaid.ts`, `src/render/excalidraw.ts`, `src/render/overlay.ts`
- Modify: `scripts/build.mjs` (enable the `cli.ts` entry)
- Test: `test/render.test.ts`

**Interfaces:**
- Consumes: `ProviderUnavailableError` (Task 2).
- Write the `Tokens` interface from Task 11 into `src/brand/tokens.ts` in this task. Task 11 adds the functions to that file. Renderers use `Partial<Tokens>` and default colors when a token is absent.
- Produces:

```ts
type DepName = 'mermaid-cli' | 'excalidraw-to-svg';
function depPath(dataDir: string, dep: DepName): string | null        // null if not installed
function installDeps(dataDir: string, deps: DepName[]): void          // npm install --prefix <dataDir>, pinned versions
function renderVegaLite(spec: object, outSvg: string, tokens?: Partial<Tokens>): Promise<void>
function renderMermaid(srcPath: string, outSvg: string, dataDir: string, tokens?: Partial<Tokens>): Promise<void>
function renderExcalidraw(srcPath: string, outSvg: string, dataDir: string): Promise<void>
interface Label { text: string; x: number; y: number; anchor?: 'start'|'middle'|'end' }
function buildLabelOverlay(imageHref: string, width: number, height: number, labels: Label[],
  tokens?: Partial<Tokens>): string                                   // returns SVG text
```

- CLI: `deps install <names…> --data-dir <dir>`, `render vegalite|mermaid|excalidraw <src> <out> [--data-dir <dir>]`, `render overlay <image> <labels.json> <out>`.

- [ ] **Step 1: Write the failing tests**

```ts
test('renderVegaLite writes an SVG with the bar marks', async () => {
  await renderVegaLite(barSpec, out);
  expect(readFileSync(out, 'utf8')).toMatch(/^<svg[\s\S]*<\/svg>\s*$/);
});
test('renderMermaid throws ProviderUnavailableError when mermaid-cli is not installed', async () => {
  await expect(renderMermaid(src, out, emptyDataDir)).rejects.toBeInstanceOf(ProviderUnavailableError);
});
test.skipIf(!depPath(DATA, 'mermaid-cli'))('renderMermaid writes an SVG', async () => { /* flowchart LR; A-->B */ });
test.skipIf(!depPath(DATA, 'excalidraw-to-svg'))('renderExcalidraw writes an SVG', async () => { /* 1 rectangle */ });
test('buildLabelOverlay escapes label text and uses the token font', () => {
  const svg = buildLabelOverlay('a.png', 800, 600, [{ text: 'Rent & <CAM>', x: 10, y: 20 }], { font: { body: 'Inter' } });
  expect(svg).toContain('Rent &amp; &lt;CAM&gt;');
  expect(svg).toContain('font-family="Inter"');
  expect(svg).toContain('href="a.png"');
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- render`
Expected: FAIL.

- [ ] **Step 3: Write the renderers**

- vega-lite: compile with `vega-lite`, then `new vega.View(vega.parse(spec), { renderer: 'none' }).toSVG()`. Set the chart colors from `tokens.color` when they are present.
- mermaid: run `<dataDir>/node_modules/.bin/mmdc -i src -o out`. Give a theme config from tokens.
- excalidraw: import `excalidraw-to-svg` from `<dataDir>/node_modules`. Do a smoke test on Node 20 first. If it does not operate, use the Playwright export page of `@excalidraw/utils` and record the change in the commit message.

- [ ] **Step 4: Run the tests**

Run: `npm test -- render`
Expected: PASS. The two skipped tests stay skipped when the dependencies are not installed.

- [ ] **Step 5: Run the optional renderers one time locally**

Run: `node plugins/course-studio/skills/course-kit/scripts/course-kit.mjs deps install mermaid-cli excalidraw-to-svg --data-dir /tmp/ck && CK_DATA=/tmp/ck npm test -- render`
Expected: all render tests pass. No test is skipped.

- [ ] **Step 6: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): add vega-lite, mermaid, excalidraw renderers and label overlays"
```

---

### Task 10: Image providers and the course-media MCP server

**Files:**
- Create: `src/providers/prompt.ts`, `src/providers/codex.ts`, `src/providers/openai.ts`, `src/providers/generate.ts`, `src/providers/record.ts`, `data/providers.yaml`
- Create: `src/mcp/course-media-server.ts`
- Modify: `src/cli.ts`, `scripts/build.mjs` (enable the server entry)
- Test: `test/providers.test.ts`, `test/mcp.test.ts`

**Interfaces:**
- Consumes: `loadManifest` (Task 3), `loadPlan`, `loadRegistry`, `saveRegistry`, `addAsset`, `loadPricing` (Task 7), `ledgerTotals`, `checkBudget`, `recordSpend` (Task 8).
- Produces:

```ts
const NO_TEXT_RULE = 'No text, letters, numbers, logos, or watermarks anywhere in the image.';
function composeImagePrompt(anchors: string, scene: string): string  // anchors + "\n\n" + scene + "\n\n" + NO_TEXT_RULE
function probeCodex(codexBin?: string): Promise<{ available: boolean; loggedIn: boolean }>
function generateImageCodex(o: { prompt: string; outPath: string; codexBin?: string }): Promise<void>
function resolveOpenAIKey(env: NodeJS.ProcessEnv, dataDir?: string): string | null
function generateImageOpenAI(o: { prompt: string; outPath: string; quality: 'draft'|'standard'|'high';
  apiKey: string; fetchImpl?: typeof fetch }): Promise<{ usd: number; model: string }>
type ImageProvider = 'codex' | 'openai';
function generateAssetImage(courseDir: string, assetId: string, provider: ImageProvider,
  o: { quality: 'draft'|'standard'|'high'; dataDir?: string; env?: NodeJS.ProcessEnv;
       fetchImpl?: typeof fetch; codexBin?: string }): Promise<Asset>
interface DetectedProviders { detectedAt: string; image: string[]; diagram: string[]; designSkills: string[];
  codex: { available: boolean; loggedIn: boolean } }
function recordProviders(courseDir: string, d: DetectedProviders): void   // .course/providers.json
function loadProviders(courseDir: string): DetectedProviders | null
```

`generateAssetImage` does these steps in this sequence (decision):
1. Find the plan item. It must have status `approved` and kind `image`. If not, throw `ValidationError`.
2. Read `05-media/style/prompt-anchors.md`. If it is absent, throw `ValidationError` with the text `Run generate-style-guide first.`
3. Compose the prompt. Write it to `05-media/src/<id>.prompt.txt`.
4. Call `checkBudget` with the estimate: codex → `{usd: 0, quota: 1}`, openai → the pricing value.
5. Generate to `05-media/out/<id>.png`.
6. Call `recordSpend`. Add or replace the asset with status `generated`, `alt: ''`, the file, sha256 and cost.

Key order for `resolveOpenAIKey` (decision): `env.COURSE_MEDIA_OPENAI_KEY` if not empty, then `env.OPENAI_API_KEY`, then the contents of `<dataDir>/openai.key`.

Codex call: `codex exec --skip-git-repo-check --sandbox workspace-write -C <dir of outPath> "$imagegen <prompt> Save the image as <basename of outPath>."`. Run `codex exec --help` first and use the flag names it shows. After the run, the file must exist. If it does not exist, throw `ProviderUnavailableError`.

MCP server tools (stdio, `@modelcontextprotocol/sdk`):
- `generate_image({ courseDir, assetId, quality? })` → calls `generateAssetImage(courseDir, assetId, 'openai', …)` and returns the asset JSON.
- `estimate_cost({ courseDir, quality? })` → returns `estimatePlan` for the plan.
- When `resolveOpenAIKey` returns `null`, each tool returns an MCP error with the text `course-media is not configured: set openai_api_key, OPENAI_API_KEY, or <dataDir>/openai.key`. The server does not stop.

- CLI: `gen image --asset <id> --provider codex|openai --quality <q> [--data-dir <dir>]`, `providers probe-codex`, `providers record --json <DetectedProviders>`, `providers show`.

- [ ] **Step 1: Write the failing tests**

```ts
test('composeImagePrompt ends with the exact no-text rule', () => {
  expect(composeImagePrompt('flat vector, teal palette', 'a broker reads a lease'))
    .toMatch(/No text, letters, numbers, logos, or watermarks anywhere in the image\.$/);
});
test('resolveOpenAIKey prefers COURSE_MEDIA_OPENAI_KEY, then OPENAI_API_KEY, then the key file', () => { /* 3 cases */ });
test('generateAssetImage with openai records spend and a generated asset', async () => {
  const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ b64_json: PNG_1PX }] })));
  const a = await generateAssetImage(dir, 'A-M1-01', 'openai', { quality: 'standard', env: { OPENAI_API_KEY: 'k' }, fetchImpl });
  expect(a).toMatchObject({ status: 'generated', provider: 'openai', alt: '' });
  expect(ledgerTotals(dir).spentUsd).toBeGreaterThan(0);
});
test('generateAssetImage refuses before any network call when the budget is too small', async () => {
  // budgetUsd 0.01; estimate 0.05
  await expect(generateAssetImage(dir, 'A-M1-01', 'openai', { quality: 'standard', env: { OPENAI_API_KEY: 'k' }, fetchImpl }))
    .rejects.toBeInstanceOf(BudgetExceededError);
  expect(fetchImpl).not.toHaveBeenCalled();
});
test('generateAssetImage refuses a plan item that is not approved', async () => { /* status proposed */ });
test('generateAssetImage with codex uses a stub codex binary and records quota 1', async () => {
  // codexBin = test/stubs/codex (writes a 1px PNG to the requested name)
  expect(ledgerTotals(dir).quotaUsed).toBe(1);
});
test('codex that writes no file gives ProviderUnavailableError and no ledger entry', async () => { /* stub writes nothing */ });
test('MCP generate_image refuses over budget with the same error text as the CLI', async () => {
  // start the server in-process with an InMemoryTransport; call generate_image; expect isError and "budget"
});
test('MCP tools report "not configured" when no key exists', async () => { /* empty env, empty dataDir */ });
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- providers mcp`
Expected: FAIL.

- [ ] **Step 3: Write the providers and the server**

OpenAI request: `POST https://api.openai.com/v1/images/generations` with `model: "gpt-image-2"`. Map quality `draft|standard|high` to the API values `low|medium|high`. Do not log the key. Write `data/providers.yaml` with name patterns for each capability. Copy these patterns: image `["*generate_image*", "*image_gen*"]`, diagram `["*Excalidraw*", "*Mermaid*"]`, designSkills `["impeccable*", "design-taste-frontend*", "ui-ux-pro-max*", "frontend-design*"]`.

- [ ] **Step 4: Run the tests**

Run: `npm test -- providers mcp`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): add codex and openai image providers and course-media MCP server"
```

---

### Task 11: Brand file and style tokens

**Files:**
- Create: `src/brand/schema.ts`, `src/brand/tokens.ts`
- Modify: `src/cli.ts`
- Test: `test/brand.test.ts`

**Interfaces:**
- Produces:

```ts
interface Brand { name: string; logos?: { light?: string; dark?: string };
  colors: { primary: string; secondary?: string; neutral?: string[];
            semantic?: { success?: string; warning?: string; error?: string; info?: string } };
  fonts: { heading: string; body: string; mono?: string };
  voice?: string;
  imagery?: { style: 'illustration' | 'photo' | 'mixed'; do?: string[]; dont?: string[] } }
interface Tokens { color: { bg: string; fg: string; primary: string; primaryFg: string; accent: string; muted: string };
  font: { heading: string; body: string; mono: string }; space: number[]; radius: number }
function loadBrand(path: string): Brand                       // YAML; ValidationError on schema failure
function contrastRatio(a: string, b: string): number          // WCAG 2.x relative luminance formula
function deriveTokens(b: Brand): Tokens
function checkTokens(t: Tokens): ValidationIssue[]            // fg/bg ≥ 4.5, primaryFg/primary ≥ 4.5, accent/bg ≥ 3
```

- CLI: `brand validate <file>`, `style tokens --course <dir> --brand <file>`. The second command writes `05-media/style/tokens.json`. It exits 2 when `checkTokens` gives an error.

Brand source order for a course (decision): `course.yaml` `brand`, then the core `brand_config` setting, then `05-media/style/theme.yaml`. The `generate-style-guide` skill writes `theme.yaml` when the course has no brand.

- [ ] **Step 1: Write the failing tests**

```ts
test('contrastRatio black on white is 21', () => { expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1); });
test('contrastRatio #767676 on white is 4.54', () => { expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2); });
test('deriveTokens picks white or near-black text for primary to pass 4.5', () => {
  expect(contrastRatio(deriveTokens(brand).color.primaryFg, brand.colors.primary)).toBeGreaterThanOrEqual(4.5);
});
test('checkTokens gives an error for light grey text on white', () => { /* fg #aaaaaa, bg #ffffff */ });
test('loadBrand rejects a color that is not hex', () => { /* primary: "teal" */ });
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- brand`
Expected: FAIL.

- [ ] **Step 3: Write the modules**

`deriveTokens` sets `bg` = `#ffffff` and `fg` = the darkest neutral, or `#1a1a1a`. It sets `primaryFg` to the one of `#ffffff` and `#1a1a1a` that has the higher contrast. It sets `space` = `[4, 8, 12, 16, 24, 32, 48]` and `radius` = `6`.

- [ ] **Step 4: Run the tests**

Run: `npm test -- brand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit
git commit -m "feat(kit): add brand schema and WCAG-checked style tokens"
```

---

### Task 12: course-studio plugin skeleton, setup, brand and style skills

**Files:**
- Create: `plugins/course-studio/.claude-plugin/plugin.json`, `.mcp.json`, `README.md`
- Create: `plugins/course-studio/skills/course-kit/SKILL.md`, `skills/media-pedagogy/SKILL.md`, `skills/setup/SKILL.md`, `skills/setup-brand/SKILL.md`, `skills/generate-style-guide/SKILL.md`, `skills/plan-media/SKILL.md`
- Modify: `.claude-plugin/marketplace.json`, `README.md`
- Create: `plugins/course-studio/evals/` (cases below)

**Interfaces:**
- Consumes: the studio bundle and server bundle (Tasks 9–10). CLI commands from Tasks 7–11.
- Produces: `/course-studio:setup`, `/course-studio:setup-brand`, `/course-studio:generate-style-guide`, `/course-studio:plan-media`.

`plugin.json` values (copy them):

```json
{
  "name": "course-studio",
  "displayName": "Course Studio",
  "version": "0.1.0",
  "description": "Plan, generate, review and embed diagrams, charts and images for course-curriculum-creator courses",
  "author": { "name": "Reggie Chan" },
  "license": "MIT",
  "dependencies": ["course-curriculum-creator"],
  "userConfig": {
    "openai_api_key": { "type": "string", "title": "OpenAI API key", "description": "Optional. Used by the course-media server when Codex is not available", "sensitive": true, "default": "" },
    "default_media_budget_usd": { "type": "number", "title": "Default media budget (USD)", "description": "Spend cap for each new course", "default": 20, "min": 0 },
    "max_plan_images": { "type": "number", "title": "Plan-billed image cap", "description": "Cap for images billed to your ChatGPT plan (Codex) in each course", "default": 40, "min": 0 },
    "image_quality": { "type": "string", "title": "Image quality", "description": "Quality for generated images", "options": ["draft", "standard", "high"], "default": "standard" },
    "preferred_diagram_style": { "type": "string", "title": "Diagram style", "description": "hand-drawn prefers Excalidraw; clean prefers Mermaid", "options": ["hand-drawn", "clean"], "default": "clean" }
  }
}
```

`.mcp.json`:

```json
{ "mcpServers": { "course-media": {
  "command": "node",
  "args": ["${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-media-server.mjs"],
  "env": { "COURSE_MEDIA_OPENAI_KEY": "${user_config.openai_api_key}", "COURSE_MEDIA_DATA_DIR": "${CLAUDE_PLUGIN_DATA}" }
} } }
```

Skill content (each skill: frontmatter with `name`, `description`, `disable-model-invocation: true`, `allowed-tools`; knowledge skills use `user-invocable: false`):

- `course-kit` (knowledge): the same call form as the core skill, with the full command list.
- `media-pedagogy` (knowledge): the function taxonomy, with one line each for when to use it. Mayer's 5 principles (coherence, signaling, redundancy, contiguity, segmenting), with one check line each. The UDL rule of 2 or more representation modes. Accessibility rules: alt text of 125 characters or fewer, a long description for complex diagrams, and WCAG 2.2 AA contrast. The rule that a text-heavy function must use a diagram tool.
- `setup`: (1) Run `node --version` and stop if it is below 20. (2) Run `providers probe-codex`. (3) Look at your available tools for the patterns in `data/providers.yaml`. (4) Look at your available skills for the design companion names. (5) Run `providers record`. (6) Show a table of what is available. For each design companion that is missing, show the install command from spec §7.10 and one line on what it adds. Install nothing unless the user says yes. (7) Ask before `deps install mermaid-cli excalidraw-to-svg --data-dir "${CLAUDE_PLUGIN_DATA}"`.
- `setup-brand`: ask for name, colors, fonts, logos, voice and imagery with AskUserQuestion. The user can point to a website or PDF; extract values from it. Write `<name>.brand.yaml`. Run `brand validate`. Tell the user to set it as the core `brand_config` or as `brand` in `course.yaml`.
- `generate-style-guide`: find the brand with the source order from Task 11. If no brand exists, design a theme from the topic and audience. Load the detected design companions first (for example `ui-ux-pro-max` for palettes). Write `05-media/style/theme.yaml`. Run `style tokens`. If contrast fails, change the colors and run it again. Write `style-guide.md` and `prompt-anchors.md`. The prompt anchors are 1 fixed illustration-style paragraph, the palette words, the composition rules and the imagery do/don't lists.
- `plan-media`: run `manifest sync`. Read the lesson plans or the outline. Write `05-media/media-plan.yaml`. Each item has an objective, a module, a function and a provider choice; use the routing table in spec §7.6. Run `plan validate` and correct every error. Run `plan estimate`. Show a table for each module with the description, the function, the tool and the cost, and the totals against the budget. Ask the user to approve all items, approve per module, or edit. Set the item statuses. Write the media budget from `default_media_budget_usd` and `max_plan_images` into `course.yaml` if it has no `media` block.

- [ ] **Step 1: Write the eval cases**

- `setup-records-providers`: the case passes when `.course/providers.json` exists and has the key `designSkills`.
- `plan-media-rejects-decoration`: start from a fixture with lesson plans. The case passes when every item in `media-plan.yaml` has 1 or more objectives and `plan validate` exits 0.
- `style-guide-without-brand`: the case passes when `tokens.json` exists and `style tokens` exits 0.

- [ ] **Step 2: Run the evals**

Run: `claude plugin eval plugins/course-studio`
Expected: FAIL. The plugin does not exist.

- [ ] **Step 3: Write the plugin files and the skills**

Add the marketplace entry: `{"name": "course-studio", "source": "./plugins/course-studio", "description": "<same as plugin.json>", "category": "education"}`. Run `npm run build` to put the bundles in the plugin.

- [ ] **Step 4: Validate and run the evals**

Run: `claude plugin validate plugins/course-studio && claude plugin validate . && claude plugin eval plugins/course-studio`
Expected: validation passes. The 3 cases PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(studio): add course-studio plugin with setup, brand, style guide and media plan skills"
```

---

### Task 13: Generate, review and embed skills

**Files:**
- Create: `packages/course-kit/src/media/embed.ts`
- Modify: `packages/course-kit/src/cli.ts`
- Create: `plugins/course-studio/skills/generate-media/SKILL.md`, `skills/review-media/SKILL.md`, `skills/embed-media/SKILL.md`
- Test: `packages/course-kit/test/embed.test.ts`
- Create: eval cases in `plugins/course-studio/evals/`

**Interfaces:**
- Consumes: `Asset`, `loadRegistry`, `setStatus`, `loadPlan` (Task 7). `<!-- id: X -->` comments (Task 4). Renderers (Task 9). `generateAssetImage` (Task 10).
- Produces:

```ts
function embedAsset(markdown: string, asset: Asset | PlanItem, anchorId: string, relPath: string): string
function embedAll(courseDir: string): { file: string; embedded: string[]; placeholders: string[] }[]
```

The embed block is exact copy. For an approved asset:

```
<!-- media:A-M1-01 -->
![{alt}]({relPath})

*{caption}*

<details><summary>Description</summary>

{longDescription}

</details>
<!-- /media:A-M1-01 -->
```

Leave out the caption line and the `<details>` block when the field is empty. For a plan item, or for an asset that is not approved:

```
<!-- media:A-M1-01 -->
> **Media pending approval (A-M1-01):** {description}
<!-- /media:A-M1-01 -->
```

Placement (decision): put the block after the line `<!-- id: {anchorId} -->`, with one blank line. If the markers already exist, replace the content between them. `embedAll` writes to `02-design/lesson-plans.md`, `04-materials/student-handout.md` and `04-materials/instructor-guide.md`, when each file exists and has the module ID comment. `relPath` is relative to the file that it changes.

Skill content:
- `generate-media`: run `providers show`; if it gives nothing, run the `setup` steps 2–5. For each approved plan item, in module sequence:
  - kind `diagram`: use the Excalidraw connector when it is connected and the style is `hand-drawn`. Save the scene JSON to `05-media/src/<id>.excalidraw`. Save the share URL. Run `render excalidraw` to get the SVG. If the connector or the renderer is not available, write Mermaid to `05-media/src/<id>.mmd` and run `render mermaid`. If mermaid-cli is not available, use the Mermaid Chart connector. If no tool is available, write the SVG yourself.
  - kind `chart`: write a vega-lite spec to `05-media/src/<id>.vl.json`. Run `render vegalite`.
  - kind `image`: use `gen image --provider codex` when `codex.loggedIn` is true. Use the `course-media` MCP `generate_image` tool when Codex is not available. Use a detected third-party image tool as the last choice; run `ledger check` before you use it, then `registry add`. If no provider operates, keep the placeholder and tell the user.
  - Labels that an image needs: run `render overlay`. Do not ask the image model for text.
  - Exit code 3: stop. Show the totals. Ask the user to increase the budget or to stop.
  - Exit code 4: go to the next provider in the routing.
- `review-media`: for each asset with status `generated`, open the file and examine it. Record each `ReviewCheck` as pass, fail or n/a, with notes. Compare factual content with the lesson segment. When a check fails, generate the asset again one time; the budget applies. Then show it to the user. Write `alt`, `longDescription` (complex diagrams) and `caption`. Show each asset, or show them all together, and ask approve, reject or regenerate. Set `approved` with `approvedBy: 'user'` only after the user approves.
- `embed-media`: run `embed all`. Report the counts of embedded and placeholder blocks for each file.

- [ ] **Step 1: Write the failing tests**

```ts
test('embedAsset puts an approved block after the ID comment', () => {
  const out = embedAsset(md, approvedAsset, 'M1', '../05-media/out/A-M1-01.svg');
  expect(out).toContain('<!-- id: M1 -->\n\n<!-- media:A-M1-01 -->\n![Lease abstraction flow](../05-media/out/A-M1-01.svg)');
});
test('embedAsset run two times gives one block', () => {
  const once = embedAsset(md, approvedAsset, 'M1', p);
  expect(embedAsset(once, approvedAsset, 'M1', p)).toBe(once);
});
test('an unapproved asset gives the pending placeholder and no image link', () => {
  expect(embedAsset(md, generatedAsset, 'M1', p)).toContain('> **Media pending approval (A-M1-01):**');
  expect(embedAsset(md, generatedAsset, 'M1', p)).not.toContain('![');
});
test('approving later replaces the placeholder with the image block', () => { /* placeholder → approved */ });
test('embedAll skips files that do not exist and computes relPath for each file', () => {
  // lesson-plans.md → "../05-media/out/…"; handout absent
});
test('with no providers, embedAll writes only placeholders and the ledger stays empty', () => {
  // plan with 2 approved items, empty registry
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- embed`
Expected: FAIL.

- [ ] **Step 3: Write `embed.ts`, the CLI commands `embed <file> --asset <id> --anchor <id>` and `embed all`, and the 3 skills**

- [ ] **Step 4: Run the tests**

Run: `npm test -- embed`
Expected: PASS.

- [ ] **Step 5: Write the eval cases and run them**

- `generate-media-zero-providers`: no MCP, no Codex, no key. Plan: 1 diagram, 1 chart, 1 image. The case passes when the diagram and the chart have SVG files, the image is a placeholder, and the ledger is empty.
- `review-then-embed`: the case passes when only approved assets have image links in `lesson-plans.md`.

Run: `npm run build && claude plugin eval plugins/course-studio`
Expected: all cases PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(studio): add generate-media, review-media and embed-media"
```

---

### Task 14: migrate-course (minimal)

**Files:**
- Create: `packages/course-kit/src/migrate/v2.ts`
- Modify: `packages/course-kit/src/cli-core.ts`
- Create: `plugins/course-curriculum-creator/workflow/0-analysis/migrate-course/SKILL.md`
- Test: `packages/course-kit/test/migrate.test.ts`

**Interfaces:**
- Consumes: `syncManifest`, `parseOutline` (Task 4), `initManifest`, `saveManifest` (Task 3), `loadRegistry`, `addAsset`, `saveRegistry` (Task 7).
- Produces:

```ts
interface MigrationQuestion { id: string; text: string; default?: string }
interface MigrationReport { manifest: Manifest; actions: string[]; questions: MigrationQuestion[]; imported: string[] }
function parseDuration(s: string): { shape: Shape; days?: number }
function migrateV2(courseDir: string, o: { dryRun: boolean; answers?: Record<string, string> }): MigrationReport
```

Rules (decisions):
- `parseDuration`: `"1-day"` → workshop, 1. `"2-day"` → workshop, 2. Any `N-day` with N > 2, or text with `weekend` or `week` → cohort, N. No match → workshop, with a question `shape`.
- Title, `status`, `organization` and `audience` come from `01-planning/course-positioning.md` frontmatter. Frontmatter keys that v3 does not use go into `extra`.
- Sessions and modules come from `syncManifest`.
- Every `.pdf` with a `.md` that has the same base name → `sources` role `derived`, `of` = the `.md` path.
- Every `.md` in `02-design/` whose name starts with `course-outline-` → role `variant`, `of` = `02-design/course-outline.md`.
- Every `.md` in `01-planning/` that is not a v2 standard file → role `source`.
- Every `.md` in `04-materials/` that is not `README.md` → role `material`.
- Every relative link in `README.md` to a path outside the course → role `external`.
- Every `.png`, `.jpg` or `.svg` in `04-materials/` → registry asset with status `imported`, id `IMG-<basename>`, `alt: ''`. Add a question `alt:<id>` for each.
- `stages`: `present` when the standard file exists, `missing` when it does not. A placeholder `04-materials/README.md` with `[To be generated]` does not count as materials.
- With `dryRun: true`, write no file. With `dryRun: false`, write `course.yaml`, the registry and the ID comments. Never delete or move a file.

- [ ] **Step 1: Write the failing tests**

```ts
test('parseDuration "4-day (two weekends)" gives cohort with 4 days', () => {
  expect(parseDuration('4-day (two weekends)')).toEqual({ shape: 'cohort', days: 4 });
});
test('CRE-201 migration report', () => {
  const r = migrateV2(fixtureCopy, { dryRun: true });
  expect(r.manifest.shape).toBe('cohort');
  expect(r.manifest.timeBudget.live!.sessions).toHaveLength(4);
  expect(r.manifest.sources).toEqual(expect.arrayContaining([
    { path: '01-planning/teaching-notes.md', role: 'source' },
    { path: '02-design/course-outline-1day.md', role: 'variant', of: '02-design/course-outline.md' },
    { path: '01-planning/course-positioning.pdf', role: 'derived', of: '01-planning/course-positioning.md' },
    { path: '../CRE_Series_Framework.md', role: 'external' },
  ]));
  expect(r.imported).toEqual(['IMG-bmc', 'IMG-vpd']);
  expect(r.manifest.stages).toMatchObject({ lessonPlans: 'missing', materials: 'missing', rubrics: 'present' });
  expect(r.manifest.extra).toMatchObject({ revisionNote: expect.any(String) });
});
test('dry run writes no file', () => { /* compare the folder listing and hashes before and after */ });
test('a real run then manifest validate gives no errors', () => { /* migrate with answers, then validateManifest */ });
test('a real run on an already migrated course changes nothing', () => { /* run twice; second report actions = [] */ });
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- migrate`
Expected: FAIL.

- [ ] **Step 3: Write `v2.ts`**

- [ ] **Step 4: Run the tests**

Run: `npm test -- migrate`
Expected: PASS.

- [ ] **Step 5: Write the `migrate-course` skill**

Steps: (1) Run `migrate-course` with `--dry-run`. (2) Show the actions and the inferred shape and sessions. (3) Ask each question with AskUserQuestion. For `alt:` questions, open the image first and propose alt text. (4) Run it again with the answers and without `--dry-run`. (5) Run `manifest validate` and show the result. Tell the user that the old files did not move.

CLI form: `migrate-course --course <dir> [--dry-run] [--answers <json>]`.

- [ ] **Step 6: Build and validate**

Run: `npm run build && claude plugin validate plugins/course-curriculum-creator`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(core): add migrate-course for v2 course folders"
```

---

### Task 15: End-to-end check and release documents

**Files:**
- Create: `docs/superpowers/plans/2026-10-31-v3-phase1-manual-tests.md`
- Modify: `README.md`, `plugins/course-studio/README.md`
- Create: `examples/` sample result (optional, see Step 3)

**Interfaces:**
- Consumes: all tasks.

- [ ] **Step 1: Write the manual test script**

Write one numbered procedure for each item. Give the command and the expected result for each step.
1. Claude Code, zero MCPs, no Codex, no key: run `setup`, `generate-style-guide`, `plan-media`, `generate-media`, `review-media` and `embed-media` on a copy of v2-sample. Expected: diagrams and a chart are embedded, image items are placeholders, and the ledger is empty.
2. Claude Code with Codex logged in: one image item. Expected: a PNG, `quotaUnits` 1 in the ledger, and the prompt file ends with the no-text rule.
3. Claude Code with the Excalidraw connector connected and `preferred_diagram_style: hand-drawn`. Expected: an `.excalidraw` source, a share URL and an SVG.
4. Budget: set `budgetUsd: 0.01` and use the OpenAI provider. Expected: exit code 3 and no API call.
5. Cowork session on the local computer: run `setup` and `plan-media`. Expected: the bundle path resolves and `course-media` loads with no key and reports "not configured". If `${CLAUDE_PLUGIN_ROOT}` does not resolve in Cowork, record the result and open an issue before you release.
6. CRE-201 copy: run `migrate-course`. Expected: cohort, 4 sessions, 2 imported images with alt text after the questions.

- [ ] **Step 2: Do the manual tests**

Record pass or fail for each item in the same file. A fail on item 1, 4 or 6 stops the release.

- [ ] **Step 3: Update the READMEs**

Root README: list the two plugins and their install commands. Add a "Recommended companions" section with the table from spec §7.10. Studio README: the skills in sequence, the provider routing table, the budget settings and the exit codes.

- [ ] **Step 4: Run all checks**

Run: `npm test && npm run check && claude plugin validate . && claude plugin eval plugins/course-curriculum-creator && claude plugin eval plugins/course-studio`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add Phase 1 manual tests and update READMEs for core 2.1.0 and course-studio 0.1.0"
```

---

## Spec coverage (Phase 1)

| Spec item | Task |
|---|---|
| Monorepo restructure, marketplace entries (§7.1, R10) | 1, 12 |
| `course-kit` bundled into each plugin, CI freshness check (§7.1) | 5, 9, 10 |
| Surface rules: no `bin/`, MCP defaults, scripts in skill folders (§7.1a) | 5, 12, 15 |
| `course.yaml` schema, IDs, staleness in code (§7.2) | 2, 3, 4 |
| `create-course` writes `course.yaml` (§11 Phase 1) | 6 |
| `migrate-course` minimal, CRE-201 fixture (§8.5) | 14 |
| Media pipeline plan → approve → generate → review → embed (§7.4) | 12, 13 |
| Function taxonomy, objective link, Mayer, UDL checks (§7.4) | 7, 12 |
| Text-free images and label overlays (§7.4) | 9, 10 |
| Brand config and per-course style guide (§7.5) | 11, 12 |
| Provider detection, Codex, course-media server, routing (§7.6) | 10, 12, 13 |
| Cost ledger, budget cap, plan-image cap (§7.6) | 8, 10 |
| Design companions: detect, recommend, use (§7.10) | 10, 12, 15 |
| Release mapping core 2.1.0 / studio 0.1.0 (§11) | 6, 12, 15 |

Phases 2–6 are not in this plan.
