# Phase 1 manual tests (core 2.1.0, course-studio 0.1.0)

`KIT` = `node plugins/course-studio/skills/course-kit/scripts/course-kit.mjs`. Items 1, 4 and 6 were run on 2026-10-31 by driving the toolkit CLI directly (standing in for the skills). Items 2, 3, 5 and the plugin evals need the user's own accounts or system packages and are marked NEEDS USER.

## 1. Zero MCPs, no Codex, no key (v2-sample copy)

1. `cp -r packages/course-kit/test/fixtures/v2-sample /tmp/c1 && cd /tmp/c1`
2. `KIT manifest sync --course . --write`. Expect `course.yaml` with LO-1..LO-4 and M1..M4, `media.budgetUsd: 20`.
3. Write `05-media/style/theme.yaml` (name, primary colour, fonts) and run `KIT style tokens --course .`. Expect `tokens.json`, no contrast errors. Write `05-media/style/prompt-anchors.md`.
4. Create `02-design/lesson-plans.md` with `## Module 1:` and `## Module 2:` headings and run `manifest sync --write`. Expect `<!-- id: M1 -->` under each heading.
5. Write `05-media/media-plan.yaml` with three approved items: `A-M1-01` (diagram, svg), `A-M2-01` (chart, vegalite), `A-M2-02` (image, codex). Run `KIT plan validate` (exit 0) and `KIT plan estimate --quality standard` (expect totalQuota 1, totalUsd 0).
6. `KIT render vegalite 05-media/src/A-M2-01.vl.json 05-media/out/A-M2-01.svg --tokens 05-media/style/tokens.json`. Expect exit 0 and an SVG.
7. `KIT render mermaid ...` with no mermaid-cli. Expect the "mermaid-cli is not installed" error (exit 4); author `05-media/out/A-M1-01.svg` by hand (skill fallback 4).
8. `KIT registry add` both (status `generated`, empty alt).
9. With no Codex login (empty `HOME`) and no key: `KIT gen image --course . --asset A-M2-02 --provider codex --quality standard`. Expect exit 4 and `ledger totals` = 0 spent, 0 quota.
10. `KIT registry update <id> --json '{"alt":...}'` for both, then `KIT registry status <id> approved --approved-by user`.
11. `KIT embed all --course .`. Expect A-M1-01 and A-M2-01 embedded, A-M2-02 a "Media pending approval" placeholder; a second run changes nothing.

Result: **PASS**. Evidence: every step behaved as expected. `plan estimate` returned `{"M1":{usd 0,quota 0},"M2":{usd 0,quota 1}}`; chart rendered to a 6.7 KB SVG; mermaid-cli absent gave the not-installed error and the hand SVG was used; `gen image` exit 4 with `ledgerTotals` `{"spentUsd":0,"quotaUsed":0}`; `embed all` returned `{"embedded":["A-M1-01","A-M2-01"],"placeholders":["A-M2-02"]}` and lesson-plans.md shows two `![alt](../05-media/out/...svg)` blocks (one with caption) and one `> **Media pending approval (A-M2-02)**` block. Prompt file `A-M2-02.prompt.txt` ends with "No text, letters, numbers, logos, or watermarks anywhere in the image." Note: the ledger file is not literally empty after the refused Codex call. It holds a `reserve` line immediately followed by a `release` line (net spend 0), because the provider failure happens after the reservation. The skills themselves (Claude driving this sequence) were not run; the evals in item 7 cover that.

## 2. Codex logged in, one image item

1. In a course with an approved `kind: image`, `provider: codex` item and a style guide, run `codex login status` (expect logged in), then `KIT gen image --course <dir> --asset <id> --provider codex --quality standard`.
2. Expect exit 0, a PNG at `05-media/out/<id>.png`, a ledger `commit` line with `quotaUnits: 1`, and `05-media/src/<id>.prompt.txt` ending with the no-text rule.

Result: **NEEDS USER**. Not run: spends the user's ChatGPT plan quota (real Codex generation was out of scope).

## 3. Excalidraw connector, hand-drawn style

1. Connect the Excalidraw connector in Claude Code, set `preferred_diagram_style: hand-drawn`, plan an approved diagram item, run `/course-studio:generate-media`.
2. Expect `05-media/src/<id>.excalidraw`, a share URL in the registry asset (`shareUrl`), and `05-media/out/<id>.svg` (local renderer may first need `KIT deps install excalidraw`).

Result: **NEEDS USER**. Requires connector authentication.

## 4. Budget cap with OpenAI provider

1. Copy of the item-1 course, set `media.budgetUsd: 0.01`, change the image item to `provider: openai`.
2. `OPENAI_API_KEY=dummy HTTPS_PROXY=http://127.0.0.1:9 HTTP_PROXY=http://127.0.0.1:9 KIT gen image --course . --asset A-M2-02 --provider openai --quality high`. Expect exit 3, no network call, no ledger line.

Result: **PASS**. Output `{"error":"Budget exceeded: cap $0.01, spent $0.00, request $0.21"}`, exit 3; `.course/cost-ledger.jsonl` was not created; `ledger totals` = 0/0. The unroutable proxy would have failed any attempted call differently (exit 4), so the budget check ran first.

## 5. Cowork session (local computer)

1. In Cowork on the local computer, install both plugins, run `/course-studio:setup` and `/course-studio:plan-media` on a v2-sample copy.
2. Expect `${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs` to resolve, and the `course-media` server to load with no key and report "not configured". If `${CLAUDE_PLUGIN_ROOT}` does not resolve in Cowork, record it and open an issue before release.

Result: **NEEDS USER**. Requires a Cowork session.

## 6. migrate-course on a CRE-201 copy

1. `cp -r packages/course-kit/test/fixtures/CRE-201 /tmp/c6`
2. `KIT migrate-course --course /tmp/c6 --dry-run`. Expect shape `cohort`, 4 sessions, 2 questions (`alt:IMG-bmc`, `alt:IMG-vpd`), nothing written.
3. `KIT migrate-course --course /tmp/c6 --answers '{"alt:IMG-bmc":"...","alt:IMG-vpd":"..."}'`. Expect `course.yaml` and `05-media/registry.json` with two `imported` assets carrying the alt text.

Result: **PASS**. Dry run: shape `cohort`, 4 sessions (S1 to S4), questions `alt:IMG-bmc` and `alt:IMG-vpd`, imported `[IMG-bmc, IMG-vpd]`, folder unchanged (no `course.yaml`, no `05-media`). With answers: exit 0, `registry.json` has `IMG-bmc` and `IMG-vpd` with status `imported`, the supplied alt text and files `04-materials/bmc.png` / `vpd.png`; `manifest validate` returned no issues; a second run is accepted without error.

## 7. Plugin evals

Prerequisite: `sudo apt install bubblewrap socat`. Then:

```
claude plugin eval plugins/course-curriculum-creator --scaffold --allow-tools Write Edit Bash
claude plugin eval plugins/course-studio --scaffold --allow-tools Write Edit Bash
```

Expect all cases (core: 2, studio: 5) to pass.

Result: **NEEDS USER**. Needs system packages and spends the user's model quota. Evals for `plugins/course-studio` have an earlier run under `plugins/course-studio/evals/results/` that was not reviewed as part of this pass.

## Automated checks (run 2026-10-31)

| Command | Result |
| --- | --- |
| `npm test` | PASS: 16 files, 166 passed, 3 skipped |
| `npm run check` | PASS for bundles (rebuilt bundles are byte-identical); `git diff` only shows the README edits until they are committed |
| `claude plugin validate .` | PASS |
| `claude plugin validate plugins/course-curriculum-creator` | PASS |
| `claude plugin validate plugins/course-studio` | PASS |

## Release gate

Items 1, 4 and 6 pass. Items 2, 3, 5 and the evals are open and need the user before release.
