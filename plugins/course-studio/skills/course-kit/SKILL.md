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
- `stale <file> --course "<dir>"`: compare `sourceHashes` in the file's frontmatter with current source files.
- `hash-write <file> --course "<dir>"`: recompute and write `sourceHashes` into the file's frontmatter.
- `manifest init --course "<dir>" --json '<options>' [--force]`: create `course.yaml`.
- `manifest validate --course "<dir>"`: validate `course.yaml`; exit 2 on errors.
- `manifest sync --course "<dir>" [--write]`: parse objectives and outline, assign stable IDs, update `course.yaml`. Without `--write` it is a read-only dry run; with `--write` it saves `course.yaml` and the ID comments. Running it again does not duplicate anything.

Media plan and registry:

- `plan validate --course "<dir>"`: check `05-media/media-plan.yaml` (objective links, known IDs, functions); exit 2 on errors.
- `plan estimate --course "<dir>" --quality draft|standard|high [--data-dir "<dir>"]`: estimate cost per item and in total.
- `registry list --course "<dir>"`: list assets in `05-media/registry.json`.
- `registry add --course "<dir>" --json '<asset>'`: add an asset.
- `registry update <id> --course "<dir>" --json '{"alt":"…","longDescription":"…","caption":"…"}'`: set alt text, long description and caption. Cannot change status; refused for approved assets.
- `registry status <id> <to> --course "<dir>" [--approved-by user] [--review '<json>']`: set status to `generated`, `approved`, `rejected` or `imported`. Only the user approves an asset.

Embedding:

- `embed all --course "<dir>"`: write media blocks into `02-design/lesson-plans.md`, `04-materials/student-handout.md` and `04-materials/instructor-guide.md` (each only if it exists and has the module `<!-- id: Mx -->` comment). Approved assets get an image block; everything else gets a "Media pending approval" placeholder. Output: `{files:[{file,embedded,placeholders}]}`. Safe to run again.
- `embed <file> --asset <id> --anchor <module-id> --course "<dir>"`: the same for one file; exit 2 if the anchor comment is missing.

Ledger and generation:

- `ledger totals --course "<dir>"`: spend and plan-image count so far.
- `ledger check --course "<dir>" --usd <n> --quota <n>`: exit 3 if the request would pass `media.budgetUsd` or `media.maxPlanImages`.
- `gen image --course "<dir>" --asset <id> --provider codex|openai --quality draft|standard|high [--data-dir "<dir>"]`: generate one raster image from the registered prompt.

Rendering:

- `deps install mermaid-cli excalidraw-to-svg --data-dir "<dir>"`: install the optional renderers (use `${CLAUDE_PLUGIN_DATA}`).
- `render vegalite <spec.json> <out.svg> [--tokens <tokens.json>]`
- `render mermaid <src.mmd> <out.svg> --data-dir "<dir>" [--tokens <tokens.json>]` (`--data-dir` required; use `${CLAUDE_PLUGIN_DATA}`)
- `render excalidraw <scene.excalidraw> <out.svg> --data-dir "<dir>"` (`--data-dir` required)
- `render overlay <image> <labels.json> <out.svg> [--width n] [--height n] [--tokens <tokens.json>]`: SVG label overlay for raster images; width and height default to 1024.

Providers, brand and style:

- `providers probe-codex`: report whether `codex` is installed and logged in.
- `providers patterns`: the tool-name patterns from `data/providers.yaml`.
- `providers record --course "<dir>" --json '{"detectedAt":"<iso>","image":[],"diagram":[],"designSkills":[],"codex":{"available":false,"loggedIn":false}}'`: write `.course/providers.json`.
- `providers show --course "<dir>"`: read it back.
- `brand validate <file>`: validate a `*.brand.yaml` or `theme.yaml`.
- `style tokens --course "<dir>" [--brand <file>]`: derive `05-media/style/tokens.json` and check WCAG 2.2 AA contrast; exit 2 on failure. Without `--brand` it uses `brand` from `course.yaml`, then `05-media/style/theme.yaml`.

## course-media MCP tools

The plugin runs a `course-media` MCP server with two tools:

- `generate_image({courseDir, assetId, quality?})`
- `estimate_cost({courseDir, quality?})`

Claude Code exposes them as `mcp__plugin_course-studio_course-media__generate_image` and `mcp__plugin_course-studio_course-media__estimate_cost`. The server uses the OpenAI key from the plugin settings and applies the same budget rules as the CLI.

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
