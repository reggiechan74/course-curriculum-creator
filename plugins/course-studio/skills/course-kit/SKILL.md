---
name: course-kit
description: "Deterministic course toolkit CLI for course-studio: hashing, manifest, media plan and registry, ledger, rendering, providers, brand and style tokens. Use when a course-studio workflow tells you to run course-kit."
user-invocable: false
---

# course-kit (studio)

A bundled Node CLI that does the deterministic work (hashes, IDs, budgets, rendering) so prose never has to.

## Call form

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" <command> --course "<dir>"
```

Always quote paths; course folders may contain spaces. Output is JSON on stdout.

## Commands

Core:

- `hash <file>`: print the 8-hex-character MD5 hash of a file.
- `stale <file> --course "<dir>"`: compare `sourceHashes` in the file's frontmatter with current source files; reports `fresh` or `stale` with the changed files, or `missing-output` when the file does not exist yet (a first generation).
- `hash-write <file> --course "<dir>" [--sources '{"key":"path"}']`: write `sourceFiles` (from `--sources`), then `sourceHashes`, into the file's frontmatter. A missing source or output file is exit 2. For `stale` and `hash-write`, a relative `<file>` and the `--sources` paths are relative to the course folder.
- `manifest init --course "<dir>" --json '<options>' [--force]`: create `course.yaml`. Refuses to overwrite without `--force`.
- `manifest validate --course "<dir>"`: validate `course.yaml`; exit 2 on errors.
- `manifest sync --course "<dir>" [--write]`: parse the objectives and outline markdown, assign stable IDs, update `course.yaml`; `--write` also writes `<!-- id: ... -->` comments into the objectives file and outline, and module ID comments (`## Module 1:` becomes `M1`) into `02-design/lesson-plans.md`, `04-materials/student-handout.md` and `04-materials/instructor-guide.md` when they exist. Safe to run repeatedly.
- `manifest summary --course "<dir>"`: print `{id,title,shape,delivery,sessions,liveMinutes,asyncMinutes,unscheduledModules,objectives,modules,rules}`; the time budget for the course.
- `progress --course "<dir>" [--write]`: print the workflow stages (`present`, `missing`, `stale` or `skipped`) and the `next` stage; `--write` saves them in `course.yaml`.
- `progress skip|unskip <stage> --course "<dir>"`: leave out an optional stage, or put it back.
- `audit --course "<dir>"`: check the course (manifest, objective coverage, stale outputs, media links, alt text, long descriptions, UDL representation); prints `{ok, issues, counts}`; exit 2 only if `course.yaml` is bad.
- `migrate-course --course "<dir>" [--dry-run] [--answers '<json>']`: migrate a v2 course folder: writes `course.yaml` (a new one gets the create-course async budget defaults), registers `.png`/`.jpg`/`.svg` files in `04-materials/` in the media registry as `imported`, and inserts ID comments. Prints `{manifest, actions, changes, questions, imported}`; `changes` lists each file as `create` or `modify` with `added` and `removed` line counts. `--dry-run` writes nothing. Answers are keyed by question id: `shape`, `delivery`, `sessionMinutes`, `objectives:<asset id>`, `alt:<id>`. Never moves or deletes files; a second run reports no actions.

Media plan and registry:

- `plan validate --course "<dir>"`: check `05-media/media-plan.yaml` (objective links, known IDs, functions); exit 2 on errors.
- `plan estimate --course "<dir>" --quality draft|standard|high [--data-dir "<dir>"]`: estimate cost per item and in total.
- `registry list --course "<dir>"`: list assets in `05-media/registry.json`.
- `registry add --course "<dir>" --json '<asset>'`: add an asset.
- `registry update <id> --course "<dir>" --json '{"alt":"…","longDescription":"…","caption":"…","files":["…"]}'`: set alt text, long description, caption and/or `files` (every key optional). `files` replaces the list; each path must be relative to the course folder and exist. Cannot change status; refused for approved assets.
- `registry status <id> <to> --course "<dir>" [--approved-by user] [--review '<json>']`: set status to `generated`, `approved`, `rejected` or `imported`. Only the user approves an asset. Allowed: generated or imported to approved or rejected; rejected to generated; approved to rejected (revokes the approval and clears `approvedBy`).

Embedding:

- `embed all --course "<dir>"`: write media blocks into `02-design/lesson-plans.md`, `04-materials/student-handout.md` and `04-materials/instructor-guide.md` (each only if it exists and has the module `<!-- id: Mx -->` comment). Approved assets get an image block (the asset's `*.overlay.svg` file when it has one, otherwise `files[0]`); everything else gets a "Media pending approval" placeholder. Output: `{files:[{file,embedded,placeholders}]}`. Safe to run again.
- `embed <file> --asset <id> --anchor <module-id> --course "<dir>"`: the same for one file; exit 2 if the anchor comment is missing.

Ledger and generation:

- `ledger totals --course "<dir>"`: spend and plan-image count so far.
- `ledger check --course "<dir>" --usd <n> --quota <n>`: exit 3 if the request would pass `media.budgetUsd` or `media.maxPlanImages`.
- `ledger reserve --course "<dir>" --asset <id> --provider <tool name> --usd <n> --quota <n>`: check the budget and reserve the estimate in one locked step; prints `{reservationId}`; exit 3 if it would pass a cap (nothing is written). Use it before calling a third-party paid image tool. `gen image` and `generate_image` reserve by themselves.
- `ledger settle --course "<dir>" --reservation <id> [--usd <actual>]`: record the spend of a reservation (default: the reserved estimate).
- `ledger release --course "<dir>" --reservation <id>`: cancel a reservation; only when the tool certainly did not bill (it refused before running, or was never called). A reservation can be settled or released once; again is exit 2.
- `gen image --course "<dir>" --asset <id> --provider codex|openai --quality draft|standard|high [--data-dir "<dir>"]`: generate one raster image from the registered prompt.

Rendering:

- `deps install mermaid-cli excalidraw-to-svg --data-dir "<dir>"`: install the optional renderers (use `${CLAUDE_PLUGIN_DATA}`). Exit 4 if npm fails (offline, npm missing).
- `render vegalite <spec.json> <out.svg> [--tokens <tokens.json>]`
- `render mermaid <src.mmd> <out.svg> --data-dir "<dir>" [--tokens <tokens.json>]` (`--data-dir` required; use `${CLAUDE_PLUGIN_DATA}`)
- `render excalidraw <scene.excalidraw> <out.svg> --data-dir "<dir>"` (`--data-dir` required)
- `render overlay <image> <labels.json> <out.svg> [--width n] [--height n] [--tokens <tokens.json>]`: SVG label overlay for raster images; the picture (PNG, JPEG, WebP or GIF) is embedded in the SVG as a `data:` URI, so the overlay shows image and labels in any markdown viewer and does not depend on where the image file sits. Width and height default to the PNG's own size (else 1024); `--width`/`--height` override. Name it `<id>.overlay.svg`. A file that is not an image exits 2. If the image is regenerated, run `render overlay` again.

Providers, brand and style:

- `providers probe-codex`: `{available, loggedIn, billing}`. `billing` is `plan` (signed in with ChatGPT), `api-key` (signed in with an API key) or `unknown`, read from `codex login status`. `gen image --provider codex` refuses with exit 4 unless `billing` is `plan`, because API-key use would be billed outside the ledger.
- `providers patterns`: the tool-name patterns from `data/providers.yaml`.
- `providers record --course "<dir>" --json '{"detectedAt":"<iso>","image":[],"diagram":[],"designSkills":[],"codex":{"available":false,"loggedIn":false,"billing":"unknown"}}'`: write `.course/providers.json`.
- `providers show --course "<dir>"`: read it back.
- `brand validate <file>`: validate a `*.brand.yaml` or `theme.yaml`.
- `style tokens --course "<dir>" [--brand <file>]`: derive `05-media/style/tokens.json` and check WCAG 2.2 AA contrast; exit 2 on failure. Without `--brand` it uses `brand` from `course.yaml`, then `05-media/style/theme.yaml`.

## course.yaml and freshness notes

- Top-level keys that the schema does not know (for example a hand-added `notes:`) are moved into `extra` the next time a command saves `course.yaml`. They are kept there, not lost.
- If the objectives or outline markdown file is missing, `manifest sync` keeps the objectives or modules already in `course.yaml` and reports a warning.
- `manifest sync` keeps the `minutes` and `label` of each session already in `course.yaml` (the outline's heading sums include breaks); only sessions new in the outline take the outline's minutes. Module minutes and session assignments come from the outline.
- `manifest sync --write`, `migrate-course`, `embed` and `embed all` write into source files (ID comments, media blocks). Outputs whose `sourceHashes` were fresh before are re-hashed after, so they stay fresh; outputs that were already stale stay stale.

## course-media MCP tools

The plugin runs a `course-media` MCP server with two tools:

- `generate_image({courseDir, assetId, quality?})`
- `estimate_cost({courseDir, quality?})`

Claude Code exposes them as `mcp__plugin_course-studio_course-media__generate_image` and `mcp__plugin_course-studio_course-media__estimate_cost`. `generate_image` uses the OpenAI key from the plugin settings (without one it returns "course-media is not configured") and applies the same budget rules as the CLI. `estimate_cost` spends nothing and needs no key. MCP results have no exit code: an error result whose text starts with `Budget exceeded` or `Plan image cap exceeded` is the same as exit 3.

## Budget, reservations and locks

A generation reserves its budget in `.course/cost-ledger.jsonl` before it calls a provider, then records the real cost. If a process crashes mid-generation, the open `reserve` line keeps counting as spent. Recovery: confirm that no generation is running, then delete that `reserve` line from the ledger. `.course/ledger.lock` is stale after 2 minutes and is then taken over.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | success |
| 1 | usage error |
| 2 | validation error |
| 3 | budget exceeded |
| 4 | provider not available |

## Rule

If `node` is not available, stop. Tell the user that Node 20 or later is necessary.
