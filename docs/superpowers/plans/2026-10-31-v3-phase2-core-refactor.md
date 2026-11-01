# v3 Phase 2 — Core Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Language:** The text of this plan obeys ASD-STE100 Simplified Technical English. Code, commands, file names and quoted strings do not obey STE100.

**Goal:** Make the core plugin a v3.0.0 release. It gets one conventions skill, staleness and progress done by code, first-class cohort and self-paced shapes, a resumable architect, a quality audit in code, a full `migrate-course`, golden sample courses, evals and WCAG 2.2 AA.

**Architecture:** New logic goes into the TypeScript toolkit (`packages/course-kit`) as core commands, so both plugin bundles get it. A new knowledge skill, `course-conventions`, holds the settings, the manifest rules, the staleness procedure, the shape rules and the question style one time. Workflow skills and agents point to it and call the toolkit. A lint test in the toolkit test suite enforces this on the skill files.

**Tech Stack:** Node ≥ 20, TypeScript, vitest, esbuild, zod, yaml (all already in the repository). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-31-v3-blended-course-studio-design.md`. Phase 2 is in spec §11. Read spec §4 (findings R1–R9), §7.2, §7.3, §8 and §12 before you start.

## Global Constraints

- Node ≥ 20 is necessary. Do not write prose fallbacks for logic that `course-kit` does (spec §7.1).
- Core plugin version: `3.0.0` (spec §11, release mapping: "Phase 2 ships core v3.0.0 with the breaking changes and the full `migrate-course`").
- The breaking change: core workflow skills need `course.yaml`. If it is missing, the skill stops and tells the user to run `/course-curriculum-creator:migrate-course` (v2 folder) or `/course-curriculum-creator:create-course` (new course). `create-course`, `migrate-course`, `design-series`, `list-templates` and `create-from-template` do not need an existing `course.yaml`.
- Hashes stay in the v2 format: the first 8 hex characters of the MD5 of the file, in frontmatter `sourceHashes`, with the paths in `sourceFiles`.
- ID comments stay `<!-- id: X -->` on the line after the heading (Phase 1 decision; not `{#X}`).
- Workflow skills keep `disable-model-invocation: true`. The new `course-conventions` skill sets `user-invocable: false`.
- Do not put a top-level `bin/` in a plugin. The toolkit bundle stays in `skills/course-kit/scripts/`.
- CLI output is JSON on stdout. Exit codes: `0` success, `1` usage error, `2` validation error, `3` budget exceeded, `4` provider not available.
- New toolkit commands go in `packages/course-kit/src/commands-core.ts`, so the core and the studio bundles both have them. After a toolkit change, run `npm run build` and commit the changed bundles. `npm run check` must pass at the end of each task.
- Existing userConfig keys stay (spec §8 item 8). `default_duration` applies only to the workshop shape.
- Accessibility target: WCAG 2.2 AA (spec §8 item 7, finding R9).

## Review Focus

1. **A v2 folder with no `course.yaml`.** A user runs a v3 workflow skill, for example `generate-rubrics`, on an old folder. Expected: the skill stops and offers `migrate-course`. It does not write a new `course.yaml` by itself. The lint test in Task 6 checks that every workflow skill that needs `course.yaml` points to `course-conventions`, and Task 6 puts the rule there.
2. **An output with no `sourceFiles` frontmatter.** A hand-written or v1 file. Expected: `progress` and `audit` report it as `present`, not `stale`, and do not fail. Test in Task 2.
3. **A self-paced course copied from a workshop.** Modules still name a session. Expected: `manifest validate` gives an error for each such module. Test in Task 1.
4. **Cohort outline headings.** `## Session 3: …` and `## Week 2: …` make sessions; `## Weekend 1, Day 1 …` stays one session (Day wins) and `## Week Gap …` makes no session. Test in Task 1.
5. **A bad migration answer.** The user gives an image an objective ID that does not exist. Expected: exit 2 and no file changes. Test in Task 4.

---

## File Structure

```
packages/course-kit/
  src/manifest/schema.ts        shape rules types; StageName list; stage statuses; InitOptions.async
  src/manifest/io.ts            validateManifest shape rules; initManifest async
  src/manifest/summary.ts       NEW summarizeManifest, SHAPE_RULES
  src/manifest/sync.ts          parseOutline: Session N / Week N headings
  src/manifest/progress.ts      NEW STAGES table, computeProgress, writeProgress, setSkipped
  src/audit.ts                  NEW auditCourse
  src/hash.ts                   setSources (used by hash-write --sources)
  src/migrate/v2.ts             delivery, audience level, session count, image objectives, changes, stages from progress
  src/commands-core.ts          new commands
  test/summary.test.ts  test/progress.test.ts  test/audit.test.ts  test/samples.test.ts  test/skills-lint.test.ts   NEW
plugins/course-curriculum-creator/
  skills/course-conventions/SKILL.md          NEW knowledge skill
  skills/course-kit/SKILL.md                  new commands
  examples/courses/workshop/  cohort/  self-paced/     NEW golden sample courses
  workflow/**/SKILL.md                        refactored (Tasks 7–9)
  agents/curriculum-architect.md  agents/quality-reviewer.md   (Task 10)
  skills/{blooms-taxonomy,backward-design-methodology,universal-design-for-learning,virtual-facilitation}/  (Task 11)
  evals/                                      new cases (Tasks 12–13)
  .claude-plugin/plugin.json                  3.0.0 (Task 14)
README.md                                     v3 notes (Task 14)
```

**Decision (my call, spec §13 leaves it to the builder):** The architect runs each stage in its own context, one stage at a time, and writes progress to `course.yaml` after each stage. It does not start subagents. A new architect run reads the progress and continues at the next stage.

**Decision (my call):** Spec §8 item 4 asks the quality reviewer to check "hub item coverage of objectives". The hub does not exist until Phase 3. Phase 3 adds that check to `audit`. Phase 2 does not.

**Decision (my call):** Spec §8 item 5 lists "integration pauses" among objective numbering. In CRE-201 they are outline segments (`### Integration Pause 1`), not objectives. Migration keeps them as outline text. The `integration` kind stays in the schema for courses that write `## Integration Objective N:` headings (Task 4 adds that heading).

**Decision (my call):** `generate-artifacts --type slides` stays until Phase 4 ships `course-studio:generate-slides` (spec §7.7). Phase 2 does not remove it.

---

### Task 1: Shape rules, time budget summary and cohort outline headings

**Files:**
- Create: `packages/course-kit/src/manifest/summary.ts`, `packages/course-kit/test/summary.test.ts`
- Modify: `packages/course-kit/src/manifest/schema.ts`, `packages/course-kit/src/manifest/io.ts`, `packages/course-kit/src/manifest/sync.ts`, `packages/course-kit/src/commands-core.ts`, `packages/course-kit/test/manifest.test.ts`, `packages/course-kit/test/sync.test.ts`

**Interfaces:**
- Produces:
  - `InitOptions.async?: { preWorkMinutes: number; betweenSessionMinutes: number; postWorkMinutes: number }`. When it is given, `initManifest` writes it to `timeBudget.async` for every shape. When it is not given, the current behaviour stays.
  - `SHAPE_RULES: Record<Shape, string[]>` and `summarizeManifest(m: Manifest): ManifestSummary` in `summary.ts`:
    ```ts
    interface ManifestSummary {
      id: string; title: string; shape: Shape; delivery: Delivery;
      sessions: { id: string; label: string; minutes: number; modules: string[]; plannedMinutes: number }[];
      liveMinutes: number;                       // sum of session minutes
      asyncMinutes: { preWork: number; betweenSessions: number; postWork: number; total: number };
      unscheduledModules: string[];              // modules with no session
      objectives: number; modules: number;
      rules: string[];                           // SHAPE_RULES[shape]
    }
    ```
  - CLI: `manifest summary --course "<dir>"` prints `ManifestSummary`.

- [ ] **Step 1: Write the failing tests**

In `summary.test.ts`:
- `summarizeManifest gives sessions with their modules and planned minutes`: a cohort manifest with sessions S1 (90), S2 (90) and modules M1 (S1, 50), M2 (S1, 30), M3 (S2, 90). Expect `sessions[0].modules` = `['M1','M2']`, `sessions[0].plannedMinutes` = 80, `liveMinutes` = 180.
- `summarizeManifest of a self-paced course lists every module as unscheduled`: expect `sessions` = `[]`, `liveMinutes` = 0, `unscheduledModules` = all module IDs, `asyncMinutes.total` = sum of the three async values.
- `rules are the exact shape rules`: `summarizeManifest(m).rules` equals `SHAPE_RULES[m.shape]` for each shape, and `SHAPE_RULES` equals exactly:
  ```ts
  {
    workshop: [
      'Workshop: 1 or 2 live sessions. Give pre-work before the first session and spaced practice after the last session.',
    ],
    cohort: [
      'Cohort: open each session with retrieval practice on the previous session.',
      'Cohort: give a transfer assignment and discussion prompts between sessions.',
      'Cohort: write facilitator notes for each session.',
    ],
    'self-paced': [
      'Self-paced: there are no live sessions. The learner hub is the primary delivery surface.',
      'Self-paced: use more worked examples, and fade the scaffolding across modules.',
      'Self-paced: end every module with interactive practice and feedback.',
      'Self-paced: give a time-on-task estimate for every module and activity.',
      'Self-paced: make assessments auto-checkable items, or self-assessment with model answers.',
    ],
  }
  ```
- `manifest summary CLI prints the summary` (use the CLI helper that the other CLI tests use).

In `manifest.test.ts` add:
- `a self-paced module that names a session is an error`: one error for each such module, path `modules[i].session`, message contains `self-paced`.
- `a self-paced course with no async time budget is a warning`.
- `a cohort with fewer than 2 sessions is a warning`.
- `a workshop or cohort with no sessions is a warning`.
- `module minutes in one session above the session minutes is a warning`: S1 = 90, M1 = 60 and M2 = 60 in S1 → one warning, path `timeBudget.live.sessions[0]`, message contains `120` and `90`. No warning when the session has 0 minutes.
- `initManifest writes the async budget when it is given`, for a workshop.

In `sync.test.ts` add `cohort outline headings make sessions`: an outline with `## Session 1: Kickoff`, `## Week 2: Cash flows`, `## Weekend 1, Day 3 (Saturday): Tools`, `## Week Gap (5 business days)`. Expect session IDs `S1`, `S2`, `S3` (Day wins over Weekend), and no session for Week Gap.

- [ ] **Step 2: Run the tests and make sure they fail**

Run: `npm test -- summary manifest sync`
Expected: FAIL (missing module `summary.ts`, missing rules).

- [ ] **Step 3: Implement**

- In `parseOutline`, a `##` heading is a session when it matches, in this order: `\bDay\s+(\d+)\b`, `\bSession\s+(\d+)\b`, `\bWeek\s+(\d+)\b`. The `Schedule Summary` rule stays. The ID is `S<n>`.
- Add the new checks to `validateManifest` with the levels in Step 1.
- Add the `manifest summary` command.

- [ ] **Step 4: Run all tests, the type check and the bundle check**

Run: `npm test && (cd packages/course-kit && npx tsc --noEmit -p .) && npm run check`
Expected: all pass. (If `npm run check` shows a diff, run `npm run build` and commit the bundles in Step 5.)

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit plugins/*/skills/course-kit/scripts
git commit -m "feat(kit): shape rules, time budget summary, cohort session headings"
```

---

### Task 2: Stage progress and `hash-write --sources`

**Files:**
- Create: `packages/course-kit/src/manifest/progress.ts`, `packages/course-kit/test/progress.test.ts`
- Modify: `packages/course-kit/src/manifest/schema.ts`, `packages/course-kit/src/hash.ts`, `packages/course-kit/src/commands-core.ts`, `packages/course-kit/test/hash.test.ts`

**Interfaces:**
- Consumes: `checkStale(outputPath, courseDir)` from `hash.ts`; `loadManifest`, `saveManifest`.
- Produces:
  - `StageNameSchema` = `positioning, needsAnalysis, learnerProfile, objectives, rubrics, outline, lessonPlans, preWork, materials, description, transferPlan, evaluationPlan, spacedPractice, virtualAdaptation` (this order). Stage status in `course.yaml` `stages`: `present | missing | stale | skipped`. Old files that have only `present`/`missing` stay valid.
  - `STAGES: StageDef[]` in `progress.ts`, in the order below:
    ```ts
    interface StageDef { name: StageName; skill: string; outputs: string[]; required: boolean; when?: 'virtual-or-hybrid' }
    ```
    | name | skill (path from plugin root) | outputs | required |
    |---|---|---|---|
    | positioning | `workflow/0-analysis/create-course/SKILL.md` | `01-planning/course-positioning.md` | yes |
    | needsAnalysis | `workflow/0-analysis/assess-needs/SKILL.md` | `01-planning/training-needs-analysis.md` | no |
    | learnerProfile | `workflow/0-analysis/generate-learner-profile/SKILL.md` | `01-planning/learner-profile.md` | yes |
    | objectives | `workflow/1-desired-results/generate-objectives/SKILL.md` | `01-planning/learning-objectives.md` | yes |
    | rubrics | `workflow/2-assessment-evidence/generate-rubrics/SKILL.md` | `03-assessment/rubrics.md` | yes |
    | outline | `workflow/3-learning-plan/generate-outline/SKILL.md` | `02-design/course-outline.md` | yes |
    | lessonPlans | `workflow/3-learning-plan/generate-lesson-plans/SKILL.md` | `02-design/lesson-plans.md` | yes |
    | preWork | `workflow/3-learning-plan/generate-pre-work/SKILL.md` | `04-materials/pre-work.md` | yes |
    | materials | `workflow/4-materials/generate-artifacts/SKILL.md` | `04-materials/student-handout.md`, `04-materials/instructor-guide.md` | no |
    | description | `workflow/4-materials/generate-description/SKILL.md` | `01-planning/course-description.md` | yes |
    | transferPlan | `workflow/3-learning-plan/generate-transfer-plan/SKILL.md` | `04-materials/transfer-plan.md` | no |
    | evaluationPlan | `workflow/2-assessment-evidence/generate-evaluation-plan/SKILL.md` | `03-assessment/evaluation-plan.md` | no |
    | spacedPractice | `workflow/6-delivery/generate-spaced-practice/SKILL.md` | `04-materials/spaced-practice.md` | yes |
    | virtualAdaptation | `workflow/4-materials/adapt-for-virtual/SKILL.md` | `02-design/virtual-adaptation.md` | yes, `when: 'virtual-or-hybrid'` |
  - `computeProgress(courseDir: string): Progress`:
    ```ts
    interface StageProgress { name: StageName; skill: string; output: string; status: 'present'|'missing'|'stale'|'skipped'; required: boolean; changed: string[] }
    interface Progress { stages: StageProgress[]; next: { name: StageName; skill: string } | null }
    ```
    A stage with `when: 'virtual-or-hybrid'` is in the list only when `manifest.delivery` is `virtual` or `hybrid`. `output` is the first output that exists, else the first output. Status: `skipped` when `course.yaml` records `skipped` for the stage; else `missing` when no output exists; else `stale` when `checkStale` gives `stale` (`changed` from it); else `present`. An output with no `sourceFiles` is `present`. `next` is the first required stage with status `missing` or `stale`, else `null`.
  - `writeProgress(courseDir): Progress` saves `stages` (name → status) to `course.yaml` and returns the progress.
  - `setSkipped(courseDir, stage: StageName, skipped: boolean): Progress`. `skipped: false` removes the record, then the stage gets its computed status.
  - `setSources(outputPath: string, sources: Record<string, string>): void` in `hash.ts`: writes frontmatter `sourceFiles` (keys in the given order). Paths are relative to the course folder.
  - CLI:
    - `progress --course "<dir>" [--write]` prints `Progress`.
    - `progress skip <stage> --course "<dir>"` and `progress unskip <stage> --course "<dir>"`. An unknown stage is a usage error (exit 1).
    - `hash-write <output> --course "<dir>" [--sources '<json object>']`: with `--sources`, call `setSources` first, then write the hashes. A source path that does not exist is a validation error (exit 2) and nothing is written.

- [ ] **Step 1: Write the failing tests**

In `progress.test.ts` (build course folders in a temp folder with `initManifest` + `saveManifest`):
- `a new course has positioning present and learnerProfile next`.
- `a stale output is reported stale with the changed keys, and is next`: objectives file with `sourceFiles: {positioning: 01-planning/course-positioning.md}` and an old hash.
- `an output with no sourceFiles is present`.
- `optional stages are never next`: all required outputs present, `transferPlan` missing → `next` is `null`.
- `virtualAdaptation is listed only for virtual or hybrid delivery`.
- `materials uses the instructor guide when there is no handout`.
- `skip then unskip`: `setSkipped(dir,'learnerProfile',true)` → status `skipped` and `next` is `objectives`; `course.yaml` has `stages.learnerProfile: skipped`; unskip removes it.
- `writeProgress saves the statuses and a second run gives the same file`.
- `progress CLI: unknown stage is exit 1`.

In `hash.test.ts`:
- `hash-write --sources sets sourceFiles and sourceHashes, then stale is fresh`.
- `hash-write --sources with a missing source file is exit 2 and the file does not change`.

- [ ] **Step 2: Run the tests and make sure they fail**

Run: `npm test -- progress hash`
Expected: FAIL.

- [ ] **Step 3: Implement** `progress.ts`, `setSources`, the schema change and the commands.

- [ ] **Step 4: Run all tests, the type check and the bundle check**

Run: `npm test && (cd packages/course-kit && npx tsc --noEmit -p .) && npm run check`
Expected: all pass. The migration tests from Phase 1 must still pass.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit plugins/*/skills/course-kit/scripts
git commit -m "feat(kit): stage progress and hash-write --sources"
```

---

### Task 3: Course audit for the quality reviewer

**Files:**
- Create: `packages/course-kit/src/audit.ts`, `packages/course-kit/test/audit.test.ts`
- Modify: `packages/course-kit/src/commands-core.ts`

**Interfaces:**
- Consumes: `validateManifest`, `computeProgress` (Task 2), `loadRegistry`, `loadPlan` (`media/plan.ts`; a missing plan or registry file is the same as an empty one — use the existing loaders' behaviour, and treat "no file" as empty).
- Produces: `auditCourse(courseDir: string): AuditReport` and CLI `audit --course "<dir>"`. The CLI always exits 0 when `course.yaml` loads; a bad `course.yaml` is exit 2.
  ```ts
  interface AuditIssue { level: 'error' | 'warning' | 'info'; check: AuditCheck; path: string; message: string }
  type AuditCheck = 'manifest' | 'objective-coverage' | 'stale' | 'media-links' | 'media-alt' | 'media-long-description' | 'udl-representation';
  interface AuditReport { ok: boolean; issues: AuditIssue[]; counts: { error: number; warning: number; info: number } }
  ```
  `ok` is `true` when there are no errors.

Checks:
| check | level | rule |
|---|---|---|
| `manifest` | as given | every `validateManifest` issue; `path` as given |
| `objective-coverage` | warning | an objective of kind `cognitive` or `affective` that no module lists; path `objectives[i]` |
| `stale` | warning | every stage with status `stale`; path = the stage output; message lists `changed` |
| `media-links` | error | a registry asset or a plan item with an objective or a module ID that is not in `course.yaml`; path `registry:<id>` or `plan:<id>` |
| `media-alt` | error / warning | an `approved` asset with empty `alt` is an error; an `imported` asset with empty `alt` is a warning; path `registry:<id>` |
| `media-long-description` | warning | an `approved` asset of kind `diagram` or `chart` with no `longDescription` |
| `udl-representation` | info | a module that no registry asset (any status except `rejected`) and no plan item names; message: `module <id> has only text; plan at least one other representation (UDL)` |

- [ ] **Step 1: Write the failing tests** — one test for each row of the table (a fixture that triggers that check and only that check), plus:
- `a clean sample course gives ok true and no errors`.
- `a course with no 05-media folder gives no media errors`.
- `audit CLI exits 0 with errors in the report, and exits 2 for a bad course.yaml`.

- [ ] **Step 2: Run the tests and make sure they fail**

Run: `npm test -- audit`
Expected: FAIL.

- [ ] **Step 3: Implement** `auditCourse` and the `audit` command.

- [ ] **Step 4: Run all tests, the type check and the bundle check**

Run: `npm test && (cd packages/course-kit && npx tsc --noEmit -p .) && npm run check`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add packages/course-kit plugins/*/skills/course-kit/scripts
git commit -m "feat(kit): course audit for the quality reviewer"
```

---

### Task 4: Full `migrate-course`

**Files:**
- Modify: `packages/course-kit/src/migrate/v2.ts`, `packages/course-kit/src/manifest/sync.ts`, `packages/course-kit/test/migrate.test.ts`, `packages/course-kit/test/sync.test.ts`

**Interfaces:**
- Consumes: `computeProgress` (Task 2) for `stages`.
- Produces (additions to the Phase 1 behaviour; everything that exists stays):
  - `parseDuration(s): { shape: Shape; days?: number; sessions?: number }`. New rules, in this order before the current ones: `/self-paced|on-demand|asynchronous/i` → `self-paced`; `/(\d+)\s*-?\s*(?:sessions?|weeks?)\b/i` → `cohort` with `sessions: n`. The current day rules and their tests stay.
  - `MigrationReport.changes: { file: string; change: 'create' | 'modify'; added: number; removed: number }[]`. One entry for each file that a real run writes (`course.yaml`, `05-media/registry.json`, each file with ID comments). `added`/`removed` are counts of lines in the new text that are not in the old text, and the opposite, as a multiset difference. A dry run gives the same `changes` as the real run.
  - Delivery: positioning frontmatter `deliveryMode` (or `delivery`) of `in-person`, `virtual` or `hybrid` sets `delivery`. Another non-empty value adds the question `{ id: 'delivery', text: 'What is the delivery mode: in-person, virtual or hybrid?', default: 'in-person' }`. No value: `in-person`, no question. The answer must be one of the three (else `ValidationError`).
  - Audience: frontmatter `audienceLevel` (a string) sets `audience.level`; else `professional`.
  - Sessions from a count: when the outline gives no sessions and `parseDuration` gives `days` or `sessions` (shape not self-paced), make sessions `S1…Sn`, labels `Day k` (from days) or `Session k` (from sessions), minutes from the answer `sessionMinutes`. Without that answer, add the question `{ id: 'sessionMinutes', text: 'How many minutes is each live session?', default: '420' }` (days) or default `'90'` (sessions), and use the default in the report. The answer must be a positive integer (else `ValidationError`).
  - Image objectives: for each imported image with no objectives, add the question `{ id: 'objectives:<asset id>', text: 'Which objectives does 04-materials/<name> support? Give IDs separated by commas, for example LO-1, LO-3. Leave it empty for none.' }`. The answer sets `asset.objectives` (trimmed, empty entries removed). Every ID must be in the migrated objectives, else `ValidationError` naming the bad ID. An empty answer is permitted and gives `[]`.
  - Answer checks happen before any write. A `ValidationError` leaves every file as it was.
  - `stages` in the migrated `course.yaml` come from `computeProgress` (after the run), as name → status.
  - Objectives parser (`parseObjectives` in `sync.ts`): also read `### Integration Objective <id>: <title>` as kind `integration`, ID `LO-<id>`.

- [ ] **Step 1: Write the failing tests** in `migrate.test.ts`:
- `parseDuration reads self-paced and session or week counts`: `'self-paced online'` → self-paced; `'6 sessions'` → cohort, sessions 6; `'8-week cohort'` → cohort, sessions 8; `'4-day (two weekends)'` → cohort, days 4 (unchanged).
- `deliveryMode virtual is read; an unknown value asks; a bad answer is exit 2`.
- `a 6-session course with no outline sessions gets S1..S6 and asks sessionMinutes`; with the answer `'120'` every session has 120 minutes.
- `CRE-201 asks objectives for bmc and vpd; answers set them`: answers `{"objectives:IMG-bmc":"LO-3", "objectives:IMG-vpd":"LO-3, LO-2"}` → registry assets have those objectives.
- `an unknown objective ID in an answer is exit 2 and no file changes` (compare all file texts before and after, through the CLI).
- `dry run changes equal the real run changes, and the second real run has no changes`.
- `stages come from progress` (CRE-201: `lessonPlans: missing`, `outline: present`).

In `sync.test.ts`: `Integration Objective headings are kind integration`.

Update the Phase 1 CRE-201 tests if the new questions change their expected `questions` list. Do not remove an assertion; change only its expected value, and say why in the commit message.

- [ ] **Step 2: Run the tests and make sure they fail**

Run: `npm test -- migrate sync`
Expected: FAIL.

- [ ] **Step 3: Implement** the additions.

- [ ] **Step 4: Run all tests, the type check and the bundle check**

Run: `npm test && (cd packages/course-kit && npx tsc --noEmit -p .) && npm run check`
Expected: all pass.

- [ ] **Step 5: Update `plugins/course-curriculum-creator/workflow/0-analysis/migrate-course/SKILL.md`**

- Step 2 shows `changes` as a table (file, create/modify, +added, −removed).
- Step 3 lists the new questions: `delivery`, `sessionMinutes`, `objectives:<id>`. For `objectives:<id>`, show the objective IDs and titles from `manifest.objectives` in the dry-run output, and propose the IDs that match what the image shows.
- Step 5 runs `audit` after `manifest validate` and shows its issues.
- Step 6 says that core v3 skills need `course.yaml`, so a v2 folder must be migrated before other workflow skills run.
- Add `course-conventions` to the skill (Task 6 creates it; refer to it by name: "Load the `course-curriculum-creator:course-conventions` skill").

- [ ] **Step 6: Commit**

```bash
git add packages/course-kit plugins/course-curriculum-creator plugins/course-studio/skills/course-kit/scripts
git commit -m "feat(kit): full migrate-course (delivery, sessions, image objectives, diff summary)"
```

---

### Task 5: Golden sample courses, one for each shape

**Files:**
- Create: `plugins/course-curriculum-creator/examples/courses/workshop/`, `.../cohort/`, `.../self-paced/` — each with `course.yaml`, `01-planning/course-positioning.md`, `01-planning/learning-objectives.md`, `02-design/course-outline.md`
- Create: `packages/course-kit/test/samples.test.ts`

**Interfaces:**
- Consumes: `loadManifest`, `validateManifest`, `syncManifest`, `computeProgress`, `auditCourse`, `summarizeManifest`.
- Produces: three sample courses that later evals copy as fixtures (Tasks 12–13). Use these titles and shapes exactly:
  | folder | title | shape | delivery | sessions | modules | objectives |
  |---|---|---|---|---|---|---|
  | `workshop` | Lease Basics | workshop | in-person | `## Day 1: …` one session, 420 min | 3 | LO-1…LO-3 |
  | `cohort` | Underwriting Lab | cohort | virtual | `## Session 1…4: …`, 90 min each | 4 (one for each session) | LO-1…LO-4 |
  | `self-paced` | Cap Rates for New Analysts | self-paced | async | none | 3, each `(est. N min)` | LO-1…LO-3 |

  Write the markdown in the formats that the v2 templates use and that `parseObjectives`/`parseOutline` read (`### Objective N: …` with `**Cognitive Level:** …`; `### Module N: Title (… min)`; module bodies name `Objective N`). Write `course.yaml` with `manifest init` and then `manifest sync --write`, so the ID comments are in the files. The self-paced course has `timeBudget.async` with non-zero minutes. The content is short and real (commercial real estate topics), not lorem ipsum.

- [ ] **Step 1: Write the failing test** `samples.test.ts`, for each sample folder (copy it to a temp folder first):
- `manifest validate gives no errors`.
- `sync (write false) gives the same objectives and modules as course.yaml`.
- `audit gives ok true`.
- `progress next is learnerProfile`.
- `summary rules match the shape` and, for cohort, every session has one module; for self-paced, `unscheduledModules` has 3 IDs.

- [ ] **Step 2: Run it and make sure it fails** (`npm test -- samples`; the folders do not exist yet).

- [ ] **Step 3: Write the sample courses.**

- [ ] **Step 4: Run all tests**

Run: `npm test && npm run check`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add plugins/course-curriculum-creator/examples/courses packages/course-kit/test/samples.test.ts
git commit -m "feat(core): golden sample courses for workshop, cohort and self-paced"
```

---

### Task 6: `course-conventions` knowledge skill and the skills lint test

**Files:**
- Create: `plugins/course-curriculum-creator/skills/course-conventions/SKILL.md`, `packages/course-kit/test/skills-lint.test.ts`
- Modify: `plugins/course-curriculum-creator/skills/course-kit/SKILL.md`

**Interfaces:**
- Produces:
  - Skill `course-curriculum-creator:course-conventions` (frontmatter: `name: course-conventions`, `user-invocable: false`, a description that starts `"Shared rules for every course-curriculum-creator workflow skill"`). Workflow skills say: "Load the `course-curriculum-creator:course-conventions` skill first."
  - `skills-lint.test.ts` with an exported-in-file array `LINTED` of paths relative to `plugins/course-curriculum-creator`. This task sets `LINTED = ['skills/course-conventions', 'skills/course-kit']`. Tasks 7–11 add their folders to it.

`course-conventions/SKILL.md` has these sections, in this order:
1. **Toolkit.** The call form `KIT` = `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`. Node 20 or later is necessary; if `node` is not available, stop and tell the user.
2. **Settings.** The one list of all eleven core settings, each as `` `name` = `${user_config.name}` (default …) `` with its use, copied from the current `create-course` block plus `rubric_scale`, `rubric_type`, `template_directory`, `brand_config`. Keep the override rule: a project `.claude/course-curriculum-creator.local.md` YAML frontmatter overrides these values; an empty value or a literal `${user_config.…}` placeholder means "not set — use the default". State that `default_duration` applies only to the workshop shape.
3. **course.yaml is necessary.** Before a skill reads or writes course files, run `KIT manifest validate --course "<dir>"`. If `course.yaml` is missing: stop; if the folder has `01-planning/course-positioning.md`, offer `/course-curriculum-creator:migrate-course`; else offer `/course-curriculum-creator:create-course`. Do not write `course.yaml` by hand. On exit 2, show the errors and stop.
4. **Shape and time budget.** Run `KIT manifest summary --course "<dir>"`. Use its `shape`, `sessions`, `liveMinutes`, `asyncMinutes` and `rules` for every duration decision. Never assume "1 or 2 days". Apply every line in `rules`. For each shape, say where the time comes from: workshop and cohort → `sessions[].minutes`; self-paced → `asyncMinutes` and module `minutes`.
5. **IDs and heading formats.** IDs `LO-n`, `Mn`, `Sn`; the `<!-- id: X -->` comment on the line after the heading; never edit or remove an ID comment by hand. The heading formats that the toolkit reads: objectives `### Objective N: Title` with `**Cognitive Level:** Level`, `### Affective Objective X: Title`, `### Integration Objective N: Title`, `## Level 0: Title`; outline sessions `## Day N: …` (workshop), `## Session N: …` (cohort, one heading for each session), no session headings (self-paced); modules `### Module N: Title (NN min)`, and in self-paced `### Module N: Title (est. NN min)`; module bodies name objectives as `Objective N`. After a skill writes objectives or the outline, run `KIT manifest sync --course "<dir>" --write`.
6. **Staleness.** Before you regenerate an output: `KIT stale <output> --course "<dir>"`; if `stale`, tell the user which sources changed (`changed`) and that regeneration includes those changes. After you write an output: `KIT hash-write <output> --course "<dir>" --sources '{"<key>":"<path>",…}'` with the source files the skill read. Never compute hashes with shell commands.
7. **Progress.** After a skill writes its output, run `KIT progress --course "<dir>" --write`, and tell the user the `next` stage (its skill name) when there is one. To leave out an optional stage for good: `KIT progress skip <stage> --course "<dir>"`.
8. **Questions.** One style for all skills: use AskUserQuestion for every choice the user must make; ask only for values that the arguments, `course.yaml` and settings do not give; at most 4 questions in one call; put the recommended option first with "(Recommended)"; when the user says "do not ask" or the run is non-interactive, use the defaults and state them in the final message.
9. **Accessibility.** Course materials meet WCAG 2.2 AA; see `universal-design-for-learning/references/accessibility-specifications.md`.

`skills/course-kit/SKILL.md`: add the new commands with one line each: `manifest summary`, `progress`, `progress skip|unskip`, `audit`, `hash-write --sources`; update the `migrate-course` line (new questions, `changes`). Add one line at the top: "Workflow rules for using these commands are in the `course-conventions` skill."

Lint rules in `skills-lint.test.ts` (each rule is one `test`, run over every `.md` file under each `LINTED` path):
- `no md5sum`: no file contains `md5sum`.
- `settings only in course-conventions`: no file other than `skills/course-conventions/SKILL.md` contains `${user_config.`.
- `workflow skills load course-conventions`: every `workflow/**/SKILL.md` file under a linted path contains `course-curriculum-creator:course-conventions`.
- `workflow skills keep disable-model-invocation`: every `workflow/**/SKILL.md` under a linted path has `disable-model-invocation: true` in its frontmatter.
- `no fixed 1-2 day duration`: no `SKILL.md` or agent file contains a match for `/1-2[ -]day/i`, `/1-day or 2-day/i` or `/1-day vs 2-day/i`. (Files under `examples/` and `references/` are not checked by this rule.)
- `course-conventions has all settings`: `skills/course-conventions/SKILL.md` contains `${user_config.<key>}` for every key in `plugins/course-curriculum-creator/.claude-plugin/plugin.json` `userConfig`.

- [ ] **Step 1: Write the lint test** with `LINTED = ['skills/course-conventions', 'skills/course-kit']`.

- [ ] **Step 2: Run it and make sure it fails** (`npm test -- skills-lint`; `course-conventions` does not exist).

- [ ] **Step 3: Write `course-conventions/SKILL.md` and update `course-kit/SKILL.md`.**

- [ ] **Step 4: Run all tests and validate the plugin**

Run: `npm test && claude plugin validate plugins/course-curriculum-creator`
Expected: tests pass; `Validation passed`.

- [ ] **Step 5: Commit**

```bash
git add plugins/course-curriculum-creator/skills packages/course-kit/test/skills-lint.test.ts
git commit -m "feat(core): course-conventions skill and skills lint test"
```

---

### Task 7: Refactor the analysis, objectives and assessment skills

**Files:**
- Modify: every `SKILL.md` under `plugins/course-curriculum-creator/workflow/0-analysis/`, `workflow/1-desired-results/`, `workflow/2-assessment-evidence/`
- Modify: `packages/course-kit/test/skills-lint.test.ts` (add the three folders to `LINTED`)

**Interfaces:**
- Consumes: `course-conventions` sections (Task 6); `manifest init` with `async` (Task 1); `manifest summary`, `progress`, `hash-write --sources`.

Rules for every skill in this task (and Tasks 8–9):
- Replace the "Settings Integration" block with one line: "Settings: see `course-conventions` (uses `<the setting names this skill uses>`)."
- Replace each "Staleness Check" block with: "Staleness: follow `course-conventions` §Staleness. Output: `<output path>`. Sources: `<key>` = `<path>`, …" Keep the same source files that the old block named.
- Add "Load the `course-curriculum-creator:course-conventions` skill first." as the first line of the command behaviour, and the course.yaml check (except the five skills named in Global Constraints).
- Replace fixed "1-day / 2-day" logic with the time budget from `manifest summary`. Keep workshop numbers as workshop examples where they help, labelled as workshop.
- End with the progress step from `course-conventions` §Progress.
- Make questions follow `course-conventions` §Questions. Do not change the pedagogy text.

Skill-specific changes:
- `create-course`: ask the shape first (default `default_shape`). Workshop: duration from `--duration` or `default_duration` (1-day = one 420-minute session `Day 1`; 2-day = two). Cohort: ask the number of sessions (default 6) and minutes for each (default 90); labels `Session k`; ask between-session minutes (default 60). Self-paced: no sessions; ask total learner hours (default 4) and write it to the positioning frontmatter as `estimatedHours`; pass `async` = `{preWorkMinutes: 30, betweenSessionMinutes: 0, postWorkMinutes: 0}` to `manifest init` (module minutes carry the rest of the time). Workshop and cohort: pass `async` = `{preWorkMinutes: 60, betweenSessionMinutes: <cohort answer, else 0>, postWorkMinutes: 90}`. Change `--duration` in `argument-hint` to `[--shape workshop|cohort|self-paced] [--duration 1-day|2-day] [--sessions N] [--session-minutes N]`. The positioning frontmatter gets `shape:` and, for workshops, `duration:`.
- `design-series`: each course in a series has its own shape; the series file records it.
- `generate-objectives`: the number of objectives comes from total time (`liveMinutes` + `asyncMinutes.total`): about one objective for each 60–90 minutes, 3 at least, 10 at most. Keep the existing level-mix guidance.
- `generate-rubrics`: for `self-paced`, write auto-checkable criteria or self-assessment with model answers (rule from `rules`).
- `generate-evaluation-plan`, `assess-needs`, `generate-learner-profile`: shape-neutral wording; no other change.
- `migrate-course` was changed in Task 4; only add it to the lint scope.

- [ ] **Step 1: Add the three folders to `LINTED` and run the lint test**

Run: `npm test -- skills-lint`
Expected: FAIL (the skills still have settings blocks and `md5sum`).

- [ ] **Step 2: Edit the skills.**

- [ ] **Step 3: Run the lint test, all tests and the plugin validator**

Run: `npm test && claude plugin validate plugins/course-curriculum-creator`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add plugins/course-curriculum-creator/workflow packages/course-kit/test/skills-lint.test.ts
git commit -m "refactor(core): analysis, objectives and assessment skills use course-conventions and shapes"
```

---

### Task 8: Refactor the learning-plan and materials skills

**Files:**
- Modify: every `SKILL.md` under `workflow/3-learning-plan/` and `workflow/4-materials/`
- Modify: `packages/course-kit/test/skills-lint.test.ts` (add both folders)

Apply the rules from Task 7. Skill-specific changes:
- `generate-outline`: write the outline in the heading formats of `course-conventions` §IDs for the course shape. Workshop: `## Day N` sections. Cohort: one `## Session N: Title` section for each session in `manifest summary`, each opening with a retrieval segment and ending with a "Between sessions" segment (assignment + discussion prompts). Self-paced: a `## Modules` section with `### Module N: Title (est. NN min)` and no session headings; every module ends with a practice-and-feedback segment. Module minutes in one session must not be more than the session minutes. Then `manifest sync --write` (already there) and `manifest validate`; fix the outline if validate gives time-budget warnings.
- `generate-lesson-plans`: cohort — one plan section for each session with facilitator notes, a retrieval opener and the between-session assignment; self-paced — each module plan has worked examples, faded practice, an end-of-module check with feedback, and time-on-task estimates for each activity.
- `generate-pre-work`: the pre-work time is `asyncMinutes.preWork`. Cohort: also write between-session work for each session gap, inside `asyncMinutes.betweenSessions`.
- `generate-transfer-plan`: shape-neutral wording.
- `adapt-for-virtual`: works for workshop and cohort; for self-paced, stop and say that a self-paced course is already asynchronous.
- `generate-artifacts`, `generate-description`: shape-neutral wording; the description states the shape and the time (sessions × minutes, or estimated hours).

- [ ] **Step 1: Add the folders to `LINTED`; run the lint test** — expected FAIL.
- [ ] **Step 2: Edit the skills.**
- [ ] **Step 3: Run** `npm test && claude plugin validate plugins/course-curriculum-creator` — expected all pass.
- [ ] **Step 4: Commit**

```bash
git add plugins/course-curriculum-creator/workflow packages/course-kit/test/skills-lint.test.ts
git commit -m "refactor(core): learning-plan and materials skills use course-conventions and shapes"
```

---

### Task 9: Refactor the review, delivery and template skills

**Files:**
- Modify: every `SKILL.md` under `workflow/5-quality-and-review/`, `workflow/6-delivery/`, `workflow/7-templates/`
- Modify: `packages/course-kit/test/skills-lint.test.ts` (add the three folders)

Apply the rules from Task 7. Skill-specific changes:
- `review-curriculum`: first run `KIT audit --course "<dir>"`; put every audit issue in the report under "Automated checks", grouped by `check`; errors must be fixed before the review says the course is ready. Then the existing pedagogical review.
- `generate-review-package`, `export-curriculum`: include `course.yaml` and the audit result; shape-neutral wording.
- `generate-spaced-practice`: the schedule starts after the last live session (workshop, cohort) or after each module (self-paced). Cohort: put spaced retrieval items into the session openers too.
- `generate-workshop-prep`: for self-paced, stop and say there is no live session to prepare; for cohort, one checklist for each session.
- `process-workshop-feedback`: shape-neutral wording.
- `save-as-template`: the template copies `course.yaml` with `id`, `title`, `created` and `targets` cleared. `create-from-template`: it writes `course.yaml` from the template with the new title through `manifest init --force` values + the template's objectives and modules, then runs `manifest sync --write` and `manifest validate`. `list-templates`: show each template's shape.

- [ ] **Step 1: Add the folders to `LINTED`; run the lint test** — expected FAIL.
- [ ] **Step 2: Edit the skills.**
- [ ] **Step 3: Run** `npm test && claude plugin validate plugins/course-curriculum-creator` — expected all pass.
- [ ] **Step 4: Commit**

```bash
git add plugins/course-curriculum-creator/workflow packages/course-kit/test/skills-lint.test.ts
git commit -m "refactor(core): review, delivery and template skills use course-conventions and shapes"
```

---

### Task 10: Resumable architect and upgraded quality reviewer

**Files:**
- Modify: `plugins/course-curriculum-creator/agents/curriculum-architect.md`, `plugins/course-curriculum-creator/agents/quality-reviewer.md`
- Modify: `packages/course-kit/test/skills-lint.test.ts` (add `agents`)

Both agents:
- Remove the `model:` line from the frontmatter (spec §8 item 4: "Drop the `model: sonnet` pin (inherit)").
- Remove the settings block. Load `course-curriculum-creator:course-conventions` with the Skill tool at the start (its content has the settings, filled in).
- Shape-neutral description and text.

`curriculum-architect`:
- New description: `"Designs a complete course (workshop, cohort or self-paced) end to end using backward design, one stage at a time, and can stop and resume. Use when the user wants a whole course built or wants to continue one; if the topic, shape or audience is missing, ask before delegating."`
- Process: (1) If there is no course folder, run the `create-course` steps (read its SKILL.md) with the user's values. (2) Loop: run `KIT progress --course "<dir>"`; if `next` is `null`, go to step 3; else read `${CLAUDE_PLUGIN_ROOT}/<next.skill>` and do that stage; then `KIT progress --course "<dir>" --write`. Stop after a stage when the user asked to stop after it, or after 4 stages in one run, and say which stage is next and that a new run continues from there. (3) Run `KIT audit --course "<dir>"` and report.
- Keep the pedagogical guidance that is still true. Remove timing rules that assume 1–2 days; use `manifest summary`.

`quality-reviewer`:
- First step: `KIT manifest validate` and `KIT audit --course "<dir>"`. Report every audit issue.
- Add checks to the report: manifest integrity (validate result), media alignment (audit `media-links`, `udl-representation`), accessibility of assets (audit `media-alt`, `media-long-description`; WCAG 2.2 AA), shape rules (every line of `manifest summary` `rules` is visible in the outline and lesson plans).
- Keep the existing pedagogical checks.

- [ ] **Step 1: Add `agents` to `LINTED`; run the lint test** — expected FAIL (settings blocks, 1-2 day text).
- [ ] **Step 2: Edit both agents.**
- [ ] **Step 3: Run** `npm test && claude plugin validate plugins/course-curriculum-creator` — expected all pass.
- [ ] **Step 4: Commit**

```bash
git add plugins/course-curriculum-creator/agents packages/course-kit/test/skills-lint.test.ts
git commit -m "refactor(core): resumable architect and audit-based quality reviewer"
```

---

### Task 11: Knowledge skills: shape-neutral time and WCAG 2.2 AA

**Files:**
- Modify: `plugins/course-curriculum-creator/skills/{blooms-taxonomy,backward-design-methodology,universal-design-for-learning,virtual-facilitation}/SKILL.md` and their `references/` files where they name WCAG 2.1 or fixed durations
- Modify: `plugins/course-curriculum-creator/skills/universal-design-for-learning/references/accessibility-specifications.md`
- Modify: `packages/course-kit/test/skills-lint.test.ts` (add the four skill folders; add rule `WCAG 2.2`)

Changes:
- Time guidance becomes "per hour of learner time" or "per session", with workshop numbers kept as examples labelled as workshop. Add one short paragraph for cohort and one for self-paced where the skill gives time guidance (from `SHAPE_RULES`).
- `accessibility-specifications.md`: target WCAG 2.2 AA. Add the WCAG 2.2 AA success criteria that are new in 2.2: 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum) (24 by 24 CSS pixels), 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication (Minimum). State that 4.1.1 Parsing is obsolete in 2.2. Give each a one-line meaning for course materials (handouts, slides, the future hub).
- New lint rule `WCAG 2.2`: no linted file contains `WCAG 2.1` except in a sentence that also contains `2.2` (a history note).

- [ ] **Step 1: Add the folders and the rule; run the lint test** — expected FAIL.
- [ ] **Step 2: Edit the files.**
- [ ] **Step 3: Run** `npm test && claude plugin validate plugins/course-curriculum-creator` — expected all pass. Also run `grep -rn "WCAG 2.1" plugins/` — expected: only history notes.
- [ ] **Step 4: Commit**

```bash
git add plugins/course-curriculum-creator/skills packages/course-kit/test/skills-lint.test.ts
git commit -m "docs(core): shape-neutral time guidance and WCAG 2.2 AA"
```

---

### Task 12: Evals for the workshop pipeline

**Files:**
- Create: one folder for each case under `plugins/course-curriculum-creator/evals/`
- Modify: the two existing core cases if the refactor changed what they check

Follow the format of the existing cases: `prompt.md` (frontmatter `max_turns`, `allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, AskUserQuestion]`), optional `case.yaml` with `scaffold_script: scaffold.sh`, `scaffold.sh` that copies a fixture, and `graders/*.md` of the types already used in this repository (`regex`, `tool_used`, `file_exists`, `llm`). Each scaffold copies `examples/courses/workshop/` into `./course` (resolve the path from the script location: `"$here/../../examples/courses/workshop/."`). Every prompt ends with "Do not ask questions; use defaults."

Cases (one per required workshop stage; each has a `tool_used` grader for `hash-write` and one for `progress`, a `regex`/`file_exists` grader for the output, and the listed extra grader):
| case | prompt runs | extra grader |
|---|---|---|
| `learner-profile-workshop` | `/course-curriculum-creator:generate-learner-profile` | `file_exists` `course/01-planning/learner-profile.md` |
| `objectives-workshop` | `generate-objectives --update` | `tool_used` `manifest sync` |
| `rubrics-workshop` | `generate-rubrics` | `regex` `course/03-assessment/rubrics.md` has `sourceHashes:` |
| `outline-workshop` | `generate-outline --update` | `regex` outline has `<!-- id: M1 -->`; `tool_used` `manifest validate` |
| `lesson-plans-workshop` | `generate-lesson-plans` | `regex` lesson plans has `<!-- id: M1 -->` |
| `pre-work-workshop` | `generate-pre-work` | `file_exists` `course/04-materials/pre-work.md` |
| `description-workshop` | `generate-description` | `llm`: the description states the shape (workshop) and the time |
| `spaced-practice-workshop` | `generate-spaced-practice` | `file_exists` `course/04-materials/spaced-practice.md` |
| `review-runs-audit` | `review-curriculum` | `tool_used` `audit` |
| `no-manifest-offers-migrate` | `generate-rubrics` on a copy with `course.yaml` deleted (no `hash-write`/`progress` graders for this case) | `llm` only: PASS if it did not create `course.yaml` and offered `/course-curriculum-creator:migrate-course` |

For stages that need earlier outputs (rubrics need objectives; lesson plans need an outline and rubrics), the sample already has objectives and an outline. For `lesson-plans-workshop`, the prompt first runs `generate-rubrics` and then `generate-lesson-plans`, with `max_turns: 60`.

- [ ] **Step 1: Write the cases.**
- [ ] **Step 2: Check them**

Run: `claude plugin validate plugins/course-curriculum-creator` and, for each case, `bash -n <case>/scaffold.sh`. Then run every scaffold in a temp folder and check that `./course/course.yaml` exists.
Expected: validation passes; every scaffold makes `./course/course.yaml`.

- [ ] **Step 3: Try to run the evals**

Run: `claude plugin eval plugins/course-curriculum-creator` (with the flags that the Phase 1 manual-tests file uses). If the sandbox tools (bubblewrap, socat) are missing, record "NEEDS USER" for this step in the report. Do not install system packages.

- [ ] **Step 4: Commit**

```bash
git add plugins/course-curriculum-creator/evals
git commit -m "test(core): evals for the workshop pipeline"
```

---

### Task 13: Evals for cohort, self-paced, migration and the architect

**Files:**
- Create: case folders under `plugins/course-curriculum-creator/evals/`

Cases:
| case | fixture | prompt | graders |
|---|---|---|---|
| `create-course-cohort` | none | `create-course "Underwriting Lab" --shape cohort --sessions 4 --session-minutes 90 --location .` then `manifest summary` | `regex` `**/course.yaml` has `shape: cohort`; `llm`: summary reports 4 sessions of 90 minutes |
| `create-course-self-paced` | none | `create-course "Cap Rates" --shape self-paced --location .` | `regex` `**/course.yaml` has `shape: self-paced` and no `live:` (`match: "count:0"` on `live:`) |
| `outline-cohort` | `examples/courses/cohort` | `generate-outline --update` | `regex` outline has `## Session 4`; `tool_used` `manifest validate`; `llm`: every session opens with retrieval and has a between-sessions segment |
| `outline-self-paced` | `examples/courses/self-paced` | `generate-outline --update` | `regex` outline has `(est. ` and no `## Day `; `llm`: every module ends with practice and feedback |
| `migrate-cre-201` | copy of `packages/course-kit/test/fixtures/CRE-201` — copy it into `evals/migrate-cre-201/fixture/` (plugins cannot read outside their root at run time) | `migrate-course ./cre-201`, answering alt text and objectives with sensible values | `tool_used` `migrate-course`; `regex` `cre-201/course.yaml` has `shape: cohort`; `file_exists` `cre-201/05-media/registry.json`; `tool_used` `audit` |
| `architect-resumes` | workshop sample | "Use the curriculum-architect agent to continue this course. Stop after one stage." | `tool_used` `progress`; `llm`: it ran the learner profile stage only and named the next stage |

- [ ] **Step 1: Write the cases.**
- [ ] **Step 2: Check them** — same checks as Task 12 Step 2.
- [ ] **Step 3: Try to run them** — same rule as Task 12 Step 3.
- [ ] **Step 4: Commit**

```bash
git add plugins/course-curriculum-creator/evals
git commit -m "test(core): evals for cohort, self-paced, migration and architect resume"
```

---

### Task 14: Release core v3.0.0

**Files:**
- Modify: `plugins/course-curriculum-creator/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `README.md`, `plugins/course-curriculum-creator/examples/course-curriculum-creator.local.md`, `docs/superpowers/plans/2026-10-31-v3-phase1-manual-tests.md` (add Phase 2 manual items)
- Create: `CHANGELOG.md` at the repository root if it does not exist

Changes:
- `plugin.json`: `"version": "3.0.0"`; description `"Design blended courses (workshop, cohort, self-paced) using backward design and Bloom's taxonomy"`; keywords add `cohort`, `self-paced`; `default_duration` description `"Workshop length used when create-course is not given --duration (workshop shape only)"`.
- `README.md`: a "v3 upgrade" section: v3 skills need `course.yaml`; run `/course-curriculum-creator:migrate-course <folder>` on each v2 course; what migration writes; shapes; `course-conventions`; the toolkit commands `manifest summary`, `progress`, `audit`. Keep the existing companion and studio sections.
- `CHANGELOG.md`: a `3.0.0` entry with "Breaking", "Added", "Changed" lists from this plan.
- Manual tests file: add "Phase 2" items: run the evals (needs bubblewrap and socat); run `create-course` for cohort and self-paced in Claude Code and check `manifest validate`; migrate the real CRE-201 repository folder (not the fixture) on a copy.

- [ ] **Step 1: Make the changes.**
- [ ] **Step 2: Run the full check**

Run: `npm test && (cd packages/course-kit && npx tsc --noEmit -p .) && npm run check && claude plugin validate plugins/course-curriculum-creator && claude plugin validate plugins/course-studio && claude plugin validate .`
Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add -A plugins/course-curriculum-creator .claude-plugin README.md CHANGELOG.md docs/superpowers/plans
git commit -m "release(core): v3.0.0"
```
